export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Men' | 'Women' | 'Baby' | string;
  stock: number;
  image: string;
  rating: number;
  sizes: string[];
  colors: string[];
  createdAt: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  address?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  products: CartItem[];
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
