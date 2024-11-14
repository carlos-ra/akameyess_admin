export interface User {
  id: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  role: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  images: string[] | string | { [key: string]: string };
  category: string;
  sub_category: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  stock?: number;
  ali_express_link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  email?: string;
  total_amount: number;
  status?: string;
  shipping_address?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  items?: (OrderItem & { product: { title: string } })[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at?: string;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
  product?: Product;
  user?: User;
}

export interface CartGroupedByUser {
  user: User;
  items: CartItem[];
} 