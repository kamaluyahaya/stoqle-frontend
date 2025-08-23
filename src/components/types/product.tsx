export interface StoreInfo {
  store_id: number,
  store: string;
  store_name: string;
  qty: number;
  reorderLevel: number;
}

export interface ProductDetails {
  product_id: number | string;
  name: string;
  totalQuantity: number;
  costPrice: string;
  salePrice: string;
  category: string;
  lastUpdated: string;
  sku: string;
  stores: StoreInfo[];
}

export interface Product {
  product_id: number | string;
  barcode?: string | null;
  name?: string | null;
  category_id?: string | null;
  price?: number | string | null;
  currentStock?: number;
  stores?: { store_id: number; store_name?: string; quantity: number, low_stock_alert: number }[];
  last_updated?: string | null;
  image?: string | null;
  raw?: any;
  status?: 'draft' | 'active' | string;
}



export interface Category {
  category_id: string;
  category_name: string;
}
