
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  image_url: string;
  rating: number;
  rating_count: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type View = 'welcome' | 'home' | 'details' | 'cart' | 'admin' | 'auth';

export enum Category {
  Sneakers = 'Sneakers',
  Watches = 'Watches',
  Electronics = 'Electronics',
  Apparel = 'Apparel'
}
