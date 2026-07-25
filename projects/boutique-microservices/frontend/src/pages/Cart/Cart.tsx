import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CardMedia,
  IconButton,
  Grid,
  Paper,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [removedItemName, setRemovedItemName] = useState('');

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const item = items.find(item => item.id === productId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity >= 1 && newQuantity <= item.inventory) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    setRemovedItemName(productName);
    setSnackbarOpen(true);
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <ShoppingBagIcon sx={{ fontSize: 64, color: '#FF5B24', mb: 2, opacity: 0.8 }} />
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
            Your Cart is Empty
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3.5, color: 'rgba(250, 244, 232, 0.6)' }}>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="medium"
            href="/products"
            sx={{ px: 3.5, py: 1, borderRadius: '12px' }}
          >
            Start Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  const subtotal = total;
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + shipping + tax;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
          Shopping Cart
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)', mb: 3 }}>
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </Typography>
        
        <Grid container spacing={3.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '20px',
                backgroundColor: 'rgba(28, 21, 40, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {items.map((item, index) => (
                <Box key={item.id}>
                  <Box sx={{ py: 2 }}>
                    <Grid container spacing={2.5} alignItems="center">
                      <Grid size={{ xs: 12, sm: 2.5 }}>
                        <CardMedia
                          component="img"
                          sx={{
                            height: 90,
                            objectFit: 'cover',
                            borderRadius: '12px',
                          }}
                          image={item.imageUrl || '/images/placeholder.svg'}
                          alt={item.name}
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 4.5 }}>
                        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.98rem' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.5)', display: 'block', mb: 0.5 }}>
                          Category: {item.category}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF5B24' }}>
                          ${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', p: 0.25, width: 'fit-content' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={item.quantity <= 1}
                            sx={{ color: '#FAF4E8' }}
                          >
                            <RemoveIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              px: 1.5,
                              fontWeight: 600,
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            disabled={item.quantity >= item.inventory}
                            sx={{ color: '#FAF4E8' }}
                          >
                            <AddIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        </Box>
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                            ${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                          </Typography>
                          <IconButton
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            size="small"
                            sx={{
                              color: 'rgba(230, 95, 142, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(230, 95, 142, 0.12)',
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  {index < items.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />}
                </Box>
              ))}
            </Paper>
            
            <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                href="/products"
                size="small"
                sx={{ borderRadius: '10px' }}
              >
                Continue Shopping
              </Button>
              <Button
                variant="outlined"
                onClick={clearCart}
                size="small"
                sx={{ borderRadius: '10px', color: '#E65F8E', borderColor: 'rgba(230, 95, 142, 0.3)' }}
              >
                Clear Cart
              </Button>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                position: 'sticky',
                top: 88,
                borderRadius: '20px',
                backgroundColor: 'rgba(28, 21, 40, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Order Summary
              </Typography>
              
              <Box sx={{ my: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.7)' }}>Subtotal:</Typography>
                  <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShippingIcon sx={{ fontSize: '0.95rem', color: '#FFC24B' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.7)' }}>Shipping:</Typography>
                  </Box>
                  <Typography variant="body2">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </Typography>
                </Box>
                
                {shipping > 0 && (
                  <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: 'rgba(250, 244, 232, 0.5)' }}>
                    Add ${(500 - subtotal).toFixed(2)} more for free shipping
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.7)' }}>Estimated Tax:</Typography>
                  <Typography variant="body2">${tax.toFixed(2)}</Typography>
                </Box>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FF5B24' }}>
                    ${finalTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                onClick={handleCheckout}
                fullWidth
                sx={{ mb: 2, py: 1.2, borderRadius: '12px' }}
              >
                Proceed to Checkout
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'center' }}>
                <SecurityIcon sx={{ fontSize: '0.9rem', color: 'rgba(250, 244, 232, 0.5)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.5)' }}>
                  Encrypted & Secure Checkout
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ borderRadius: '10px' }}>
          {removedItemName} removed from cart
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;