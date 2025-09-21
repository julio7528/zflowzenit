/**
 * @fileOverview Types and schemas for the Pareto chart data generation flow.
 */

import { z } from 'genkit';

export const GenerateParetoChartDataInputSchema = z.object({
  problem: z.string().describe('The detailed description of the problem.'),
  priority: z.string().describe('The reason why solving this problem is a priority.'),
  impact: z.string().describe('The impact of the problem on costs, quality, security, or delivery.'),
  smartGoal: z.string().describe('The SMART goal to be achieved by solving this problem.'),
});
export type GenerateParetoChartDataInput = z.infer<typeof GenerateParetoChartDataInputSchema>;

export const ParetoChartDataPointSchema = z.object({
  name: z.string().describe('The name of the cause or category.'),
  value: z.number().describe('The frequency or cost associated with the cause.'),
});
export type ParetoChartDataPoint = z.infer<typeof ParetoChartDataPointSchema>;

export const GenerateParetoChartDataOutputSchema = z.array(ParetoChartDataPointSchema);
export type GenerateParetoChartDataOutput = z.infer<typeof GenerateParetoChartDataOutputSchema>;

export const InterpretParetoChartDataInputSchema = z.array(ParetoChartDataPointSchema);
export type InterpretParetoChartDataInput = z.infer<typeof InterpretParetoChartDataInputSchema>;

export const InterpretParetoChartDataOutputSchema = z.object({
  interpretation: z.string().describe('A brief interpretation of the Pareto chart data, in Portuguese, under 100 words.'),
});
export type InterpretParetoChartDataOutput = z.infer<typeof InterpretParetoChartDataOutputSchema>;
