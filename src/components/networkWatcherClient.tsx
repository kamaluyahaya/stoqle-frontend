'use client';

import useNetworkWatcher from '@/hooks/useNetworkWatcher';

export default function NetworkWatcherClient() {
  useNetworkWatcher(); // just runs the hook
  return null; // no UI
}
