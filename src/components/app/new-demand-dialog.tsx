'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import type { BacklogItem } from '@/lib/types';
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
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Slider } from '../ui/slider';

type NewBacklogItemDialogProps = {
  onAddItem: (item: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => void;
};

type AnimationDirection = 'forward' | 'backward' | 'none';

export function NewBacklogItemDialog({ onAddItem }: NewBacklogItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [delegateName, setDelegateName] = useState('');
  const [delegateEmail, setDelegateEmail] = useState('');
  const [delegatePhone, setDelegatePhone] = useState('');
  const [category, setCategory] = useState<BacklogItem['category']>('task');
  const [gravity, setGravity] = useState(5);
  const [urgency, setUrgency] = useState(5);
  const [tendency, setTendency] = useState(5);
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('none');
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    setDescription('');
    setDeadline(null);
    setDelegateName('');
    setDelegateEmail('');
    setDelegatePhone('');
    setCategory('task');
    setGravity(5);
    setUrgency(5);
    setTendency(5);
    setAnimationDirection('none');
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetState, 300); // Wait for closing animation
    }
    setOpen(isOpen);
  };

  const handleFinalAdd = () => {
    let finalDescription = description;
    if (delegateName) {
      finalDescription = `[Delegado para: ${delegateName}] ${finalDescription}`;
    }

    onAddItem({
      description: finalDescription,
      category,
      status: 'backlog',
      gravity,
      urgency,
      tendency,
      deadline,
    });
    handleOpenChange(false);
  }

  const handleCategorize = (newCategory: BacklogItem['category'], customDescription?: string) => {
    if (customDescription) {
        setDescription(customDescription);
    }
    setCategory(newCategory);

    // Items that don't need prioritization skip the GUT step
    if (newCategory === 'future' || newCategory === 'reference') {
        onAddItem({
            description: customDescription || description,
            category: newCategory,
            status: 'backlog',
            gravity: 0,
            urgency: 0,
            tendency: 0,
            deadline: null,
          });
          handleOpenChange(false);
    } else {
        navigateToStep(6); // Go to GUT step
    }
  };

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
          <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Caixa de Entrada</DialogTitle>
              <DialogDescription>O que está em sua mente? Descreva o item do backlog.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Preparar slides para reunião semanal" />
            </div>
            <DialogFooter>
              <Button onClick={() => navigateToStep(2)} disabled={!description.trim()}>Próximo</Button>
            </DialogFooter>
          </div>
        );

      // Step 2: Is it actionable?
      case 2:
        return (
          <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
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
            <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Como você gostaria de classificar isso?</DialogTitle>
              <DialogDescription>Escolha como armazenar este item não acionável.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <div className="flex flex-col gap-2 w-full">
                <Button className='w-full justify-start text-left' onClick={() => handleCategorize('future', `[Follow-up] ${description}`)}>Armazenar para o futuro (Follow-up)</Button>
                <Button className='w-full justify-start text-left' onClick={() => handleCategorize('reference')}>Salvar apenas como referência/consulta</Button>
              </div>
              <Button variant="outline" onClick={() => navigateToStep(2)} className='sm:ml-auto mt-2 sm:mt-0'>Voltar</Button>
            </DialogFooter>
          </div>
        );
      
      // Step 3: Multiple steps?
      case 3:
          return (
            <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
              <DialogHeader>
                <DialogTitle>Requer múltiplos passos?</DialogTitle>
                <DialogDescription>Isso exigirá mais de uma ação para ser concluído?</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                <div className="flex flex-col gap-2 w-full">
                  <Button className='w-full justify-start text-left' onClick={() => handleCategorize('project', `Estruturar o projeto: ${description}`)}>
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
            <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
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
            <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
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
            <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
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
        return (
            <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
            <DialogHeader>
              <DialogTitle>Agendar Tarefa</DialogTitle>
              <DialogDescription>Defina um prazo para a entrega deste item.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                    {deadline ? format(deadline, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline || undefined}
                    onSelect={(date) => setDeadline(date || null)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
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
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => navigateToStep(5)}>Voltar</Button>
              <Button onClick={() => handleCategorize('task')} disabled={!deadline}>Confirmar Agendamento</Button>
            </DialogFooter>
          </div>
        );

      // Step 6: Adjust GUT
      case 6:
        return (
            <div ref={el => stepRefs.current[currentStep] = el} className={stepClasses}>
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
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Novo Backlog
        </Button>
      </DialogTrigger>
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
