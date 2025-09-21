
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BacklogItem, PDCAAnalysis, SmartGoal, ActionPlan5W2H } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Sparkles, Bot, AlertCircle, PlusCircle, FileText, ArrowDown, ArrowUp } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import type { ReactNode } from 'react';
import { generateParetoChartData, interpretParetoChartData, generateBrainstorming, generatePrioritization, generateFiveWhys, generateActionPlan, generateComparativeAnalysis } from '@/app/actions';
import { ParetoChart } from './pareto-chart';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { NewBacklogItemDialog } from './new-backlog-item-dialog';
import { useBacklog } from '@/hooks/use-demands';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '@/lib/utils';

type PDCADialogProps = {
  item: BacklogItem;
  children?: ReactNode;
};

const initialPdcaState: PDCAAnalysis = {
  problem: '',
  priority: '',
  impact: '',
  smartGoal: { specific: '', measurable: '', assignable: '', realistic: '', timeBound: '' },
  observation: { where: '', when: '', how: '', data: '' },
  analysis: { possibleCauses: '', whyAnalysis: '', rootCauseReached: '' },
  actionPlan5W2H: { what: '', why: '', who: '', when: '', where: '', how: '', howMuch: '' },
  action: { trained: '', resources: '', executed: '', obstacles: '' },
  check: { goalMet: '', problemReduced: '', sideEffects: '', comparativeAnalysis: null },
  standardization: { preventRecurrence: '', updateDocuments: '', training: '', monitoring: '' },
  conclusion: { learnings: '', difficulties: '', nextSteps: '', celebration: '' },
  paretoData: null,
  interpretation: null,
  brainstorming: null,
  prioritization: null,
  fiveWhys: null,
  actionPlan: null,
};

type ActionPlanStep = {
    step: number;
    theme: string;
    description: string;
};

export function PDCADialog({ item, children }: PDCADialogProps) {
  const router = useRouter();
  const { addItem, categories, addCategory, deleteCategory, updateItemPdca } = useBacklog();
  const [pdcaData, setPdcaData] = useState<PDCAAnalysis>(item.pdcaAnalysis ? { ...initialPdcaState, ...item.pdcaAnalysis } : initialPdcaState);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalysisLoading, setAnalysisLoading] = useState<Record<string, boolean>>({});
  
  const [backlogItemToCreate, setBacklogItemToCreate] = useState<{ activity: string; details: string; categoryId: string | null; } | null>(null);

  const handleGenerateDocumentation = () => {
    updateItemPdca(item.id, pdcaData);
    toast({
        title: "Documentação Gerada!",
        description: "Os dados foram salvos e a documentação está pronta para visualização.",
    });
  };

  const updatePdcaField = <K extends keyof PDCAAnalysis>(field: K, value: PDCAAnalysis[K]) => {
    setPdcaData(prev => ({ ...prev, [field]: value }));
  };

  const trigger = children || (
    <Button variant="secondary" size="sm">
      <Rocket />
      Executar
    </Button>
  );
  
  const handleSmartGoalChange = (field: keyof SmartGoal, value: string) => {
    setPdcaData(prev => ({...prev, smartGoal: {...prev.smartGoal, [field]: value}}));
  };
  
  const handleObservationChange = (field: keyof PDCAAnalysis['observation'], value: string) => {
    setPdcaData(prev => ({...prev, observation: {...prev.observation, [field]: value}}));
  };
  
  const handleAnalysisChange = (field: keyof PDCAAnalysis['analysis'], value: string) => {
    setPdcaData(prev => ({...prev, analysis: {...prev.analysis, [field]: value}}));
  };
  
  const handle5W2HChange = (field: keyof ActionPlan5W2H, value: string) => {
    setPdcaData(prev => ({...prev, actionPlan5W2H: {...prev.actionPlan5W2H, [field]: value}}));
  };
  
  const handleActionChange = (field: keyof PDCAAnalysis['action'], value: string) => {
    setPdcaData(prev => ({...prev, action: {...prev.action, [field]: value}}));
  };

  const handleCheckChange = (field: keyof Omit<PDCAAnalysis['check'], 'comparativeAnalysis'>, value: string) => {
    setPdcaData(prev => ({...prev, check: {...prev.check, [field]: value}}));
  };
  
  const handleStandardizationChange = (field: keyof PDCAAnalysis['standardization'], value: string) => {
    setPdcaData(prev => ({...prev, standardization: {...prev.standardization, [field]: value}}));
  };

  const handleConclusionChange = (field: keyof PDCAAnalysis['conclusion'], value: string) => {
    setPdcaData(prev => ({...prev, conclusion: {...prev.conclusion, [field]: value}}));
  };

  const getFullSmartGoal = () => {
    const { smartGoal } = pdcaData;
    return `S (Específica): ${smartGoal.specific}\nM (Mensurável): ${smartGoal.measurable}\nA (Atribuível): ${smartGoal.assignable}\nR (Realista): ${smartGoal.realistic}\nT (Temporal): ${smartGoal.timeBound}`;
  }
  
  const getFullAnalysisInput = () => ({
    problem: pdcaData.problem,
    priority: pdcaData.priority,
    impact: pdcaData.impact,
    smartGoal: getFullSmartGoal(),
    observation: pdcaData.observation,
    paretoData: pdcaData.paretoData || [],
    paretoInterpretation: pdcaData.interpretation || '',
    brainstormingSession: pdcaData.brainstorming?.brainstormingSession,
    prioritizedCauses: pdcaData.prioritization?.prioritizedCauses,
    fiveWhysAnalysis: pdcaData.fiveWhys || undefined,
  });

  const handleGenerateChart = async () => {
    setIsLoading(true);
    updatePdcaField('paretoData', null);
    updatePdcaField('interpretation', null);
    try {
        const chartData = await generateParetoChartData({
            problem: pdcaData.problem,
            priority: pdcaData.priority,
            impact: pdcaData.impact,
            smartGoal: getFullSmartGoal()
        });
        updatePdcaField('paretoData', chartData);

        if (chartData && chartData.length > 0) {
            const interpretationResult = await interpretParetoChartData(chartData);
            updatePdcaField('interpretation', interpretationResult.interpretation);
        }
    } catch (error) {
        console.error("Failed to generate Pareto analysis:", error);
    } finally {
        setIsLoading(false);
    }
  }

  const handleGenerateAnalysis = async (tool: 'brainstorm' | 'prioritize' | '5whys' | 'actionPlan' | 'comparative') => {
    setAnalysisLoading(prev => ({ ...prev, [tool]: true }));
    try {
        if (tool === 'comparative') {
            const result = await generateComparativeAnalysis({
                problem: pdcaData.problem,
                paretoDataBefore: pdcaData.paretoData || [],
                check: {
                    goalMet: pdcaData.check.goalMet,
                    problemReduced: pdcaData.check.problemReduced,
                    sideEffects: pdcaData.check.sideEffects,
                },
            });
            setPdcaData(prev => ({...prev, check: {...prev.check, comparativeAnalysis: result }}));
        } else {
            const input = getFullAnalysisInput();
            if (tool === 'brainstorm') {
                const result = await generateBrainstorming(input);
                updatePdcaField('brainstorming', result);
            } else if (tool === 'prioritize') {
                const result = await generatePrioritization(input);
                updatePdcaField('prioritization', result);
            } else if (tool === '5whys') {
                const result = await generateFiveWhys(input);
                updatePdcaField('fiveWhys', result);
            } else if (tool === 'actionPlan') {
                const result = await generateActionPlan(input);
                updatePdcaField('actionPlan', result);
            }
        }
    } catch (error) {
        console.error(`Failed to generate ${tool} analysis:`, error);
    } finally {
        setAnalysisLoading(prev => ({ ...prev, [tool]: false }));
    }
  }

  const handleCreateBacklogItem = (action: ActionPlanStep) => {
    setBacklogItemToCreate({
      activity: `Passo ${action.step}: ${action.theme}`,
      details: action.description,
      categoryId: item.categoryId || null,
    });
  };

  const handleFinishConversion = (newItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => {
    addItem(newItem);
    setBacklogItemToCreate(null);
  };


  const canGeneratePareto = pdcaData.problem.trim() && pdcaData.priority.trim() && pdcaData.impact.trim() && Object.values(pdcaData.smartGoal).every(v => v.trim());
  const canGenerateAnalysis = canGeneratePareto && pdcaData.paretoData && pdcaData.interpretation;
  const canGenerateActionPlan = canGenerateAnalysis && pdcaData.brainstorming && pdcaData.prioritization && pdcaData.fiveWhys;
  const canGenerateComparative = canGeneratePareto && pdcaData.check.goalMet.trim() && pdcaData.check.problemReduced.trim();


  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl flex flex-col h-full max-h-[90svh]">
        <DialogHeader>
          <DialogTitle>Execução PDCA/MASP: {item.activity}</DialogTitle>
          <DialogDescription>
            Siga o processo estruturado para garantir uma resolução de problemas e execução eficazes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4">
            <Tabs defaultValue="plan" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="plan">P - Planejar</TabsTrigger>
                <TabsTrigger value="do">D - Fazer</TabsTrigger>
                <TabsTrigger value="check">C - Checar</TabsTrigger>
                <TabsTrigger value="act">A - Agir</TabsTrigger>
            </TabsList>
            <TabsContent value="plan" className="mt-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Passo 1 MASP: Identificação do Problema</CardTitle>
                        <CardDescription>Defina claramente o problema a ser resolvido, estabelecendo uma meta mensurável e analisando as causas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4 rounded-md border p-4">
                            <h3 className="text-sm font-semibold">Perguntas Chaves</h3>
                            <div className="space-y-2">
                                <Label>1. Qual é o problema exato que deve ser resolvido?</Label>
                                <Textarea value={pdcaData.problem} onChange={e => setPdcaData(prev => ({...prev, problem: e.target.value}))} placeholder="Ex: Atrasos frequentes na entrega do produto X para o cliente Y..." />
                            </div>
                            <div className="space-y-2">
                                <Label>2. Por que o problema é uma prioridade agora?</Label>
                                <Textarea value={pdcaData.priority} onChange={e => setPdcaData(prev => ({...prev, priority: e.target.value}))} placeholder="Ex: Reclamações de clientes aumentaram 30% no último trimestre..." />
                            </div>
                            <div className="space-y-2">
                                <Label>3. Qual o seu impacto em custo, segurança, qualidade ou entrega?</Label>
                                <Textarea value={pdcaData.impact} onChange={e => setPdcaData(prev => ({...prev, impact: e.target.value}))} placeholder="Ex: Impacto financeiro de R$50.000 em multas contratuais..." />
                            </div>
                            <div className="space-y-2">
                                <Label>4. Qual é a nossa meta SMART?</Label>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="smart">
                                        <AccordionTrigger>Definir Meta SMART</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label className='font-semibold'>S (Específica)</Label>
                                                <p className="text-xs text-muted-foreground">O que deve ser alcançado e as ações necessárias.</p>
                                                <Input value={pdcaData.smartGoal.specific} onChange={e => handleSmartGoalChange('specific', e.target.value)} placeholder="Ex: Reduzir o tempo de entrega do produto X" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className='font-semibold'>M (Mensurável)</Label>
                                                <p className="text-xs text-muted-foreground">Indicadores para mensurar o progresso da meta.</p>
                                                <Input value={pdcaData.smartGoal.measurable} onChange={e => handleSmartGoalChange('measurable', e.target.value)} placeholder="Ex: De 7 para 5 dias (redução de 2 dias)" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className='font-semibold'>A (Atribuível)</Label>
                                                <p className="text-xs text-muted-foreground">Quem será o responsável pelo alcance da meta.</p>
                                                <Input value={pdcaData.smartGoal.assignable} onChange={e => handleSmartGoalChange('assignable', e.target.value)} placeholder="Ex: Equipe de Logística, sob supervisão de..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className='font-semibold'>R (Realista)</Label>
                                                <p className="text-xs text-muted-foreground">A meta pode ser atingida com os recursos disponíveis.</p>
                                                <Input value={pdcaData.smartGoal.realistic} onChange={e => handleSmartGoalChange('realistic', e.target.value)} placeholder="Ex: Sim, com a otimização da rota Y e..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className='font-semibold'>T (Temporal)</Label>
                                                <p className="text-xs text-muted-foreground">O prazo para alcançar a meta.</p>
                                                <Input value={pdcaData.smartGoal.timeBound} onChange={e => handleSmartGoalChange('timeBound', e.target.value)} placeholder="Ex: Até o final do próximo mês (31/10/2024)" />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-md border p-4">
                             <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold">Ferramentas de Foco: Gráfico de Pareto</h3>
                                <Button onClick={handleGenerateChart} disabled={isLoading || !canGeneratePareto}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Gerando...' : 'Gerar com IA'}
                                </Button>
                            </div>
                            <div className="h-80 w-full rounded-lg border bg-muted/50 p-4">
                                {isLoading && !pdcaData.paretoData && <Skeleton className="h-full w-full" />}
                                {pdcaData.paretoData && <ParetoChart data={pdcaData.paretoData} />}
                                {!pdcaData.paretoData && !isLoading && (
                                    <div className="flex items-center justify-center h-full text-center">
                                        <p className="text-muted-foreground">Preencha todas as perguntas chaves e a meta SMART para gerar o gráfico.</p>
                                    </div>
                                )}
                            </div>
                            {isLoading && !pdcaData.interpretation && (
                                <div className='space-y-2'>
                                    <Skeleton className='h-4 w-1/4' />
                                    <Skeleton className='h-16 w-full' />
                                </div>
                            )}
                            {pdcaData.interpretation && (
                                <div className="rounded-md border bg-muted/50 p-4 text-sm">
                                    <div className="flex items-center gap-2 mb-2 font-medium">
                                        <Bot className="h-5 w-5" />
                                        <span>Interpretação da IA</span>
                                    </div>
                                    <p className="text-muted-foreground">{pdcaData.interpretation}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Passo 2 MASP: Observação</CardTitle>
                        <CardDescription>Investigar o problema no local onde ele ocorre, para coletar dados e fatos sem tirar conclusões precipitadas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 rounded-md border p-4">
                        <div className="space-y-2">
                            <Label>1. Onde o problema acontece fisicamente?</Label>
                            <Textarea value={pdcaData.observation.where} onChange={e => handleObservationChange('where', e.target.value)} placeholder="Ex: Na linha de montagem final, especificamente na estação de embalagem..." />
                        </div>
                        <div className="space-y-2">
                            <Label>2. Quando ele ocorre com mais frequência? (Dia, turno, produto)</Label>
                            <Textarea value={pdcaData.observation.when} onChange={e => handleObservationChange('when', e.target.value)} placeholder="Ex: Principalmente às segundas-feiras, no turno da tarde, ao embalar o produto modelo Z..." />
                        </div>
                        <div className="space-y-2">
                            <Label>3. Como ele se manifesta? Quais as suas características detalhadas?</Label>
                            <Textarea value={pdcaData.observation.how} onChange={e => handleObservationChange('how', e.target.value)} placeholder="Ex: As caixas chegam amassadas na borda superior direita, com a fita de vedação parcialmente solta..." />
                        </div>
                        <div className="space-y-2">
                            <Label>4. Quais dados podemos coletar para quantificar suas características?</Label>
                            <Textarea value={pdcaData.observation.data} onChange={e => handleObservationChange('data', e.target.value)} placeholder="Ex: Número de caixas danificadas por turno, medição da força de compressão, registro de temperatura e umidade da área..." />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Passo 3 MASP: Análise (Análise da Causa Raiz)</CardTitle>
                        <CardDescription>Utilizar um método estruturado para identificar a causa fundamental do problema.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-4 rounded-md border p-4">
                            <div className="space-y-2">
                                <Label>1. Quais são todas as possíveis causas para este problema?</Label>
                                <Textarea value={pdcaData.analysis.possibleCauses} onChange={e => handleAnalysisChange('possibleCauses', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label>2. Por que esta causa está acontecendo? (pergunte e responda até a pergunta chegar na raiz, escreva tudo na caixa de mensagem)</Label>
                                <Textarea value={pdcaData.analysis.whyAnalysis} onChange={e => handleAnalysisChange('whyAnalysis', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label>3. Chegamos a uma causa raiz que se eliminar impedirá o problema de se retornar?</Label>
                                <Textarea value={pdcaData.analysis.rootCauseReached} onChange={e => handleAnalysisChange('rootCauseReached', e.target.value)} />
                            </div>
                        </div>

                         <div className="space-y-4 rounded-md border p-4">
                             {!canGenerateAnalysis && (
                                <Alert variant="default">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Aguardando Dados</AlertTitle>
                                    <AlertDescription>
                                       Preencha os passos 1 e 2 e gere o Gráfico de Pareto para habilitar as ferramentas de análise de IA.
                                    </AlertDescription>
                                </Alert>
                             )}
                            <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Sugestão de Brainstorming</h4>
                                    <Button onClick={() => handleGenerateAnalysis('brainstorm')} disabled={isAnalysisLoading['brainstorm'] || !canGenerateAnalysis}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {isAnalysisLoading['brainstorm'] ? 'Gerando...' : 'Gerar com IA'}
                                    </Button>
                               </div>
                               {isAnalysisLoading['brainstorm'] && <Skeleton className="h-20 w-full" />}
                               {pdcaData.brainstorming && (
                                    <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                                        {pdcaData.brainstorming.brainstormingSession}
                                    </div>
                               )}
                            </div>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Priorização de Causas</h4>
                                     <Button onClick={() => handleGenerateAnalysis('prioritize')} disabled={isAnalysisLoading['prioritize'] || !canGenerateAnalysis}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {isAnalysisLoading['prioritize'] ? 'Gerando...' : 'Gerar com IA'}
                                    </Button>
                               </div>
                                {isAnalysisLoading['prioritize'] && <Skeleton className="h-24 w-full" />}
                                {pdcaData.prioritization && (
                                     <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground">
                                        <ul className="list-disc pl-5 space-y-2">
                                            {pdcaData.prioritization.prioritizedCauses.map((item, index) => (
                                                <li key={index}>
                                                    <span className="font-semibold text-foreground">{item.cause}:</span> {item.justification}
                                                </li>
                                            ))}
                                        </ul>
                                     </div>
                                )}
                            </div>
                             <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Análise 5 Porquês</h4>
                                     <Button onClick={() => handleGenerateAnalysis('5whys')} disabled={isAnalysisLoading['5whys'] || !canGenerateAnalysis}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {isAnalysisLoading['5whys'] ? 'Gerando...' : 'Gerar com IA'}
                                    </Button>
                               </div>
                                {isAnalysisLoading['5whys'] && <Skeleton className="h-32 w-full" />}
                                {pdcaData.fiveWhys && (
                                     <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
                                        {pdcaData.fiveWhys.analysis.map((item, index) => (
                                            <div key={index}>
                                                <p><span className='font-semibold text-foreground'>{index + 1}. {item.why}</span></p>
                                                <p className='pl-4'>{item.answer}</p>
                                            </div>
                                        ))}
                                        <p className='pt-2 font-bold text-foreground'>Causa Raiz: {pdcaData.fiveWhys.rootCause}</p>
                                     </div>
                                )}
                            </div>
                         </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Passo 4 MASP: Plano de Ação</CardTitle>
                        <CardDescription>Elaborar um plano detalhado 5W2H para bloquear ou eliminar a causa raiz identificada.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4 rounded-md border p-4">
                            <h3 className="text-sm font-semibold">Perguntas Chaves (5W2H)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>O que (What) será feito para eliminar a causa raiz?</Label>
                                    <Input value={pdcaData.actionPlan5W2H.what} onChange={e => handle5W2HChange('what', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Por que (Why) esta ação é necessária?</Label>
                                    <Input value={pdcaData.actionPlan5W2H.why} onChange={e => handle5W2HChange('why', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quem (Who) será o responsável por cada ação?</Label>
                                    <Input value={pdcaData.actionPlan5W2H.who} onChange={e => handle5W2HChange('who', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quando (When) será o prazo?</Label>
                                    <Input value={pdcaData.actionPlan5W2H.when} onChange={e => handle5W2HChange('when', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Onde (Where) a ação será implementada?</Label>
                                    <Input value={pdcaData.actionPlan5W2H.where} onChange={e => handle5W2HChange('where', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Como (How) será executada?</Label>
                                    <Input value={pdcaData.actionPlan5W2H.how} onChange={e => handle5W2HChange('how', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quanto (How Much) irá custar?</Label>
                                    <Input value={pdcaData.actionPlan5W2H.howMuch} onChange={e => handle5W2HChange('howMuch', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 rounded-md border p-4">
                            {!canGenerateActionPlan && (
                                <Alert variant="default">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Aguardando Análise</AlertTitle>
                                    <AlertDescription>
                                        Complete a análise de causa raiz (Passo 3) para habilitar a geração do plano de ação com IA.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">Plano de Ação Sugerido pela IA</h4>
                                <Button onClick={() => handleGenerateAnalysis('actionPlan')} disabled={isAnalysisLoading['actionPlan'] || !canGenerateActionPlan}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {isAnalysisLoading['actionPlan'] ? 'Gerando...' : 'Gerar com IA'}
                                </Button>
                            </div>
                            {isAnalysisLoading['actionPlan'] && <Skeleton className="h-32 w-full" />}
                            {pdcaData.actionPlan && (
                                <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground space-y-4">
                                    {pdcaData.actionPlan.actionPlan.map((step, index) => (
                                        <div key={index} className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">Passo {step.step}: {step.theme}</p>
                                                <p className="text-xs mt-1">{step.description}</p>
                                            </div>
                                            <Button size="sm" onClick={() => handleCreateBacklogItem(step)}>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Novo Backlog
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="do" className="mt-4 space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Passo 5 MASP: Ação</CardTitle>
                        <CardDescription>
                            Executar todas as tarefas definidas no plano de ação, envolvendo e capacitando as pessoas necessárias. 
                            Este é um acompanhamento contínuo, atualizado conforme o projeto avança.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>A equipe envolvida foi devidamente treinada para as novas tarefas?</Label>
                            <Textarea value={pdcaData.action?.trained} onChange={e => handleActionChange('trained', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Os recursos necessários (materiais, tempo, ferramentas) estão disponíveis?</Label>
                            <Textarea value={pdcaData.action?.resources} onChange={e => handleActionChange('resources', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>As ações estão sendo executadas conforme o plano e dentro do prazo?</Label>
                            <Textarea value={pdcaData.action?.executed} onChange={e => handleActionChange('executed', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Estamos registrando a execução e qualquer obstáculo encontrado?</Label>
                            <Textarea value={pdcaData.action?.obstacles} onChange={e => handleActionChange('obstacles', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="check" className="mt-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Passo 6 MASP: Verificação</CardTitle>
                        <CardDescription>
                           Coletar dados e comparar o cenário "depois" com o "antes" para confirmar a eficácia das ações.
                        </CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>A meta definida no Passo 1 foi alcançada?</Label>
                            <Textarea value={pdcaData.check?.goalMet} onChange={e => handleCheckChange('goalMet', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>O problema foi efetivamente reduzido ou eliminado?</Label>
                            <Textarea value={pdcaData.check?.problemReduced} onChange={e => handleCheckChange('problemReduced', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Houve algum efeito colateral negativo ou inesperado no processo?</Label>
                            <Textarea value={pdcaData.check?.sideEffects} onChange={e => handleCheckChange('sideEffects', e.target.value)} />
                        </div>
                         <div className="space-y-4 rounded-md border p-4">
                             <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold">Análise Comparativa (Antes vs. Depois)</h3>
                                <Button onClick={() => handleGenerateAnalysis('comparative')} disabled={isAnalysisLoading['comparative'] || !canGenerateComparative}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {isAnalysisLoading['comparative'] ? 'Gerando...' : 'Gerar com IA'}
                                </Button>
                            </div>
                             {isAnalysisLoading['comparative'] && <Skeleton className="h-40 w-full" />}
                            {pdcaData.check?.comparativeAnalysis ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead>Causa</TableHead>
                                        <TableHead className="text-right">Valor Anterior</TableHead>
                                        <TableHead className="text-right">Valor Posterior</TableHead>
                                        <TableHead className="text-right">Mudança (%)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pdcaData.check.comparativeAnalysis.analysis.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{row.cause}</TableCell>
                                            <TableCell className="text-right">{row.beforeValue}</TableCell>
                                            <TableCell className="text-right">{row.afterValue}</TableCell>
                                            <TableCell className={cn("text-right flex items-center justify-end", row.changePercentage < 0 ? 'text-green-600' : 'text-red-600')}>
                                                {row.changePercentage < 0 ? <ArrowDown className="h-4 w-4 mr-1" /> : <ArrowUp className="h-4 w-4 mr-1" />}
                                                {Math.abs(row.changePercentage).toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex items-center justify-center h-40 text-center">
                                    <p className="text-muted-foreground text-sm">
                                        Preencha os campos de verificação e o Passo 1 para gerar a análise comparativa.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="act" className="mt-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Passo 7 MASP: Padronização</CardTitle>
                        <CardDescription>
                           Se a solução funcionou, transformá-la em um novo padrão de trabalho para evitar que o problema retorne.
                        </CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Como podemos garantir que o problema não volte a ocorrer?</Label>
                            <Textarea value={pdcaData.standardization?.preventRecurrence} onChange={e => handleStandardizationChange('preventRecurrence', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Quais documentos (procedimentos, checklists, instruções de trabalho) precisam ser criados ou atualizados?</Label>
                            <Textarea value={pdcaData.standardization?.updateDocuments} onChange={e => handleStandardizationChange('updateDocuments', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Quem precisa ser treinado no novo padrão e como garantiremos isso?</Label>
                            <Textarea value={pdcaData.standardization?.training} onChange={e => handleStandardizationChange('training', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Como vamos monitorar o cumprimento do novo padrão?</Label>
                            <Textarea value={pdcaData.standardization?.monitoring} onChange={e => handleStandardizationChange('monitoring', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Passo 8 MASP: Conclusão</CardTitle>
                        <CardDescription>
                           Refletir sobre o processo, documentar aprendizados e planejar os próximos passos.
                        </CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>O que aprendemos durante este ciclo PDCA?</Label>
                            <Textarea value={pdcaData.conclusion?.learnings} onChange={e => handleConclusionChange('learnings', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Quais foram as maiores dificuldades e os maiores sucessos?</Label>
                            <Textarea value={pdcaData.conclusion?.difficulties} onChange={e => handleConclusionChange('difficulties', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Quais problemas residuais ou novas oportunidades vamos atacar agora?</Label>
                            <Textarea value={pdcaData.conclusion?.nextSteps} onChange={e => handleConclusionChange('nextSteps', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Como vamos celebrar e reconhecer o esforço da equipe?</Label>
                            <Textarea value={pdcaData.conclusion?.celebration} onChange={e => handleConclusionChange('celebration', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
        <DialogFooter className='pt-4 border-t'>
            <Button variant="secondary" onClick={handleGenerateDocumentation}>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Documentação
            </Button>
        </DialogFooter>
        {backlogItemToCreate && (
            <NewBacklogItemDialog
                open={!!backlogItemToCreate}
                onOpenChange={(isOpen) => !isOpen && setBacklogItemToCreate(null)}
                onAddItem={handleFinishConversion}
                defaultActivity={backlogItemToCreate.activity}
                defaultDetails={backlogItemToCreate.details}
                defaultCategoryId={backlogItemToCreate.categoryId}
                categories={categories}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
            />
        )}
      </DialogContent>
    </Dialog>
  );
}
