'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewBacklogItemDialog } from '@/components/app/new-demand-dialog';
import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { cn } from '@/lib/utils';

export function FloatingActionButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addItem, categories, addCategory, deleteCategory } = useSupabaseDemands();

  return (
    <>
      {/* Floating Action Button */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 hover:shadow-xl",
          "active:scale-95",
          "group"
        )}
        onClick={() => setIsDialogOpen(true)}
        aria-label="Adicionar nova tarefa"
      >
        <Plus className="h-6 w-6 transition-transform group-hover:rotate-90 duration-300" />
      </Button>

      {/* Dialog */}
      <NewBacklogItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddItem={addItem}
        categories={categories}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        hideTrigger={true}
      />
    </>
  );
}
