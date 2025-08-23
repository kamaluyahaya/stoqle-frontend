// utils/offlineCount.ts
import { getAllOfflineProducts } from '@/lib/indexedDB';

export async function getPendingCount(): Promise<number> {
  const items = await getAllOfflineProducts();
  return items.length;
}
