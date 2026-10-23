'use client';

import { useSyncExternalStore } from 'react';
import { normalizeStoredUser, type AuthUser } from './auth';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getSnapshot() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('user');
}

function getServerSnapshot() {
  return null;
}

export function useAuthUser(): AuthUser | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!raw) return null;

  try {
    return normalizeStoredUser(JSON.parse(raw));
  } catch {
    return null;
  }
}
