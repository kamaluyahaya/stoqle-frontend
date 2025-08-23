// src/types/index.ts
export type Product = {
  product_id: string;
  variant_id?: string | number | null; // 🔑 added
  name: string;
  category_id: number,
  price: number;
  image?: string;
  quantity?: number;
  discount?: number;
  barcode?: string;
  isDiscountPercentage?: boolean;
};

export type CartItem = Product & {
  quantity?: number; // repeat for clarity in cart
  discount?: number;
  isDiscountPercentage?: boolean;
  is_quick_sale?: 0 | 1;
  quick_meta?: Record<string, any> | null; // frontend accepts null but we will send {} to backend
  line_total?: number; // total for this line: unit_price * quantity - discount
};

export type Customer = {
  user_id: string | number;
  customer_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  date_added?: string | null;
};

export type User = {
  full_name?: string;
  email?: string;
  role?: string;
  profile_image?: string;
  business_name?: string;
  business_slug?: string;
  id?: string | number;
  business_id?: string | number;
};

export type Category = {
  category_id: string;
  category_name: string;
};

export type CurrentSale = {
  items: Product[];
  customer?: Customer | null;        // <- use app Customer shape
  store_id: string | number;
  metadata?: Record<string, any>;
};
