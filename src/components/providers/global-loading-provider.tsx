'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GlobalLoading } from '@/components/ui/global-loading';

interface GlobalLoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

function GlobalLoadingContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 20000); // 5 seconds timeout
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <GlobalLoading />}
    </GlobalLoadingContext.Provider>
  );
}

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <GlobalLoadingContent>{children}</GlobalLoadingContent>
    </Suspense>
  );
}

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
};
