// lib/indexedDB.ts

const DB_NAME = 'StoqleDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_products';

export async function findMatchingOfflineProduct(product: any): Promise<any | null> {
  const offlineProducts = await getAllOfflineProducts();
  return offlineProducts.find(p =>
    p.name?.trim().toLowerCase() === product.name?.trim().toLowerCase() &&
    p.category_id === product.category_id &&
    p.price === product.price
  ) || null;
}


function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

import { toast } from "sonner";

export async function addOfflineProduct(product: any): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const existingProducts: any[] = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const isDuplicate = existingProducts.some((p) =>
    p.name?.trim().toLowerCase() === product.name?.trim().toLowerCase() &&
    p.category === product.category &&
    p.price === product.price
  );

  if (isDuplicate) {
    toast.warning("This product already exists in offline storage", {
      position: 'top-center',
    });
    return; // Exit early
  }

  store.add(product);

  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });

  toast.success("Product saved offline", {
      position: 'top-center',
    });
}


export async function getAllOfflineProducts(): Promise<any[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineProduct(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
  await new Promise((resolve, reject) => {
  tx.oncomplete = () => resolve(undefined);
  tx.onerror = () => reject(tx.error);
});
}
