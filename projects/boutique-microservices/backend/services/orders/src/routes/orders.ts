/**
 * Order routes.
 *
 * SECURITY CHANGES vs. the previous implementation:
 *
 *  1. `GET /my-orders?userId=<anyone>` returned ANY user's full order history
 *     including shipping addresses. The user ID now comes from the verified
 *     token and the query parameter is ignored entirely.
 *  2. `POST /` accepted `userId` from the request body, letting a caller place
 *     orders on behalf of other people. Same fix.
 *  3. `PATCH /:id/status` was completely unauthenticated — anyone could mark
 *     any order "shipped" or "refunded". Now admin-only, with the status
 *     value constrained to a known set.
 *  4. Order creation now runs in a transaction, so a failure partway through
 *     cannot leave an order with missing line items.
 */

import express, { Request, Response } from 'express';
import axios from 'axios';
import { query, getPool } from '../database/connection';
import { Order, ServiceResponse } from '../types';
import { config } from '../config/env';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';

const router = express.Router();

// Every route below requires a verified token.
router.use(requireAuth);

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

const MAX_ITEMS_PER_ORDER = 50;
const MAX_QUANTITY_PER_ITEM = 100;

interface ValidatedItem {
  productId: string;
  quantity: number;
}

/**
 * Validates the incoming cart. Note what is NOT taken from the client: price.
 * Prices are always re-fetched from the product service so a tampered request
 * body cannot buy a $2000 coat for $1.
 */
function validateOrderItems(raw: unknown): ValidatedItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('At least one order item is required');
  }
  if (raw.length > MAX_ITEMS_PER_ORDER) {
    throw new Error(`An order may contain at most ${MAX_ITEMS_PER_ORDER} items`);
  }

  return raw.map((item, index) => {
    const productId = (item as any)?.productId;
    const quantity = (item as any)?.quantity;

    if (typeof productId !== 'string' || productId.trim() === '') {
      throw new Error(`Item ${index}: productId must be a non-empty string`);
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw new Error(
        `Item ${index}: quantity must be an integer between 1 and ${MAX_QUANTITY_PER_ITEM}`
      );
    }
    return { productId: productId.trim(), quantity };
  });
}

function validateShippingAddress(raw: unknown): Record<string, string> {
  const a = (raw ?? {}) as Record<string, unknown>;
  const requiredFields = ['street', 'city', 'state', 'zipCode', 'country'];
  const result: Record<string, string> = {};

  for (const field of requiredFields) {
    const value = a[field];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Shipping address: ${field} is required`);
    }
    if (value.length > 200) {
      throw new Error(`Shipping address: ${field} is too long`);
    }
    result[field] = value.trim();
  }
  return result;
}

// ---------------------------------------------------------------------------
// POST / — create an order for the AUTHENTICATED user
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;
  const pool = getPool();
  const client = await pool.connect();

  try {
    const items = validateOrderItems((req.body as any)?.items);
    const shippingAddress = validateShippingAddress((req.body as any)?.shippingAddress);

    // Authoritative pricing: fetched server-side, never read from the client.
    let totalAmount = 0;
    const pricedItems: { product_id: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const response = await axios.get(
        `${config.productsServiceUrl}/${encodeURIComponent(item.productId)}`,
        { timeout: 5000 }
      );
      const product = response.data?.data;

      if (!product || typeof product.price !== 'number') {
        throw new Error(`Product ${item.productId} is unavailable`);
      }

      totalAmount += product.price * item.quantity;
      pricedItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [user.sub, totalAmount, 'pending', JSON.stringify(shippingAddress), 'pending']
    );

    const order = orderResult.rows[0];
    const insertedItems: any[] = [];

    for (const item of pricedItems) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [order.id, item.product_id, item.quantity, item.price]
      );
      insertedItems.push({ ...item, id: itemResult.rows[0].id });
    }

    await client.query('COMMIT');

    const response: ServiceResponse<Order> = {
      success: true,
      data: {
        id: order.id,
        userId: order.user_id,
        items: insertedItems.map((item) => ({
          id: item.id,
          orderId: order.id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: order.total_amount,
        status: order.status,
        shippingAddress: shippingAddress as any,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      },
    };

    res.status(201).json(response);
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => undefined);

    // Validation problems are the caller's fault (400); everything else is ours.
    const isValidation =
      error?.message?.includes('required') ||
      error?.message?.includes('must be') ||
      error?.message?.includes('too long') ||
      error?.message?.includes('unavailable');

    if (isValidation) {
      return res.status(400).json({ success: false, error: error.message });
    }

    console.error('[orders] create failed:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// GET /my-orders — scoped to the caller's own identity
// ---------------------------------------------------------------------------
router.get('/my-orders', async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;

  try {
    // req.query.userId is deliberately NOT consulted. That parameter was the
    // entire IDOR: anyone could read anyone else's orders by changing it.
    const result = await query(
      `SELECT o.*,
              COALESCE(
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', oi.id,
                    'productId', oi.product_id,
                    'quantity', oi.quantity,
                    'price', oi.price
                  )
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 100`,
      [user.sub]
    );

    const response: ServiceResponse<Order[]> = { success: true, data: result.rows };
    res.json(response);
  } catch (error) {
    console.error('[orders] list failed:', error);
    res.status(500).json({ success: false, error: 'Failed to get orders' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — ownership enforced (admins may read any order)
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;

  try {
    const result = await query(
      `SELECT o.*,
              COALESCE(
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', oi.id,
                    'productId', oi.product_id,
                    'quantity', oi.quantity,
                    'price', oi.price
                  )
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [req.params.id]
    );

    const order = result.rows[0];

    // Same 404 whether the order is missing or simply not yours — a 403 here
    // would confirm that an order ID exists.
    if (!order || (order.user_id !== user.sub && user.role !== 'admin')) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('[orders] get failed:', error);
    res.status(500).json({ success: false, error: 'Failed to get order' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/status — admin only
// ---------------------------------------------------------------------------
router.patch('/:id/status', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { status } = (req.body ?? {}) as { status?: unknown };

    if (typeof status !== 'string' || !VALID_STATUSES.includes(status as any)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[orders] status update failed:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

export { router as orderRoutes };
