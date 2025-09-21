'use server';

/**
 * @fileOverview A flow that interprets Pareto chart data.
 *
 * - interpretParetoChartData - A function that provides an interpretation of Pareto chart data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    InterpretParetoChartDataInputSchema, 
    InterpretParetoChartDataOutputSchema, 
    type InterpretParetoChartDataInput, 
    type InterpretParetoChartDataOutput 
} from './pareto-types';


export async function interpretParetoChartData(
  input: InterpretParetoChartDataInput
): Promise<InterpretParetoChartDataOutput> {
  return interpretParetoChartDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretParetoChartDataPrompt',
  input: { schema: z.object({ data: InterpretParetoChartDataInputSchema }) },
  output: { schema: InterpretParetoChartDataOutputSchema },
  prompt: `Você é um especialista em gestão de qualidade. Analise os seguintes dados do gráfico de Pareto, que representam as causas de um problema.

Dados:
{{#each data}}
- Causa: {{{name}}}, Valor: {{{value}}}
{{/each}}

Com base nesses dados, forneça uma interpretação concisa (no máximo 100 palavras) em português. Explique o princípio 80/20 conforme aplicado a esses dados, destacando as poucas causas vitais que são responsáveis pela maioria dos problemas.
`,
});

const interpretParetoChartDataFlow = ai.defineFlow(
  {
    name: 'interpretParetoChartDataFlow',
    inputSchema: InterpretParetoChartDataInputSchema,
    outputSchema: InterpretParetoChartDataOutputSchema,
  },
  async (data) => {
    const { output } = await prompt({ data });
    return output!;
  }
);
