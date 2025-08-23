// types.ts
export type RawImage =
  | string
  | {
      image_id?: number
      product_id?: number
      file_url?: string
      position?: number
      created_at?: string
      [key: string]: any
    }

export interface ApiProduct {
  product_id: number
  business_id: number
  category_id?: number | null
  product_name: string
  description?: string | null
  barcode?: string | null
  track_stock?: number | null
  price: string
  cost_price?: string | null
  has_variants: number
  status: string
  slug: string
  created_at: string
  category_name?: string | null
  business_name?: string | null
  business_slug?: string | null
  business_phone?: string | null
  business_address?: string | null
  business_status?: string | null
  vendor_id?: number | null
  vendor_name?: string | null
  vendor_phone?: string | null
  images?: RawImage[]
  variants?: any[]
  inventory?: any[]
  [key: string]: any
}


export interface ApiStore {
  store_id: number
  store_name: string
  store_slug: string
  store_logo: string | null
  description: string
  is_default: number
  total_products: number
}

export interface ApiVendor {
  staff_id: number
  full_name: string
  email: string | null
  profile_image: string | null
  status: string
  business_id: number
  business_name: string
  business_slug: string
  business_category: string | null
  business_logo: string | null
  business_address: string | null
  phone: string | null
  stores: ApiStore[]
}
