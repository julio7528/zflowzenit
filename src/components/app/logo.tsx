'use client';

import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useGlobalLoading } from '@/components/providers/global-loading-provider';
import { usePathname } from 'next/navigation';

export function Logo({ className }: { className?: string }) {
  const { setIsLoading } = useGlobalLoading();
  const pathname = usePathname();

  return (
    <Link 
      href="/" 
      className={cn('flex items-center gap-2 hover:opacity-80 transition-opacity', className)}
      onClick={() => {
        if (pathname !== '/') {
          setIsLoading(true);
        }
      }}
    >
      <BrainCircuit className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold font-headline text-foreground">FlowZenit</h1>
    </Link>
  );
}
