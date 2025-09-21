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
import type { BacklogItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Edit } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { PDCADialog } from './pdca-dialog';

type EditBacklogItemDialogProps = {
  item: BacklogItem;
  onUpdateItem: (item: BacklogItem) => void;
};

export function EditBacklogItemDialog({ item, onUpdateItem }: EditBacklogItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState(item.activity);
  const [details, setDetails] = useState(item.details || '');
  const [deadline, setDeadline] = useState<Date | null>(item.deadline);
  const [gravity, setGravity] = useState(item.gravity);
  const [urgency, setUrgency] = useState(item.urgency);
  const [tendency, setTendency] = useState(item.tendency);

  const handleSaveChanges = () => {
    onUpdateItem({
      ...item,
      activity,
      details,
      deadline,
      gravity,
      urgency,
      tendency,
    });
    setOpen(false);
  };
  
  const handleMigrate = (category: 'reference' | 'future') => {
    onUpdateItem({
        ...item,
        activity,
        details,
        category,
        gravity: 1,
        urgency: 1,
        tendency: 1,
        deadline: null,
        status: 'backlog',
    });
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar Item</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Item do Backlog</DialogTitle>
          <DialogDescription>
            Faça alterações no seu item. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="activity">Atividade</Label>
            <Input
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Descrição</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !deadline && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, 'PPP p', { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline || undefined}
                  onSelect={(date) => {
                      const newDeadline = date || null;
                      if (newDeadline && deadline) {
                        newDeadline.setHours(deadline.getHours());
                        newDeadline.setMinutes(deadline.getMinutes());
                      }
                      setDeadline(newDeadline);
                    }}
                  initialFocus
                  locale={ptBR}
                />
                 <div className="p-2 border-t">
                  <Input 
                    type="time" 
                    value={deadline ? format(deadline, 'HH:mm') : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      setDeadline(prev => {
                        const newDate = prev ? new Date(prev) : new Date();
                        newDate.setHours(hours, minutes);
                        return newDate;
                      });
                    }}
                    disabled={!deadline}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gravity">Gravidade: {gravity}</Label>
            <Slider
              id="gravity"
              value={[gravity]}
              onValueChange={(v) => setGravity(v[0])}
              max={10}
              min={1}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgência: {urgency}</Label>
            <Slider
              id="urgency"
              value={[urgency]}
              onValueChange={(v) => setUrgency(v[0])}
              max={10}
              min={1}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tendency">Tendência: {tendency}</Label>
            <Slider
              id="tendency"
              value={[tendency]}
              onValueChange={(v) => setTendency(v[0])}
              max={10}
              min={1}
              step={1}
            />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-2 pt-2">
             <p className="text-sm text-muted-foreground">Ações rápidas:</p>
            <div className='flex gap-2'>
                <Button variant="secondary" className="flex-1" onClick={() => handleMigrate('reference')}>
                    Migrar para Referências
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => handleMigrate('future')}>
                    Migrar para Follow-up
                </Button>
            </div>
        </div>
        <DialogFooter className="mt-4">
            {item.category === 'project' && <PDCADialog item={item} />}
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
