'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  useMemo,
} from 'react';

import type { FacebookPage } from '@/lib/services/facebook';

interface FacebookPageContextValue {
  activePage: FacebookPage | null;
  pages: FacebookPage[];
  isReady: boolean;
  setActivePage: (page: FacebookPage) => void;
}

const FacebookPageContext = createContext<FacebookPageContextValue | null>(null);
const STORAGE_KEY = 'fb_page_id';

export function FacebookPageStore({
  children,
  pages,
}: {
  children: React.ReactNode;
  pages: FacebookPage[];
}) {
  // 這是解決 Hydration Error 的關鍵：初始必須為 false
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const storedId = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => localStorage.getItem(STORAGE_KEY),
    () => null // SSR 時回傳 null
  );

  const activePage = useMemo(() => {
    // 只有在掛載後才計算真實的 activePage
    if (!mounted) return null;
    return pages.find((p) => p.id === storedId) || pages[0] || null;
  }, [mounted, pages, storedId]);

  const value = useMemo(
    () => ({
      activePage,
      pages,
      isReady: mounted, // 用 mounted 作為 ready 訊號
      setActivePage: (page: FacebookPage) => {
        localStorage.setItem(STORAGE_KEY, page.id);
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
      },
    }),
    [activePage, pages, mounted]
  );

  return <FacebookPageContext.Provider value={value}>{children}</FacebookPageContext.Provider>;
}

export const useFacebookPage = () => {
  const context = useContext(FacebookPageContext);
  if (!context) throw new Error('useFacebookPage must be used within FacebookPageStore');
  return context;
};
