'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { BacklogItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isPast, isSameDay, isSameMonth, isWithinInterval, parseISO, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Briefcase, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from "next/navigation";

type ViewType = 'day' | 'week' | 'month';

export function CalendarContent() {
  const { items, isLoaded, categories } = useSupabaseDemands();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');

  // Filter items that have deadline or start date
  const calendarItems = items.filter(item => item.deadline || item.startDate);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'day') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else if (view === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper function to parse date consistently
  const parseDate = (date: Date | string | null | undefined): Date => {
    if (!date) return new Date();
    if (typeof date === 'string') {
      return parseISO(date);
    }
    return date;
  };

  const getItemsForDate = (date: Date): BacklogItem[] => {
    const target = startOfDay(date);
    return calendarItems.filter(item => {
      const start = item.startDate ? parseDate(item.startDate) : null;
      const end = item.deadline ? parseDate(item.deadline) : null;
      if (start && end) {
        return isWithinInterval(target, { start: startOfDay(start), end: startOfDay(end) });
      } else if (start) {
        return isSameDay(target, start);
      } else if (end) {
        return isSameDay(target, end);
      }
      return false;
    });
  };

  // Funções de cor idênticas ao Kanban
  const getPriorityColor = (score: number) => {
    if (score > 500) return 'bg-red-600 dark:bg-red-700';
    if (score > 200) return 'bg-yellow-600 dark:bg-yellow-700';
    return 'bg-green-600 dark:bg-green-700';
  };

  const getCategoryColor = (category: string): string => {
    switch(category) {
      case 'task': return 'bg-task';
      case 'project': return 'bg-project';
      case 'future': return 'bg-future';
      case 'reference': return 'bg-reference';
      default: return 'bg-muted';
    }
  };

  // Function to calculate text color based on background for proper contrast
  const getTextColor = (bgColor: string): string => {
    if (!bgColor) return "text-foreground"; // Default to standard text color
    
    // Remove any alpha transparency and convert to proper format
    let color = bgColor.toLowerCase();
    
    // Handle hex colors
    if (color.startsWith('#')) {
      // Convert hex to RGB
      let r = parseInt(color.substr(1, 2), 16);
      let g = parseInt(color.substr(3, 2), 16);
      let b = parseInt(color.substr(5, 2), 16);
      
      // Calculate brightness
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 150 ? "text-foreground" : "text-primary-foreground"; // Dark text on light bg, light on dark
    } 
    // Handle RGB/RGBA
    else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "text-foreground" : "text-primary-foreground";
      }
    }
    // For Tailwind classes, use default
    else {
      // If it's a standard Tailwind color class, we'll use the standard approach
      // Lighter backgrounds get dark text, darker get light text
      if (color.includes('100') || color.includes('200') || color.includes('300') || 
          color.includes('50') || color.includes('white')) {
        return "text-foreground";
      } else {
        return "text-primary-foreground";
      }
    }
    
    // Default to text-foreground if we can't determine
    return "text-foreground";
  };

  // Function to determine if background is light or dark
  const getContrastColor = (bgColor: string): string => {
    if (!bgColor) return "white";
    
    let color = bgColor.toLowerCase();
    
    // Handle hex colors
    if (color.startsWith('#')) {
      let r = parseInt(color.substr(1, 2), 16);
      let g = parseInt(color.substr(3, 2), 16);
      let b = parseInt(color.substr(5, 2), 16);
      
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 150 ? "text-foreground" : "white";
    } 
    // Handle RGB/RGBA
    else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "text-foreground" : "white";
      }
    }
    // Default for other cases
    else if (color.includes('100') || color.includes('200') || color.includes('300') || 
             color.includes('50') || color.includes('white') || color.includes('yellow') || 
             color.includes('green') || color.includes('blue')) {
      return "text-foreground";
    }
    
    return "white";
  };

  const getCategoryBgTint = (category?: string): string => {
    const base = getCategoryColor(category);
    // Usa uma tonalidade leve para melhorar leitura
    return base + '/10';
  };

  const getBorderClass = (item: BacklogItem): string => {
    const isCompleted = item.status === 'done' || item.status?.toLowerCase() === 'concluído';
    const isOverdue = !isCompleted && !!item.deadline && isPast(parseDate(item.deadline));
    if (isCompleted) return 'border-emerald-200 shadow-emerald-100/50';
    if (isOverdue) return 'border-red-200 shadow-red-100/50';
    return 'border-slate-200 hover:border-slate-300';
  };

  const getBackgroundClass = (item: BacklogItem): string => {
    const isCompleted = item.status === 'done' || item.status?.toLowerCase() === 'concluído';
    const isOverdue = !isCompleted && !!item.deadline && isPast(parseDate(item.deadline));
    if (isCompleted) return 'bg-emerald-50/80';
    if (isOverdue) return 'bg-red-50/80';
    return 'bg-white hover:bg-slate-50/80';
  };

  const getStatusIcon = (item: BacklogItem) => {
    const isCompleted = item.status === 'done' || item.status?.toLowerCase() === 'concluído';
    const isOverdue = !isCompleted && !!item.deadline && isPast(parseDate(item.deadline));
    
    if (isCompleted) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
    if (isOverdue) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-slate-500" />;
  };

  const renderDayView = () => {
    const dayItems = getItemsForDate(currentDate);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {format(currentDate, 'EEEE', { locale: ptBR })}
          </h2>
          <p className="text-lg text-slate-600">
            {format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
          </p>
        </div>
        <div className="grid gap-4 max-w-4xl mx-auto">
          {dayItems.length > 0 ? (
            dayItems.map(item => {
              const isCompleted = item.status === 'done';
              const isOverdue = !isCompleted && item.deadline && isPast(parseDate(item.deadline));
              const category = categories.find(c => c.id === item.categoryId);
              
              return (
                <Card
                  key={item.id}
                  onClick={() => router.push(`/edit/${item.id}`)}
                  className={cn(
                    'shadow-sm hover:shadow-md transition-all duration-200 group relative cursor-pointer border bg-card rounded-xl overflow-hidden flex flex-col',
                    isCompleted ? 'border-green-500/50 bg-green-50/30' : '',
                    !isCompleted && isOverdue ? 'border-destructive/50 bg-destructive/5' : 'hover:border-border/50'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-1',
                      isCompleted ? 'bg-green-500' : isOverdue ? 'bg-destructive' : getPriorityColor(item.score || 0)
                    )}
                  />
                  <CardContent className="p-4 pt-5 flex-grow flex flex-col min-h-[180px]">
                    {/* Título com melhor tipografia */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base leading-tight mb-1 pr-2 line-clamp-2">
                          {item.activity}
                        </h3>
                        {item.deadline && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(parseDate(item.deadline)).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Badges com design idêntico ao Kanban */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm",
                          getCategoryColor(item.category), 
                          "text-white"
                        )}
                      >
                        {item.category === 'project' && <Briefcase className="h-3 w-3" />}
                        {item.category === 'project' ? 'Projeto' : item.category === 'task' ? 'Tarefa' : item.category}
                      </div>
                      {category && (
                        <div 
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm",
                            getContrastColor(category.color)
                          )}
                          style={{ backgroundColor: category.color }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {category.name}
                        </div>
                      )}
                    </div>
                    
                    {/* Descrição se houver */}
                    {item.description && (
                      <div className="mb-4 flex-grow">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Footer com melhor separação visual */}
                    <div className="mt-auto pt-4 border-t border-border/40">
                      <div className="flex items-center justify-between gap-2">
                        {/* Score com design melhorado */}
                        <div className="flex items-center gap-2">
                          <div 
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm",
                              getPriorityColor(item.score || 0)
                            )}
                          >
                            <span className="text-[10px] opacity-80">GUT</span>
                            <span>{Math.round(item.score || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16">
              <CalendarIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-slate-500 mb-2">Nenhum item agendado para este dia</p>
              <p className="text-sm text-slate-400">Aproveite para relaxar ou planejar suas próximas atividades</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Semana de {format(weekStart, 'dd/MM', { locale: ptBR })} a {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dayItems = getItemsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card key={day.toISOString()} className={cn(
                'shadow-sm hover:shadow-md transition-all duration-200 border bg-card rounded-xl overflow-hidden flex flex-col min-h-[200px]',
                isToday ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-200' : 'border-border/50 hover:border-border/70'
              )}>
                <div className="text-center p-4 border-b border-border/40">
                  <div className={cn(
                    'text-sm font-semibold uppercase tracking-wide mb-1',
                    isToday ? 'text-blue-700' : 'text-muted-foreground'
                  )}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    'text-2xl font-bold',
                    isToday ? 'text-blue-700' : 'text-foreground'
                  )}>
                    {format(day, 'dd')}
                  </div>
                </div>
                <div className="p-3 space-y-2 flex-grow">
                  {dayItems.slice(0, 3).map(item => {
                    const isCompleted = item.status === 'done';
                    const isOverdue = !isCompleted && item.deadline && isPast(parseDate(item.deadline));
                    const category = categories.find(c => c.id === item.categoryId);
                    
                    return (
                      <div
                         key={item.id}
                         onClick={() => router.push(`/edit/${item.id}`)}
                         className={cn(
                           'relative rounded-lg p-2 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer border overflow-hidden',
                           isCompleted ? 'border-green-500/50 bg-green-50/30' : '',
                           !isCompleted && isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border/50 bg-card'
                         )}
                         title={item.activity}
                       >
                        <div
                          className={cn(
                            'absolute top-0 left-0 right-0 h-0.5',
                            isCompleted ? 'bg-green-500' : isOverdue ? 'bg-destructive' : getPriorityColor(item.score || 0)
                          )}
                        />
                        <div className="flex items-center gap-1.5 pt-1">
                          <div 
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shadow-sm",
                              "bg-gray-500 dark:bg-gray-800",
                              "text-white"
                            )}
                          >
                            {item.category === 'project' && <Briefcase className="h-2 w-2" />}
                            {item.category === 'project' ? 'Proj' : item.category === 'task' ? 'Task' : item.category?.slice(0, 3)}
                          </div>
                          <span className="truncate text-foreground font-medium flex-1">{item.activity}</span>
                        </div>
                      </div>
                    );
                  })}
                  {dayItems.length > 3 && (
                    <div className="text-xs text-muted-foreground font-medium text-center py-2 bg-muted/30 rounded-lg border border-border/30">
                      +{dayItems.length - 3} mais
                    </div>
                  )}
                  {dayItems.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-8 opacity-60">
                      Sem eventos
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 capitalize">
            {format(currentDate, 'MMMM \'de\' yyyy', { locale: ptBR })}
          </h2>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/30 border-b border-border">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-4 border-r border-border/50 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map(day => {
              const dayItems = getItemsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    'min-h-[120px] p-3 border-r border-b border-border/50 last:border-r-0 transition-colors hover:bg-muted/20',
                    !isCurrentMonth && 'bg-muted/10 opacity-60',
                    isToday && 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                  )}
                >
                  <div className={cn(
                    'text-sm font-semibold mb-2',
                    isToday ? 'text-blue-700' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {format(day, 'dd')}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 2).map(item => {
                      const isCompleted = item.status === 'done';
                      const isOverdue = !isCompleted && item.deadline && isPast(parseDate(item.deadline));
                      
                      return (
                        <div
                           key={item.id}
                           onClick={() => router.push(`/edit/${item.id}`)}
                           className={cn(
                             'relative text-xs p-1.5 rounded-lg font-medium truncate cursor-pointer transition-all duration-200 hover:shadow-md border overflow-hidden',
                             isCompleted ? 'border-green-500/50 bg-green-50/30' : '',
                             !isCompleted && isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border/50 bg-card'
                           )}
                           title={item.activity}
                         >
                          <div
                            className={cn(
                              'absolute top-0 left-0 right-0 h-0.5',
                              isCompleted ? 'bg-green-500' : isOverdue ? 'bg-destructive' : getPriorityColor(item.score || 0)
                            )}
                          />
                          <div className="flex items-center gap-1 pt-0.5">
                            <div 
                              className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold shadow-sm",
                                getCategoryColor(item.category), 
                                "text-white"
                              )}
                            >
                              {item.category === 'project' && <Briefcase className="h-1.5 w-1.5" />}
                              {item.category === 'project' ? 'P' : item.category === 'task' ? 'T' : item.category?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="truncate text-foreground font-medium flex-1">{item.activity}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayItems.length > 2 && (
                      <div className="text-xs text-muted-foreground font-medium text-center py-1 bg-muted/20 rounded border border-border/30">
                        +{dayItems.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderWeekView();
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-slate-600 text-lg font-medium">Carregando calendário...</p>
      </div>
    );
  }

  // Adiciona variável para checar se há itens com datas
  const hasDatedItems = calendarItems.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Aviso quando não há itens com startDate/deadline */}
        {!hasDatedItems && (
          <div className="mb-6 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/80 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Nenhum item com datas encontrado
                </p>
                <p className="text-xs text-amber-700">
                  Adicione <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800">startDate</code> ou <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800">deadline</code> aos seus itens para que apareçam no calendário.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <h1 className="text-4xl font-bold text-slate-900 flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              Calendário
            </h1>
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              <Button 
                variant={view === 'day' ? 'default' : 'ghost'} 
                onClick={() => setView('day')}
                className={cn(
                  'transition-all duration-200',
                  view === 'day' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Dia
              </Button>
              <Button 
                variant={view === 'week' ? 'default' : 'ghost'} 
                onClick={() => setView('week')}
                className={cn(
                  'transition-all duration-200',
                  view === 'week' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Semana
              </Button>
              <Button 
                variant={view === 'month' ? 'default' : 'ghost'} 
                onClick={() => setView('month')}
                className={cn(
                  'transition-all duration-200',
                  view === 'month' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Mês
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={goToToday}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
            >
              Hoje
            </Button>
            <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateDate('prev')}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateDate('next')}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {renderView()}
      </div>
    </div>
  );
}