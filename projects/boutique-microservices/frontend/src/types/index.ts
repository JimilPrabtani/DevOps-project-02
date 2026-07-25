export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  brand?: string;
  inventory: number;
  inventory_quantity?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  discountPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
  images?: ProductImage[];
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AuthResponse {
  user: User;
  /** Short-lived access token. Held in memory only — never persisted. */
  token: string;
  /** e.g. "15m" — informational, so the UI can pre-emptively refresh. */
  expiresIn?: string;
  // NOTE: there is deliberately no refreshToken field. The refresh token is
  // delivered as an httpOnly cookie that JavaScript cannot read, so an XSS
  // cannot steal it.
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}