'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, ArrowDownUp } from 'lucide-react';
import { Separator } from '../ui/separator';

type SortKey = 'score_desc' | 'score_asc' | 'deadline_asc' | 'deadline_desc';

type SettingsDialogProps = {
    settings: { k: number; b: number };
    setSettings: (settings: { k: number; b: number }) => void;
    onSortChange: (key: SortKey) => void;
    currentSort: SortKey;
}

export function SettingsDialog({ settings, setSettings, onSortChange, currentSort }: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configurações</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Ajuste os parâmetros de cálculo e a ordenação da lista.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">Ordenação</h4>
            <div className="grid grid-cols-2 gap-2">
                 <Button 
                    variant={currentSort === 'score_desc' || currentSort === 'score_asc' ? 'default' : 'outline'}
                    onClick={() => onSortChange(currentSort === 'score_desc' ? 'score_asc' : 'score_desc')}
                >
                    <ArrowDownUp className="mr-2 h-4 w-4" />
                    Ordenar por Pontos
                </Button>
                 <Button 
                    variant={currentSort === 'deadline_asc' || currentSort === 'deadline_desc' ? 'default' : 'outline'}
                    onClick={() => onSortChange(currentSort === 'deadline_desc' ? 'deadline_asc' : 'deadline_desc')}
                >
                    <ArrowDownUp className="mr-2 h-4 w-4" />
                    Ordenar por Prazo
                </Button>
            </div>
          </div>

          <Separator />
          
          <div>
             <h4 className="text-sm font-semibold mb-2">Cálculo de Pontuação</h4>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="k-param" className="text-right">
                  k (Fator Tempo)
                </Label>
                <Input
                  id="k-param"
                  type="number"
                  value={settings.k}
                  onChange={(e) => setSettings({ ...settings, k: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="b-param" className="text-right">
                  b (Estabilizador)
                </Label>
                <Input
                  id="b-param"
                  type="number"
                  value={settings.b}
                  onChange={(e) => setSettings({ ...settings, b: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogTrigger asChild>
            <Button>Fechar</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
