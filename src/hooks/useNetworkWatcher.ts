'use client';
// hooks/useNetworkWatcher.ts
import { useEffect } from 'react';
import { syncOfflineProducts } from '@/utils/syncWatcher';

export default function useNetworkWatcher() {
  useEffect(() => {
    const trySync = () => {
      if (navigator.onLine) {
        syncOfflineProducts();
      }
    };

    window.addEventListener('online', trySync);
    return () => {
      window.removeEventListener('online', trySync);
    };
  }, []);
}
