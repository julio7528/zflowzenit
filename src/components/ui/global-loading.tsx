'use client';

import { Loader2 } from 'lucide-react';

export function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Carregando...
        </p>
      </div>
    </div>
  );
}
