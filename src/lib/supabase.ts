import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Product {
  id: number;
  code: string;
  name: string;
  details: string;
  liters: number;
  price: number;
  image: string;
}

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: string;
  name: string;
  number: string;
  email: string;
  method: string;
  address: string;
  total_products: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface Message {
  id: number;
  user_id: string;
  name: string;
  email: string;
  number: string;
  message: string;
  is_read: boolean;
}

export interface MarbleReport {
  id: number;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  image: string;
  status: string;
  is_urgent: boolean;
  priority: string;
  admin_notes: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}
