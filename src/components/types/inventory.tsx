export type TransferItem = { product_id?: number | string; product_name?: string; qty?: number; quantity?: number; price?: string | number; category?: string; barcode?: string; receipt_date?: string; };

export type ApiTransfer = {
  transfer_id: number;
  business_id?: number;
  source_store_id?: number;
  destination_store_id?: number;
  transfer_date?: string;
  transfer_type?: string;
  notes?: string | null;
  created_by?: number;
  status?: string;
  created_at?: string;
  created_by_name?: string; // keep optional to be flexible
  updated_at?: string;
  items?: TransferItem[];
};
