'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings } from 'lucide-react';

type SortOrder = 'createdAt' | 'alphabetical';

type SortSettingsDialogProps = {
  sortBy: SortOrder;
  onSortChange: (value: SortOrder) => void;
};

export function SortSettingsDialog({ sortBy, onSortChange }: SortSettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configurações de Ordenação</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações de Ordenação</DialogTitle>
          <DialogDescription>
            Escolha como os itens de referência devem ser ordenados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup defaultValue={sortBy} onValueChange={(value: SortOrder) => onSortChange(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="createdAt" id="createdAt" />
              <Label htmlFor="createdAt">Data de Criação (Mais recentes primeiro)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alphabetical" id="alphabetical" />
              <Label htmlFor="alphabetical">Ordem Alfabética (A-Z)</Label>
            </div>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
