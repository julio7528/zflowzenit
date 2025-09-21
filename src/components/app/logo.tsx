import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <BrainCircuit className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold font-headline text-foreground">FlowZenit</h1>
    </div>
  );
}
