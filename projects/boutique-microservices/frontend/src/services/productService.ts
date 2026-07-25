import apiClient from './api';
import { Product } from '../types';

const now = new Date().toISOString();

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    name: 'Solar Protect SPF 50 Biotech Lotion',
    description: 'Biotech ectoine & peptide infused invisible sunscreen formula designed for all skin tones with 0% white cast.',
    price: 85.00,
    originalPrice: 110.00,
    discountPercentage: 22,
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMUMxNTI4Ii8+CjHandlePjHGNpcmNsZSBjeD0iMjAwIiBjeT0iMTcwIiByPSI3MCIgZmlsbD0iI0ZGNUIyNCIgb3BhY2l0eT0iMC44NSIvPgo8cGF0aCBkPSJNMTYwIDI2MEgyNDBWMjgwSDE2MFYyNjBaIiBmaWxsPSIjRkZDMjRCIi8+Cjwvc3ZnPg==',
    category: 'accessories',
    brand: 'Sunfreaks Lab',
    inventory: 24,
    rating: 4.9,
    reviewCount: 38,
    isNew: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-2',
    name: 'Midnight Silk Evening Gown',
    description: 'Exquisite floor-length gown crafted from 100% mulberry silk with a flowing A-line silhouette.',
    price: 1899.00,
    originalPrice: 2200.00,
    discountPercentage: 14,
    imageUrl: '/images/dress.svg',
    category: 'clothing',
    brand: 'Chanel',
    inventory: 15,
    rating: 4.8,
    reviewCount: 12,
    isNew: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-3',
    name: 'Italian Wool Cashmere Coat',
    description: 'Sophisticated double-breasted coat crafted from premium Italian wool and cashmere blend.',
    price: 1299.00,
    originalPrice: 1500.00,
    discountPercentage: 13,
    imageUrl: '/images/coat.svg',
    category: 'clothing',
    brand: 'Gucci',
    inventory: 12,
    rating: 4.9,
    reviewCount: 8,
    isNew: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-4',
    name: 'Italian Leather Tote Bag',
    description: 'Spacious yet elegant tote bag crafted from full-grain Italian calfskin leather.',
    price: 899.00,
    originalPrice: 1050.00,
    discountPercentage: 14,
    imageUrl: '/images/crossbody.svg',
    category: 'bags',
    brand: 'Prada',
    inventory: 8,
    rating: 4.9,
    reviewCount: 20,
    isNew: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-5',
    name: 'Akoya Pearl Stud Earrings',
    description: 'Timeless stud earrings featuring perfectly round Akoya pearls with brilliant luster.',
    price: 799.00,
    imageUrl: '/images/earrings.svg',
    category: 'jewelry',
    brand: 'Hermès',
    inventory: 10,
    rating: 5.0,
    reviewCount: 25,
    isNew: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-6',
    name: 'French Silk Pleated Blouse',
    description: 'Elegant blouse featuring delicate pleating details crafted from premium French silk.',
    price: 599.00,
    imageUrl: '/images/blouse.svg',
    category: 'clothing',
    brand: 'Dior',
    inventory: 18,
    rating: 4.6,
    reviewCount: 15,
    isNew: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-7',
    name: 'Italian Leather Stiletto Heels',
    description: 'Elegant stiletto heels crafted from Italian patent leather.',
    price: 699.00,
    imageUrl: '/images/shoes.svg',
    category: 'shoes',
    brand: 'Versace',
    inventory: 8,
    rating: 4.6,
    reviewCount: 12,
    isNew: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-8',
    name: 'Ectoine Barrier Repair Serum',
    description: 'Concentrated biotech serum repairing UV photodamage and restoring natural lipid moisture.',
    price: 120.00,
    originalPrice: 150.00,
    discountPercentage: 20,
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMUMxNTI4Ii8+CjxwYXRoIGQ9Ik0xNzAgMTIwSDIzMFYyODBIMTcwVjEyMFoiIGZpbGw9IiM1RUVBRDQiIG9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMTkwIDgwSDIxMFYxMjBIMTkwVjgwWiIgZmlsbD0iI0ZGNUIyNCIvPgo8L3N2Zz4=',
    category: 'accessories',
    brand: 'Sunfreaks Lab',
    inventory: 30,
    rating: 4.85,
    reviewCount: 42,
    isNew: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-9',
    name: 'Mongolian Cashmere V-Neck Sweater',
    description: 'Luxurious V-neck sweater spun from the finest Mongolian cashmere.',
    price: 399.00,
    imageUrl: '/images/tshirt.svg',
    category: 'clothing',
    brand: 'Burberry',
    inventory: 25,
    rating: 4.9,
    reviewCount: 22,
    isNew: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-10',
    name: 'Beaded Evening Clutch Bag',
    description: 'Stunning evening clutch featuring thousands of hand-sewn crystal beads.',
    price: 449.00,
    imageUrl: '/images/crossbody.svg',
    category: 'bags',
    brand: 'Louis Vuitton',
    inventory: 12,
    rating: 4.7,
    reviewCount: 16,
    isNew: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-11',
    name: 'Hand-Painted Silk Scarf',
    description: 'Artisan hand-painted silk scarf featuring an abstract floral design.',
    price: 299.00,
    imageUrl: '/images/scarf.svg',
    category: 'accessories',
    brand: 'Hermès',
    inventory: 30,
    rating: 4.8,
    reviewCount: 18,
    isNew: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-12',
    name: 'Ballet Flats Lambskin Shoes',
    description: 'Comfortable yet chic ballet flats crafted from soft Italian lambskin leather.',
    price: 399.00,
    imageUrl: '/images/shoes.svg',
    category: 'shoes',
    brand: 'Prada',
    inventory: 18,
    rating: 4.8,
    reviewCount: 19,
    isNew: false,
    createdAt: now,
    updatedAt: now,
  },
];

const transformProduct = (product: any): Product => ({
  id: String(product.id),
  name: product.name,
  description: product.description,
  price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'),
  originalPrice: product.compare_price || product.originalPrice ? parseFloat(product.compare_price || product.originalPrice) : undefined,
  imageUrl: product.image_url || product.imageUrl || '/images/placeholder.svg',
  category: product.category || product.category_id || 'general',
  brand: product.brand || 'Sunfreaks',
  inventory: product.inventory_quantity ?? product.inventory ?? 10,
  rating: product.rating || 4.7,
  reviewCount: product.reviewCount || 15,
  isNew: Boolean(product.is_featured || product.new_arrival || product.isNew),
  discountPercentage: product.discountPercentage,
  createdAt: product.created_at || product.createdAt || now,
  updatedAt: product.updated_at || product.updatedAt || now,
});

export const productService = {
  getAll: async (): Promise<Product[]> => {
    console.log('[ProductService] Fetching products...');
    try {
      const response = await apiClient.get('/products');
      const apiResponse = response.data;
      
      let fetched: Product[] = [];
      if (apiResponse.success && apiResponse.data?.products) {
        fetched = apiResponse.data.products.map(transformProduct);
      } else if (Array.isArray(apiResponse)) {
        fetched = apiResponse.map(transformProduct);
      } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
        fetched = apiResponse.data.map(transformProduct);
      }

      if (fetched.length > 0) {
        return fetched;
      }
      
      console.log('[ProductService] API returned empty items, returning DEMO_PRODUCTS');
      return DEMO_PRODUCTS;
    } catch (error: any) {
      console.warn('[ProductService] API call failed or unavailable, using DEMO_PRODUCTS:', error?.message);
      return DEMO_PRODUCTS;
    }
  },

  getById: async (id: string): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      const product = response.data.data || response.data;
      if (product && product.id) {
        return transformProduct(product);
      }
      throw new Error('Product not found in API');
    } catch (error: any) {
      console.warn(`[ProductService] Fetching by ID ${id} from API failed, searching DEMO_PRODUCTS`);
      const found = DEMO_PRODUCTS.find(p => String(p.id) === String(id));
      if (found) {
        return found;
      }
      throw error;
    }
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    try {
      const all = await productService.getAll();
      return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
    } catch (error) {
      return DEMO_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
  },

  search: async (query: string): Promise<Product[]> => {
    try {
      const all = await productService.getAll();
      const q = query.toLowerCase();
      return all.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    } catch (error) {
      const q = query.toLowerCase();
      return DEMO_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
  },
};