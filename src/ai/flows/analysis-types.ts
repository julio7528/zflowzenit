/**
 * @fileOverview Types and schemas for the root cause analysis flows.
 */

import { z } from 'genkit';
import { ParetoChartDataPointSchema } from './pareto-types';

export const AnalysisInputSchema = z.object({
  problem: z.string().describe('The detailed description of the problem.'),
  priority: z.string().describe('The reason why solving this problem is a priority.'),
  impact: z.string().describe('The impact of the problem on costs, quality, security, or delivery.'),
  smartGoal: z.string().describe('The SMART goal to be achieved by solving this problem.'),
  observation: z.object({
    where: z.string().describe('Where the problem physically occurs.'),
    when: z.string().describe('When the problem occurs most frequently.'),
    how: z.string().describe('How the problem manifests in detail.'),
    data: z.string().describe('What data can be collected to quantify its characteristics.'),
  }),
  paretoData: z.array(ParetoChartDataPointSchema).describe('The Pareto chart data, showing main causes and their frequencies.'),
  paretoInterpretation: z.string().describe('An AI-generated interpretation of the Pareto chart data.'),
  brainstormingSession: z.string().optional().describe('A themed brainstorming session summary.'),
  prioritizedCauses: z.array(z.object({
    cause: z.string(),
    justification: z.string(),
  })).optional().describe('A list of prioritized causes.'),
  fiveWhysAnalysis: z.object({
    analysis: z.array(z.object({
        why: z.string(),
        answer: z.string(),
    })),
    rootCause: z.string(),
  }).optional().describe('The result of the 5 Whys analysis.'),
});
export type AnalysisInput = z.infer<typeof AnalysisInputSchema>;


export const BrainstormingOutputSchema = z.object({
  brainstormingSession: z.string().describe('A themed brainstorming session summary based on all available problem data. Should be in Portuguese.'),
});
export type BrainstormingOutput = z.infer<typeof BrainstormingOutputSchema>;

export const PrioritizationOutputSchema = z.object({
    prioritizedCauses: z.array(z.object({
        cause: z.string().describe('The identified cause.'),
        justification: z.string().describe('The justification for its priority, based on frequency and impact.'),
    })).describe('A bullet-point list of prioritized causes in Portuguese.'),
});
export type PrioritizationOutput = z.infer<typeof PrioritizationOutputSchema>;

export const FiveWhysOutputSchema = z.object({
    analysis: z.array(z.object({
        why: z.string().describe('The "why" question.'),
        answer: z.string().describe('The answer to the why question.'),
    })).describe('The result of the 5 Whys analysis, digging down to the root cause. In Portuguese.'),
    rootCause: z.string().describe('The final identified root cause. In Portuguese.'),
});
export type FiveWhysOutput = z.infer<typeof FiveWhysOutputSchema>;

export const ActionPlanOutputSchema = z.object({
    actionPlan: z.array(z.object({
        step: z.number().describe('The step number.'),
        theme: z.string().describe('A title for the action step, with a maximum of 5 words. In Portuguese.'),
        description: z.string().describe('A detailed description of the action to be taken, with a maximum of 40 words. In Portuguese.'),
    })).describe('A step-by-step action plan in Portuguese.'),
});
export type ActionPlanOutput = z.infer<typeof ActionPlanOutputSchema>;

export const ComparativeAnalysisInputSchema = z.object({
    problem: z.string().describe('The initial problem description.'),
    paretoDataBefore: z.array(ParetoChartDataPointSchema).describe('The initial Pareto chart data.'),
    check: z.object({
        goalMet: z.string().describe('Was the goal defined in Step 1 achieved?'),
        problemReduced: z.string().describe('Was the problem effectively reduced or eliminated?'),
        sideEffects: z.string().describe('Were there any negative or unexpected side effects?'),
    }),
});
export type ComparativeAnalysisInput = z.infer<typeof ComparativeAnalysisInputSchema>;

export const ComparativeAnalysisOutputSchema = z.object({
    analysis: z.array(z.object({
        cause: z.string().describe('The cause being compared.'),
        beforeValue: z.number().describe('The value (frequency, cost) before the action plan.'),
        afterValue: z.number().describe('The estimated value after the action plan.'),
        changePercentage: z.number().describe('The percentage change between before and after values.'),
    })).describe('A comparative table of causes before and after the action plan. In Portuguese.'),
});
export type ComparativeAnalysisOutput = z.infer<typeof ComparativeAnalysisOutputSchema>;
