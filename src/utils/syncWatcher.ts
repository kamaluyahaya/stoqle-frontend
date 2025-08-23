'use client';

import { getAllOfflineProducts, deleteOfflineProduct, findMatchingOfflineProduct } from '@/lib/indexedDB';
import { uploadProduct } from '@/lib/apiProduct'; // your function that POSTs product to backend
import { toast } from 'sonner';

export async function syncOfflineProducts() {
  const offlineProducts = await getAllOfflineProducts();

  for (const product of offlineProducts) {
    try {
      const formData = new FormData();

      // Basic product fields
      formData.append('name', product.name);
      formData.append('category_id', String(product.category_id));
      formData.append('price', String(product.price));
      formData.append('status', product.status || 'draft');
      formData.append('track_stock', String(product.track_stock));
      formData.append('allow_oversell', String(product.allow_oversell));
      formData.append('quantity', String(product.quantity || 0));
      formData.append('low_stock_alert', String(product.low_stock_alert || 0));
      formData.append('cost_price', String(product.cost_price || 0));
      formData.append('has_variants', product.has_variants ? 'true' : 'false');

      // Images
      product.images?.forEach((img: { file_url: string }, i: number) => {
        formData.append(`images[${i}][file_url]`, img.file_url);
        formData.append(`images[${i}][position]`, String(i));
      });

      // Variants
      if (product.has_variants) {
        formData.append('variants', JSON.stringify(product.variants));
      }

      // POST to backend
      const res = await uploadProduct(formData);

      if (res?.success) {
        await deleteOfflineProduct(product.id);
        console.log(`✅ Product "${product.name}" synced`);
      } else {
        const errorMsg = res?.message || res?.error || '';

        if (errorMsg === 'Product name already exists in this category and price' || errorMsg==="Validation error") {
          const match = await findMatchingOfflineProduct(product);
          if (match) {
            await deleteOfflineProduct(match.id);
            console.warn(`⚠️ Removed duplicate offline product: ${product.name}`);
            toast.info(`Duplicate "${product.name}" skipped`, { position: 'top-center' });
          }
        } else {
          console.warn(`❌ Failed to sync "${product.name}": ${errorMsg}`);
        }
      }

    } catch (err: any) {
      console.error(`❌ Sync error for "${product.name}"`, err?.message || err);
    }
  }
}
