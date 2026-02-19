
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: 'Produtos' | 'Serviços';
  image_urls: string[];
  rating: number;
  rating_count: number;
  stock_quantity: number;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_email: string;
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  whatsapp_number: string;
  product_names: string;
  total_price: number;
  status: string;
  tracking_code?: string;
  last_location?: string;
  delivery_lat: number;
  delivery_lng: number;
  payment_method: string;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type View = 'welcome' | 'home' | 'details' | 'cart' | 'admin' | 'auth' | 'search' | 'profile';
