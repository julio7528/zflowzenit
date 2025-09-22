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
import { useToast } from '@/hooks/use-toast';
import type { BacklogItem, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';

type NewBacklogItemDialogProps = {
  onAddItem: (item: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultActivity?: string;
  defaultDetails?: string;
  defaultCategoryId?: string | null;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  onDeleteCategory: (id: string) => void;
};

type AnimationDirection = 'forward' | 'backward' | 'none';

const colorPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', 
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', 
  '#f43f5e', '#78716c', '#64748b', '#6b7280'
];

export function NewBacklogItemDialog({ onAddItem, open: controlledOpen, onOpenChange, defaultActivity, defaultDetails, defaultCategoryId, categories, onAddCategory, onDeleteCategory }: NewBacklogItemDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [activity, setActivity] = useState(defaultActivity || '');
  const [details, setDetails] = useState(defaultDetails || '');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [delegateName, setDelegateName] = useState('');
  const [delegateEmail, setDelegateEmail] = useState('');
  const [delegatePhone, setDelegatePhone] = useState('');
  const [itemCategory, setItemCategory] = useState<BacklogItem['category']>('task');
  const [gravity, setGravity] = useState(5);
  const [urgency, setUrgency] = useState(5);
  const [tendency, setTendency] = useState(5);
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('none');
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(defaultCategoryId || null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(colorPalette[0]);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isControlled = controlledOpen !== undefined;

  useEffect(() => {
    if (defaultActivity) {
        setActivity(defaultActivity);
    }
    if (defaultDetails) {
        setDetails(defaultDetails);
    }
    if (defaultCategoryId) {
        setSelectedCategoryId(defaultCategoryId);
    }
  }, [defaultActivity, defaultDetails, defaultCategoryId]);

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
    setActivity(defaultActivity || '');
    setDetails(defaultDetails || '');
    setDeadline(null);
    setStartDate(null);
    setDelegateName('');
    setDelegateEmail('');
    setDelegatePhone('');
    setItemCategory('task');
    setGravity(5);
    setUrgency(5);
    setTendency(5);
    setAnimationDirection('none');
    setSelectedCategoryId(defaultCategoryId || null);
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setNewCategoryColor(colorPalette[0]);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetState, 300); // Wait for closing animation
    }
    setOpen(isOpen);
  };

  const handleFinalAdd = () => {
    let finalActivity = activity;
    if (delegateName) {
      finalActivity = `[Delegado para: ${delegateName}] ${finalActivity}`;
    }

    console.log('🔍 handleFinalAdd - Valores GUT antes de enviar:', {
      gravity,
      urgency,
      tendency,
      types: {
        gravity: typeof gravity,
        urgency: typeof urgency,
        tendency: typeof tendency
      }
    });

    onAddItem({
      activity: finalActivity,
      details,
      category: itemCategory,
      status: 'backlog',
      gravity,
      urgency,
      tendency,
      deadline,
      startDate,
      categoryId: selectedCategoryId,
    });
    toast({
        title: "Sucesso!",
        description: `Um item de backlog foi criado para consultar na pasta de backlog, com o nome: ${finalActivity}`,
    });
    handleOpenChange(false);
  }

  const handleCategorize = (
    newCategory: BacklogItem['category'], 
    customActivity?: string, 
    status: BacklogItem['status'] = 'backlog'
  ) => {
    const finalActivity = customActivity || activity;
    if (customActivity) {
        setActivity(finalActivity);
    }
    setItemCategory(newCategory);

    // Items that don't need prioritization skip the GUT step
    if (newCategory === 'future' || newCategory === 'reference' || status === 'done' || status === 'waiting') {
        onAddItem({
            activity: finalActivity,
            details,
            category: newCategory,
            status: status,
            gravity: 1,
            urgency: 1,
            tendency: 1,
            deadline: null,
            startDate: null,
            categoryId: selectedCategoryId,
          });

          if (newCategory === 'reference') {
            toast({ title: "Sucesso!", description: "Item enviado para a página de referências/consulta." });
          } else if (newCategory === 'future') {
            toast({ title: "Sucesso!", description: "Item enviado para a conferência futura (Follow-up)." });
          } else if (status === 'done') {
            toast({ title: "Sucesso!", description: "Procedimento sendo executado e item movido para 'Concluído'." });
          } else if (status === 'waiting') {
            toast({ title: "Sucesso!", description: "Item delegado e movido para 'Demandas'." });
          }

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
      'w-full transition-all duration-300 ease-in-out',
      'p-6 absolute top-0 left-0 opacity-0 pointer-events-none',
      step === currentStep && 'static opacity-100 pointer-events-auto',
      animationDirection === 'forward' && (step === currentStep ? 'animate-slide-in-from-right' : 'animate-slide-out-to-left'),
      animationDirection === 'backward' && (step === currentStep ? 'animate-slide-in-from-left' : 'animate-slide-out-to-right')
    );
  
    const footerClasses = "pt-4 flex flex-wrap gap-2 justify-end";

    switch (currentStep) {

      case 1:
        return (
          <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Caixa de Entrada</DialogTitle>
              <DialogDescription>O que está em sua mente? Descreva o item do backlog.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="activity">Atividade</Label>
                <Input id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ex: Preparar slides para reunião semanal" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="details">Descrição</Label>
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
                <Label>Categoria</Label>
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
            <DialogFooter className={footerClasses}>
              <Button onClick={() => navigateToStep(2)} disabled={!activity.trim()}>Próximo</Button>
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
            <DialogFooter className={footerClasses}>
                <Button variant="ghost" className="mr-auto" onClick={() => navigateToStep(1)}>Voltar</Button>
                <Button variant="outline" onClick={() => navigateToStep(2.1)}>Não</Button>
                <Button onClick={() => navigateToStep(3)}>Sim</Button>
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
            <DialogFooter className={footerClasses}>
              <Button variant="ghost" className="mr-auto" onClick={() => navigateToStep(2)}>Voltar</Button>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Button className='w-full justify-start text-left' onClick={() => handleCategorize('future', `[Follow-up] ${activity}`)}>Armazenar para o futuro (Follow-up)</Button>
                <Button className='w-full justify-start text-left' onClick={() => handleCategorize('reference')}>Salvar apenas como referência/consulta</Button>
              </div>
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
              <DialogFooter className={footerClasses}>
                 <Button variant="ghost" className="mr-auto" onClick={() => navigateToStep(2)}>Voltar</Button>
                  <Button variant="outline" onClick={() => navigateToStep(4)}>Não (Apenas um passo)</Button>
                  <Button onClick={() => handleCategorize('project', `Estruturar o projeto: ${activity}`)}>
                      Sim (Criar item para o projeto)
                  </Button>
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
                <DialogFooter className={footerClasses}>
                  <Button variant="ghost" className="mr-auto" onClick={() => navigateToStep(3)}>Voltar</Button>
                  <Button variant="outline" onClick={() => navigateToStep(5)}>Não</Button>
                  <Button onClick={() => handleCategorize('task', activity, 'done')}>Sim (Executar agora)</Button>
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
                 <DialogFooter className={footerClasses}>
                    <Button variant="ghost" className="mr-auto" onClick={() => navigateToStep(4)}>Voltar</Button>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button className='w-full justify-start text-left' onClick={() => navigateToStep(5.1)}>Delegar</Button>
                            <Button className='w-full justify-start text-left' onClick={() => navigateToStep(5.2)}>Agendar</Button>
                        </div>
                        <Button className='w-full justify-start text-left' onClick={() => handleCategorize('task')}>Colocar como ação futura para execução</Button>
                    </div>
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
            <DialogFooter className={footerClasses}>
              <Button variant="outline" className="mr-auto" onClick={() => navigateToStep(5)}>Voltar</Button>
              <Button onClick={() => handleCategorize('task', `[Delegado para: ${delegateName}] ${activity}`, 'waiting')} disabled={!delegateName.trim() && !delegateEmail.trim()}>Confirmar Delegação</Button>
            </DialogFooter>
          </div>
        );

      // Step 5.2: Schedule
      case 5.2:
        return (
            <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Agendar Tarefa</DialogTitle>
              <DialogDescription>Defina um prazo para a entrega deste item.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label>Data de Início (Opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP p', { locale: ptBR }) : <span>Escolha uma data e hora</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => {
                      const newStartDate = date || null;
                      if (newStartDate && startDate) {
                        newStartDate.setHours(startDate.getHours());
                        newStartDate.setMinutes(startDate.getMinutes());
                      }
                      setStartDate(newStartDate);
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                  <div className="p-2 border-t">
                    <Input 
                      type="time" 
                      value={startDate ? format(startDate, 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        setStartDate(prev => {
                          const newDate = prev ? new Date(prev) : new Date();
                          newDate.setHours(hours, minutes);
                          return newDate;
                        });
                      }}
                      disabled={!startDate}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <Label>Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, 'PPP p', { locale: ptBR }) : <span>Escolha uma data e hora</span>}
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
            <DialogFooter className={footerClasses}>
              <Button variant="outline" className="mr-auto" onClick={() => navigateToStep(5)}>Voltar</Button>
              <Button onClick={() => handleCategorize('task')}>Confirmar Agendamento</Button>
            </DialogFooter>
          </div>
        );

      // Step 6: GUT Analysis
      case 6:
        return (
          <div ref={(el) => { stepRefs.current[currentStep] = el; }} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Análise GUT</DialogTitle>
              <DialogDescription>Avalie a Gravidade, Urgência e Tendência deste item.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Gravidade: {gravity}</Label>
                <Slider
                  value={[gravity]}
                  onValueChange={(value) => setGravity(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Qual o impacto se não for resolvido?</p>
              </div>
              <div className="space-y-2">
                <Label>Urgência: {urgency}</Label>
                <Slider
                  value={[urgency]}
                  onValueChange={(value) => setUrgency(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Quão rápido precisa ser resolvido?</p>
              </div>
              <div className="space-y-2">
                <Label>Tendência: {tendency}</Label>
                <Slider
                  value={[tendency]}
                  onValueChange={(value) => setTendency(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Vai piorar com o tempo?</p>
              </div>
            </div>
            <DialogFooter className={footerClasses}>
              <Button variant="outline" className="mr-auto" onClick={() => navigateToStep(itemCategory === 'project' ? 3 : 5)}>Voltar</Button>
              <Button onClick={handleFinalAdd}>Finalizar</Button>
            </DialogFooter>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-[600px] overflow-hidden"
        style={{ height: contentHeight === 'auto' ? 'auto' : `${contentHeight + 120}px` }}
      >
        <div className="relative">
          {[1, 2, 2.1, 3, 4, 5, 5.1, 5.2, 6].map(stepNumber => (
            <div key={stepNumber}>
              {renderStepContent(stepNumber)}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
