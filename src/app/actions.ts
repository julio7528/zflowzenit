'use server';

import {
  adjustUrgency,
  type AdjustUrgencyInput,
  type AdjustUrgencyOutput,
} from '@/ai/flows/adaptive-urgency-adjustment';

import {
  generateParetoChartData as generateParetoChartDataFlow,
} from '@/ai/flows/generate-pareto-chart-data';
import type { GenerateParetoChartDataInput, GenerateParetoChartDataOutput } from '@/ai/flows/pareto-types';
import {
    interpretParetoChartData as interpretParetoChartDataFlow,
} from '@/ai/flows/interpret-pareto-chart-data';
import type { InterpretParetoChartDataInput, InterpretParetoChartDataOutput } from '@/ai/flows/pareto-types';
import {
    generateBrainstorming as generateBrainstormingFlow,
} from '@/ai/flows/generate-brainstorming';
import {
    generatePrioritization as generatePrioritizationFlow,
} from '@/ai/flows/generate-prioritization';
import {
    generateFiveWhys as generateFiveWhysFlow,
} from '@/ai/flows/generate-five-whys';
import {
    generateActionPlan as generateActionPlanFlow,
} from '@/ai/flows/generate-action-plan';
import {
    generateComparativeAnalysis as generateComparativeAnalysisFlow,
} from '@/ai/flows/generate-comparative-analysis';
import type { AnalysisInput, BrainstormingOutput, PrioritizationOutput, FiveWhysOutput, ActionPlanOutput, ComparativeAnalysisInput, ComparativeAnalysisOutput } from '@/ai/flows/analysis-types';


export async function getAdjustedUrgency(
  input: AdjustUrgencyInput
): Promise<AdjustUrgencyOutput> {
  return await adjustUrgency(input);
}

export async function generateParetoChartData(
  input: GenerateParetoChartDataInput
): Promise<GenerateParetoChartDataOutput> {
    return await generateParetoChartDataFlow(input);
}

export async function interpretParetoChartData(
  input: InterpretParetoChartDataInput
): Promise<InterpretParetoChartDataOutput> {
    return await interpretParetoChartDataFlow(input);
}

export async function generateBrainstorming(input: AnalysisInput): Promise<BrainstormingOutput> {
    return await generateBrainstormingFlow(input);
}

export async function generatePrioritization(input: AnalysisInput): Promise<PrioritizationOutput> {
    return await generatePrioritizationFlow(input);
}

export async function generateFiveWhys(input: AnalysisInput): Promise<FiveWhysOutput> {
    return await generateFiveWhysFlow(input);
}

export async function generateActionPlan(input: AnalysisInput): Promise<ActionPlanOutput> {
    return await generateActionPlanFlow(input);
}

export async function generateComparativeAnalysis(input: ComparativeAnalysisInput): Promise<ComparativeAnalysisOutput> {
    return await generateComparativeAnalysisFlow(input);
}
