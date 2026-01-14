'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Flag, 
  LayoutDashboard, 
  Target, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function DashboardContent() {
  const { items, isLoaded } = useSupabaseDemands();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-slate-600 text-lg font-medium">Carregando dashboard...</p>
      </div>
    );
  }

  // --- Data Processing ---

  const activeItems = items.filter(item => item.status !== 'done');
  const completedItems = items.filter(item => item.status === 'done');
  const activeProjects = activeItems.filter(item => item.category === 'project');
  
  // Scoring Metrics
  const totalScore = activeItems.reduce((acc, item) => acc + (item.score || 0), 0);
  const avgScore = activeItems.length > 0 ? totalScore / activeItems.length : 0;

  // Urgency Panel (Top 3 by Urgency then Score)
  const urgentItems = [...activeItems]
    .sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;
      return (b.score || 0) - (a.score || 0);
    })
    .slice(0, 3);

  // Task Ranking (Top 5 by Score)
  const rankedTasks = [...activeItems]
    .filter(item => item.category === 'task')
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  // Daily Focus (Deadline today or Start Date today/past)
  const dailyFocusItems = activeItems.filter(item => {
    const deadline = item.deadline ? new Date(item.deadline) : null;
    const startDate = item.startDate ? new Date(item.startDate) : null;
    const now = new Date();
    
    return (
      (deadline && isSameDay(deadline, now)) ||
      (startDate && (isSameDay(startDate, now) || startDate < now))
    );
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  // External Status (Waiting)
  const waitingItems = activeItems.filter(item => item.status === 'waiting');

  // --- Helper Functions ---

  const getPriorityColor = (score: number) => {
    if (score > 500) return 'text-red-600 bg-red-50 border-red-200';
    if (score > 200) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-blue-600" />
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Visão geral do seu fluxo de produtividade</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="text-xs text-slate-500">
              {activeItems.length} demandas ativas
            </p>
          </div>
        </div>

        {/* Scoring Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500">Impacto Total</p>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{Math.round(totalScore)}</div>
              <p className="text-xs text-slate-400 mt-1">Soma dos scores GUT ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500">Concluídos</p>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{completedItems.length}</div>
              <p className="text-xs text-slate-400 mt-1">Itens finalizados</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500">Projetos Ativos</p>
                <Target className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{activeProjects.length}</div>
              <p className="text-xs text-slate-400 mt-1">Em andamento</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500">Aguardando</p>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{waitingItems.length}</div>
              <p className="text-xs text-slate-400 mt-1">Dependências externas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Urgency & Ranking */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Urgency Panel */}
            <Card className="border-none shadow-md bg-gradient-to-br from-white to-red-50/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Maior Urgência</CardTitle>
                    <CardDescription>Itens que requerem atenção imediata</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urgentItems.length > 0 ? (
                    urgentItems.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">
                          {item.urgency}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">{item.activity}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-normal">
                              GUT: {Math.round(item.score || 0)}
                            </Badge>
                            {item.deadline && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(item.deadline), 'dd/MM')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="ghost" className="text-slate-400 hover:text-blue-600">
                          <Link href={`/edit/${item.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Nenhum item urgente encontrado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Ranking */}
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ranking de Prioridade</CardTitle>
                    <CardDescription>Top tarefas baseadas no score GUT</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rankedTasks.length > 0 ? (
                    rankedTasks.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-slate-700 truncate group-hover:text-blue-700 transition-colors">
                            {item.activity}
                          </span>
                        </div>
                        <div className={cn("px-2 py-1 rounded text-xs font-bold", getPriorityColor(item.score || 0))}>
                          {Math.round(item.score || 0)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Nenhuma tarefa pendente.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Daily Focus & External Status */}
          <div className="space-y-8">

            {/* Daily Focus */}
            <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-white border-t-4 border-t-emerald-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-lg">Foco do Dia</CardTitle>
                </div>
                <CardDescription>Tarefas para hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyFocusItems.length > 0 ? (
                    dailyFocusItems.map(item => (
                      <div key={item.id} className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-emerald-100 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-slate-800 leading-tight">{item.activity}</h4>
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            disabled // Read-only in dashboard
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                            {item.category}
                          </span>
                          {item.deadline && (
                            <span className="text-[10px] text-slate-500">
                              {format(new Date(item.deadline), 'HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <p className="text-sm text-emerald-800 font-medium">Tudo limpo por hoje!</p>
                      <p className="text-xs text-emerald-600">Aproveite para adiantar o backlog.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* External Status */}
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Aguardando</CardTitle>
                </div>
                <CardDescription>Pendências externas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {waitingItems.length > 0 ? (
                    waitingItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">{item.activity}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {item.details || 'Sem detalhes'}
                          </p>
                        </div>
                        <EditBacklogItemDialog 
                            item={item} 
                            onUpdateItem={updateItem}
                            trigger={
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                    <ExternalLink className="h-3 w-3 text-slate-400" />
                                </Button>
                            }
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      Nenhuma pendência externa.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
