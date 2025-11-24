import type { ParetoChartDataPoint } from '@/ai/flows/pareto-types';
import type { BrainstormingOutput, PrioritizationOutput, FiveWhysOutput, ActionPlanOutput, ComparativeAnalysisOutput } from '@/ai/flows/analysis-types';

export type BacklogItemCategoryType = 'inbox' | 'project' | 'future' | 'reference' | 'task';
export type KanbanStatus = 'backlog' | 'analysing' | 'doing' | 'waiting' | 'blocked' | 'done';

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id?: string; // Adicionado para Supabase
}

export type SmartGoal = {
  specific: string;
  measurable: string;
  assignable: string;
  realistic: string;
  timeBound: string;
};

export type ActionPlan5W2H = {
    what: string;
    why: string;
    who: string;
    when: string;
    where: string;
    how: string;
    howMuch: string;
}

export interface PDCAAnalysis {
  problem: string;
  priority: string;
  impact: string;
  smartGoal: SmartGoal;
  observation: {
    where: string;
    when: string;
    how: string;
    data: string;
  };
  analysis: {
    possibleCauses: string;
    whyAnalysis: string;
    rootCauseReached: string;
  };
  actionPlan5W2H: ActionPlan5W2H;
  paretoData: ParetoChartDataPoint[] | null;
  interpretation: string | null;
  brainstorming: BrainstormingOutput | null;
  prioritization: PrioritizationOutput | null;
  fiveWhys: FiveWhysOutput | null;
  actionPlan: ActionPlanOutput | null;
  action: {
    trained: string;
    resources: string;
    executed: string;
    obstacles: string;
  };
  check: {
    goalMet: string;
    problemReduced: string;
    sideEffects: string;
    comparativeAnalysis: ComparativeAnalysisOutput | null;
  };
  standardization: {
    preventRecurrence: string;
    updateDocuments: string;
    training: string;
    monitoring: string;
  };
  conclusion: {
    learnings: string;
    difficulties: string;
    nextSteps: string;
    celebration: string;
  };
}

export interface BacklogItem {
  id: string;
  activity: string;
  details?: string;
  category: BacklogItemCategoryType;
  status: KanbanStatus;
  gravity: number;
  urgency: number;
  tendency: number;
  deadline: Date | null;
  startDate?: Date | null;
  score: number;
  createdAt: Date;
  categoryId?: string | null;
  pdcaAnalysis?: Partial<PDCAAnalysis>;
  googleCalendarEventId?: string | null;
  user_id?: string; // Adicionado para Supabase
}

// Tipos específicos para Supabase
export interface SupabaseBacklogItem {
  id: string;
  user_id: string;
  activity: string;
  details: string | null;
  category: string;
  status: string;
  gravity: number;
  urgency: number;
  tendency: number;
  score: number;
  deadline: string | null;
  start_date: string | null;
  category_id: string | null;
  pdca_analysis: any | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  k_factor: number;
  b_factor: number;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}
