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
import { Calendar as CalendarIcon, Edit, Clock } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { PDCADialog } from './pdca-dialog';
import { GRAVITY_LABELS, GRAVITY_DESCRIPTIONS, URGENCY_LABELS, URGENCY_DESCRIPTIONS, TENDENCY_LABELS, TENDENCY_DESCRIPTIONS } from '@/lib/gut-constants';
import { useAuth } from '@/hooks/use-auth';
import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { updateCalendarEvent } from '@/app/actions/update-calendar-event';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type EditBacklogItemDialogProps = {
  item: BacklogItem;
  onUpdateItem: (item: BacklogItem) => void;
  trigger?: React.ReactNode;
};



export function EditBacklogItemDialog({ item, onUpdateItem, trigger }: EditBacklogItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState(item.activity);
  const [details, setDetails] = useState(item.details || '');
  const [deadline, setDeadline] = useState<Date | null>(item.deadline);
  const [startDate, setStartDate] = useState<Date | null>(item.startDate || null);
  const [gravity, setGravity] = useState(item.gravity);
  const [urgency, setUrgency] = useState(item.urgency);
  const [tendency, setTendency] = useState(item.tendency);
  const [categoryId, setCategoryId] = useState<string | null>(item.categoryId || null);
  const [categoryType, setCategoryType] = useState<BacklogItem['category']>(item.category);

  const [startTime, setStartTime] = useState(item.startDate ? format(item.startDate, 'HH:mm') : '');
  const [deadlineTime, setDeadlineTime] = useState(item.deadline ? format(item.deadline, 'HH:mm') : '');

  const { user, session } = useAuth();
  const { categories } = useSupabaseDemands();
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
        setActivity(item.activity);
        setDetails(item.details || '');
        setDeadline(item.deadline ? new Date(item.deadline) : null);
        setStartDate(item.startDate ? new Date(item.startDate) : null);
        setGravity(item.gravity);
        setUrgency(item.urgency);
        setTendency(item.tendency);
        setCategoryId(item.categoryId || null);
        setCategoryType(item.category);
        setStartTime(item.startDate ? format(item.startDate, 'HH:mm') : '');
        setDeadlineTime(item.deadline ? format(item.deadline, 'HH:mm') : '');
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, setTime: (value: string) => void, setDate: React.Dispatch<React.SetStateAction<Date | null>>, currentDate: Date | null) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length >= 3) {
        value = value.slice(0, 2) + ':' + value.slice(2);
    }
    if (value.length > 5) value = value.slice(0, 5);

    const [hoursStr, minutesStr] = value.split(':');
    const hours = parseInt(hoursStr);
    const minutes = minutesStr ? parseInt(minutesStr) : 0;

    if (hours > 23) value = '23:' + (minutesStr || '');
    if (minutes > 59) value = hoursStr + ':59';

    setTime(value);

    if (currentDate && value.length === 5) {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
            setDate(prev => {
                if (!prev) return null;
                const newDate = new Date(prev);
                newDate.setHours(h, m, 0, 0);
                return newDate;
            });
        }
    }
  };

  const handleSaveChanges = async () => {
    // Check if relevant fields changed for Google Calendar update
    const hasActivityChanged = activity !== item.activity;
    const hasStartDateChanged = startDate?.toISOString() !== item.startDate?.toISOString();
    const hasDeadlineChanged = deadline?.toISOString() !== item.deadline?.toISOString();
    const hasCategoryChanged = categoryId !== item.categoryId || categoryType !== item.category;

    if (item.googleCalendarEventId && (hasActivityChanged || hasStartDateChanged || hasDeadlineChanged || hasCategoryChanged)) {
        console.log('🔄 Detectada alteração em campos sincronizados com Google Calendar');
        
        if (user && session && startDate && deadline) {
            const categoryName = categories.find(c => c.id === categoryId)?.name || 'Geral';
            // Se mudou a categoria, atualiza o prefixo, senão mantém ou atualiza se a atividade mudou
            const summary = `[${categoryName}] ${activity}`;
            
            console.log('📅 Atualizando evento no Google Calendar:', {
                eventId: item.googleCalendarEventId,
                summary,
                start: startDate.toISOString(),
                end: deadline.toISOString()
            });

            const result = await updateCalendarEvent({
                eventId: item.googleCalendarEventId,
                summary,
                description: details,
                start: startDate.toISOString(),
                end: deadline.toISOString(),
                userId: user.id,
                accessToken: session.access_token,
            });

            if (result.success) {
                toast({
                    title: "Calendar Atualizado",
                    description: "O evento foi atualizado no Google Calendar.",
                });
                console.log('✅ Calendar atualizado com sucesso');
            } else {
                toast({
                    title: "Erro no Calendar",
                    description: "Não foi possível atualizar o evento no Google Calendar.",
                    variant: "destructive"
                });
                console.error('❌ Erro ao atualizar Calendar:', result.message);
            }
        } else {
            console.warn('⚠️ Não foi possível atualizar Calendar: Dados incompletos (datas ou sessão)');
        }
    }

    onUpdateItem({
      ...item,
      activity,
      details,
      deadline,
      startDate,
      gravity,
      urgency,
      tendency,
      categoryId,
      category: categoryType,
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
        startDate: null,
        status: 'backlog',
    });
    setOpen(false);
  };

  const isValidDateRange = (!startDate || !deadline) || (startDate <= deadline);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar Item</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
            <Label>Categoria</Label>
            <Select 
                value={categoryId || 'none'} 
                onValueChange={(value) => {
                    if (value === 'none') {
                        setCategoryId(null);
                    } else {
                        setCategoryId(value);
                    }
                }}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                            <div className='flex items-center gap-2'>
                                <div className='h-3 w-3 rounded-full' style={{ backgroundColor: cat.color }}/>
                                {cat.name}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
            <Label>Data de início</Label>
            <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={(date) => {
                      const newDate = date || null;
                      if (newDate && startTime.length === 5) {
                        const [hours, minutes] = startTime.split(':').map(Number);
                        newDate.setHours(hours || 0, minutes || 0, 0, 0);
                      }
                      setStartDate(newDate);
                    }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <div className="relative w-[120px]">
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                type="text"
                placeholder="00:00"
                className="pl-3 pr-8"
                value={startTime}
                maxLength={5}
                onChange={(e) => handleTimeChange(e, setStartTime, setStartDate, startDate)}
                disabled={!startDate}
                />
            </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo</Label>
            <div className="flex gap-2">
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
                  {deadline ? format(deadline, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline || undefined}
                  onSelect={(date) => {
                      const newDeadline = date || null;
                      if (newDeadline && deadlineTime.length === 5) {
                        const [hours, minutes] = deadlineTime.split(':').map(Number);
                        newDeadline.setHours(hours || 0, minutes || 0, 0, 0);
                      }
                      setDeadline(newDeadline);
                    }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <div className="relative w-[120px]">
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                type="text" 
                placeholder="00:00"
                className="pl-3 pr-8"
                value={deadlineTime}
                maxLength={5}
                onChange={(e) => handleTimeChange(e, setDeadlineTime, setDeadline, deadline)}
                disabled={!deadline}
                />
            </div>
            </div>
            {!isValidDateRange && startDate && deadline && (
                <p className="text-xs text-red-500">O prazo final deve ser posterior à data de início.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gravity">Gravidade: {gravity} - {GRAVITY_LABELS[gravity]} ({GRAVITY_DESCRIPTIONS[gravity]})</Label>
            <Slider
              id="gravity"
              value={[gravity]}
              onValueChange={(v) => setGravity(v[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgência: {urgency} - {URGENCY_LABELS[urgency]} ({URGENCY_DESCRIPTIONS[urgency]})</Label>
            <Slider
              id="urgency"
              value={[urgency]}
              onValueChange={(v) => setUrgency(v[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tendency">Tendência: {tendency} - {TENDENCY_LABELS[tendency]} ({TENDENCY_DESCRIPTIONS[tendency]})</Label>
            <Slider
              id="tendency"
              value={[tendency]}
              onValueChange={(v) => setTendency(v[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
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
          <Button onClick={handleSaveChanges} disabled={!isValidDateRange}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

