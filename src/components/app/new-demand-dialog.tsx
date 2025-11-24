'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import type { BacklogItem, Category } from '@/lib/types';
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
import { PlusCircle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Slider } from '../ui/slider';

import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Trash2 } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { scheduleOnCalendar } from '@/app/actions/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type NewBacklogItemDialogProps = {
  onAddItem: (item: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  onDeleteCategory: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  defaultActivity?: string;
  defaultDetails?: string;
  defaultCategoryId?: string | null;
};

const colorPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', 
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', 
  '#f43f5e', '#78716c', '#64748b', '#6b7280'
];

type AnimationDirection = 'forward' | 'backward' | 'none';

export function NewBacklogItemDialog({ 
  onAddItem, 
  categories, 
  onAddCategory, 
  onDeleteCategory, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen, 
  hideTrigger,
  defaultActivity = '',
  defaultDetails = '',
  defaultCategoryId = null
}: NewBacklogItemDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const [step, setStep] = useState(1);
  const [activity, setActivity] = useState(defaultActivity);
  const [details, setDetails] = useState(defaultDetails);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [delegateName, setDelegateName] = useState('');
  const [delegateEmail, setDelegateEmail] = useState('');
  const [delegatePhone, setDelegatePhone] = useState('');
  const [category, setCategory] = useState<BacklogItem['category']>('task');
  const [gravity, setGravity] = useState(5);
  const [urgency, setUrgency] = useState(5);
  const [tendency, setTendency] = useState(5);
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('none');
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
  const { toast } = useToast();
  const { user, session } = useAuth();

  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(defaultCategoryId);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(colorPalette[0]);
  const [deadlineTime, setDeadlineTime] = useState('');
  const [startTime, setStartTime] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [googleEventId, setGoogleEventId] = useState<string | null>(null);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize form with default values when dialog opens
  useLayoutEffect(() => {
    if (open && (defaultActivity || defaultDetails || defaultCategoryId)) {
      setActivity(defaultActivity || '');
      setDetails(defaultDetails || '');
      setSelectedCategoryId(defaultCategoryId || null);
    }
  }, [open, defaultActivity, defaultDetails, defaultCategoryId]);

  useLayoutEffect(() => {
    if (open && stepRefs.current[step]) {
      const currentStepHeight = stepRefs.current[step]?.scrollHeight || 0;
      setContentHeight(currentStepHeight);
    } else if (!open) {
        setTimeout(() => setContentHeight('auto'), 300);
    }
  }, [step, open]);

  const navigateToStep = (nextStep: number) => {
    setAnimationDirection(nextStep > step ? 'forward' : 'backward');
    setStep(nextStep);
  };

  const resetState = () => {
    setStep(1);
    setActivity('');
    setDetails('');
    setDeadline(null);
    setStartDate(null);
    setDelegateName('');
    setDelegateEmail('');
    setDelegatePhone('');
    setCategory('task');
    setGravity(5);
    setUrgency(5);
    setTendency(5);
    setAnimationDirection('none');
    setSelectedCategoryId(null);
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setNewCategoryColor(colorPalette[0]);
    setDeadlineTime('');
    setStartTime('');
    setAddToCalendar(false);
    setGoogleEventId(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetState, 300); // Wait for closing animation
    }
    if (isControlled && setControlledOpen) {
      setControlledOpen(isOpen);
    } else {
      setInternalOpen(isOpen);
    }
  };

  const handleFinalAdd = () => {
    let finalActivity = activity;
    if (delegateName) {
      finalActivity = `[Delegado para: ${delegateName}] ${finalActivity}`;
    }

    onAddItem({
      activity: finalActivity,
      details,
      category,
      status: 'backlog',
      gravity,
      urgency,
      tendency,
      deadline,
      startDate,
      categoryId: selectedCategoryId,
      googleCalendarEventId: googleEventId,
    });
    handleOpenChange(false);
  }

  const handleCategorize = async (newCategory: BacklogItem['category'], customActivity?: string) => {
    const finalActivity = customActivity || activity;
    if (customActivity) {
        setActivity(finalActivity);
    }
    setCategory(newCategory);
let eventId: string | null = null;

  if (addToCalendar && startDate && deadline && user && session) {
      const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || 'Geral';
      const summary = `[${categoryName}] ${finalActivity}`;
      
      const result = await scheduleOnCalendar({
          summary,
          description: details,
          start: startDate.toISOString(),
          end: deadline.toISOString(),
          userId: user.id,
          accessToken: session.access_token,
      });

      if (!result.success) {
          toast({
              title: "Aviso do Calendar",
              description: result.message,
              variant: "destructive"
          });
      } else {
          eventId = result.eventId || null;
          setGoogleEventId(eventId);
           toast({
              title: "Sucesso",
              description: "Evento agendado no Google Calendar.",
          });
      }
  }

    // Items that don't need prioritization skip the GUT step
    if (newCategory === 'future' || newCategory === 'reference') {
        onAddItem({
            activity: finalActivity,
            details,
            category: newCategory,
            status: 'backlog',
            gravity: 1,
            urgency: 1,
            tendency: 1,
            deadline: null,
            startDate,
            categoryId: selectedCategoryId,
            googleCalendarEventId: eventId,
          });
          handleOpenChange(false);
    } else {
        navigateToStep(6); // Go to GUT step
    }
  };

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
        const newCategory = await onAddCategory({ name: newCategoryName, color: newCategoryColor });
        if (newCategory) {
            setSelectedCategoryId(newCategory.id);
            setNewCategoryName('');
            setNewCategoryColor(colorPalette[0]);
            setIsCreatingCategory(false);
        }
    }
  }

  const MAX_CHARS = 1000;

  const renderStepContent = (currentStep: number) => {
    const stepClasses = cn(
      'w-full transition-all duration-300 ease-in-out absolute top-0 left-0',
      'p-6',
      step !== currentStep && 'pointer-events-none opacity-0',
      step === currentStep && 'opacity-100 static',
      animationDirection === 'forward' && (step === currentStep ? 'animate-slide-in-from-right' : 'animate-slide-out-to-left'),
      animationDirection === 'backward' && (step === currentStep ? 'animate-slide-in-from-left' : 'animate-slide-out-to-right')
    );

    switch (currentStep) {
      // Step 1: Capture Inbox
      case 1:
        return (
          <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Caixa de Entrada</DialogTitle>
              <DialogDescription>O que está em sua mente? Descreva o item do backlog.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="activity">Atividade <span className="text-muted-foreground text-xs">(Obrigatório)</span></Label>
                <Input id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ex: Preparar slides para reunião semanal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Descrição <span className="text-muted-foreground text-xs">(Opcional)</span></Label>
                <Textarea 
                  id="details" 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)} 
                  placeholder="Forneça mais detalhes sobre a atividade..." 
                  maxLength={MAX_CHARS} 
                  className="min-h-[120px]"
                />
                 <div className="text-right text-xs text-muted-foreground">
                  <span className={cn(details.length >= MAX_CHARS && 'text-red-500')}>
                    {details.length}/{MAX_CHARS}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria <span className="text-muted-foreground text-xs">(Obrigatório)</span></Label>
                 {isCreatingCategory ? (
                    <div className='space-y-2 rounded-md border p-2'>
                        <Input 
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nome da nova categoria"
                        />
                        <div className='flex gap-2 items-center flex-wrap'>
                            <div className='flex gap-1.5 flex-wrap'>
                                {colorPalette.map(color => (
                                    <button 
                                        key={color}
                                        type="button"
                                        className={cn('h-6 w-6 rounded-full border-2', newCategoryColor === color ? 'border-primary' : 'border-transparent')}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewCategoryColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                         <div className='flex gap-2 justify-end'>
                            <Button variant="ghost" size="sm" onClick={() => setIsCreatingCategory(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleCreateCategory}>Salvar</Button>
                        </div>
                    </div>
                 ) : (
                    <div className='flex items-center gap-2'>
                        <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <Button variant="outline" onClick={() => setIsCreatingCategory(true)}>Nova</Button>
                        {selectedCategoryId && (
                             <Button variant="destructive" size="icon" onClick={() => onDeleteCategory(selectedCategoryId)}>
                                <Trash2 className='h-4 w-4'/>
                             </Button>
                        )}
                    </div>
                 )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => navigateToStep(2)} disabled={!activity.trim() || !selectedCategoryId}>Próximo</Button>
            </DialogFooter>
          </div>
        );

      // Step 2: Is it actionable?
      case 2:
        return (
          <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Isso é possível de ser executado?</DialogTitle>
              <DialogDescription>Você pode tomar alguma ação a respeito disso?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                <div className="flex flex-col gap-2 w-full">
                    <Button className='w-full justify-start' onClick={() => navigateToStep(3)}>Sim</Button>
                    <Button className='w-full justify-start' variant="outline" onClick={() => navigateToStep(2.1)}>Não</Button>
                </div>
                <Button variant="ghost" onClick={() => navigateToStep(1)} className='sm:ml-auto mt-2 sm:mt-0'>Voltar</Button>
            </DialogFooter>
          </div>
        );

      // Step 2.1: Not actionable flow
      case 2.1:
        return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Como você gostaria de classificar isso?</DialogTitle>
              <DialogDescription>Escolha como armazenar este item não acionável.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <div className="flex flex-col gap-2 w-full">
                <Button className='w-full justify-start text-left' onClick={() => handleCategorize('future', `[Follow-up] ${activity}`)}>Armazenar para o futuro (Follow-up)</Button>
                <Button className='w-full justify-start text-left' onClick={() => handleCategorize('reference')}>Salvar apenas como referência/consulta</Button>
              </div>
              <Button variant="outline" onClick={() => navigateToStep(2)} className='sm:ml-auto mt-2 sm:mt-0'>Voltar</Button>
            </DialogFooter>
          </div>
        );
      
      // Step 3: Multiple steps?
      case 3:
          return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
              <DialogHeader>
                <DialogTitle>Requer múltiplos passos?</DialogTitle>
                <DialogDescription>Isso exigirá mais de uma ação para ser concluído?</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                <div className="flex flex-col gap-2 w-full">
                  <Button className='w-full justify-start text-left' onClick={() => handleCategorize('project', `Estruturar o projeto: ${activity}`)}>
                      Sim (Criar item para o projeto)
                  </Button>
                  <Button className='w-full justify-start text-left' variant="outline" onClick={() => navigateToStep(4)}>Não (Apenas um passo)</Button>
                </div>
                <Button variant="ghost" onClick={() => navigateToStep(2)} className='sm:ml-auto mt-2 sm:mt-0'>Voltar</Button>
              </DialogFooter>
            </div>
          );
      
      // Step 4: Less than 2 minutes?
      case 4:
          return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
                <DialogHeader>
                  <DialogTitle>Pode ser feito em menos de 2 minutos?</DialogTitle>
                  <DialogDescription>Você conseguiria concluir esta tarefa rapidamente?</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                  <div className="flex flex-col gap-2 w-full">
                    <Button className='w-full justify-start text-left' onClick={() => handleCategorize('task')}>Sim (Executar agora)</Button>
                    <Button className='w-full justify-start text-left' variant="outline" onClick={() => navigateToStep(5)}>Não</Button>
                  </div>
                  <Button variant="ghost" onClick={() => navigateToStep(3)} className='sm:ml-auto mt-2 sm:mt-0'>Voltar</Button>
                </DialogFooter>
            </div>
            );

      // Step 5: Delegate, Schedule or Defer?
      case 5:
          return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
                <DialogHeader>
                  <DialogTitle>Qual é a próxima ação?</DialogTitle>
                  <DialogDescription>Como este item será tratado?</DialogDescription>
                </DialogHeader>
                 <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                    <div className="flex flex-col gap-2 w-full">
                      <Button className='w-full justify-start text-left' onClick={() => navigateToStep(5.1)}>Delegar</Button>
                      <Button className='w-full justify-start text-left' onClick={() => navigateToStep(5.2)}>Agendar</Button>
                      <Button className='w-full justify-start text-left' onClick={() => handleCategorize('task')}>Colocar como ação futura para execução</Button>
                    </div>
                  <Button variant="outline" onClick={() => navigateToStep(4)} className='sm:ml-auto mt-2 sm:mt-0'>Voltar</Button>
                </DialogFooter>
            </div>
            );

      // Step 5.1: Delegate
      case 5.1:
        return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Delegar Tarefa</DialogTitle>
              <DialogDescription>Para quem você gostaria de delegar esta tarefa?</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delegate-name">Nome</Label>
                <Input id="delegate-name" value={delegateName} onChange={(e) => setDelegateName(e.target.value)} placeholder="Nome do responsável" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delegate-email">Email</Label>
                <Input id="delegate-email" type="email" value={delegateEmail} onChange={(e) => setDelegateEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delegate-phone">Telefone (Opcional)</Label>
                <Input id="delegate-phone" value={delegatePhone} onChange={(e) => setDelegatePhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => navigateToStep(5)}>Voltar</Button>
              <Button onClick={() => handleCategorize('task')} disabled={!delegateName.trim() && !delegateEmail.trim()}>Confirmar Delegação</Button>
            </DialogFooter>
          </div>
        );

      // Step 5.2: Schedule
      case 5.2:
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

        const isValidDateRange = startDate && deadline && startDate <= deadline;
        const isTimeFilled = startTime.length === 5 && deadlineTime.length === 5;

        return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Agendar Tarefa</DialogTitle>
              <DialogDescription>Defina um prazo para a entrega deste item.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                  <Label>Data de início (obrigatório)</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
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
                  <Label>Prazo final (obrigatório)</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !deadline && "text-muted-foreground"
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
              <div className="flex items-center space-x-2">
                <Checkbox id="google-calendar" checked={addToCalendar} onCheckedChange={(checked) => setAddToCalendar(checked as boolean)} />
                <Label htmlFor="google-calendar">Adicionar ao Google Calendar</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => navigateToStep(5)}>Voltar</Button>
              <Button onClick={() => handleCategorize('task')} disabled={!isValidDateRange || !isTimeFilled}>Confirmar Agendamento</Button>
            </DialogFooter>
          </div>
        );

      // Step 6: Adjust GUT
      case 6:
        return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
             <DialogHeader>
              <DialogTitle>Ajustar Prioridade (GUT)</DialogTitle>
              <DialogDescription>Defina a gravidade, urgência e tendência para este item.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="gravity">Gravidade: {gravity}</Label>
                    <Slider id="gravity" value={[gravity]} onValueChange={(v) => setGravity(v[0])} max={10} step={1} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="urgency">Urgência: {urgency}</Label>
                    <Slider id="urgency" value={[urgency]} onValueChange={(v) => setUrgency(v[0])} max={10} step={1} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tendency">Tendência: {tendency}</Label>
                    <Slider id="tendency" value={[tendency]} onValueChange={(v) => setTendency(v[0])} max={10} step={1} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => navigateToStep(5)}>Voltar</Button>
                <Button onClick={handleFinalAdd}>Criar Item de Backlog</Button>
            </DialogFooter>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle />
            Novo Backlog
          </Button>
        </DialogTrigger>
      )}
      <DialogContent 
        className="sm:max-w-md p-0" 
        onInteractOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div 
          className="relative overflow-hidden transition-[height] duration-300 ease-in-out"
          style={{ height: contentHeight }}
        >
            {renderStepContent(1)}
            {renderStepContent(2)}
            {renderStepContent(2.1)}
            {renderStepContent(3)}
            {renderStepContent(4)}
            {renderStepContent(5)}
            {renderStepContent(5.1)}
            {renderStepContent(5.2)}
            {renderStepContent(6)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
