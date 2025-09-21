'use server';

/**
 * @fileOverview A flow that generates data for a Pareto chart based on a problem description.
 *
 * - generateParetoChartData - Generates data for a Pareto chart.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateParetoChartDataInputSchema, 
  GenerateParetoChartDataOutputSchema,
  type GenerateParetoChartDataInput,
  type GenerateParetoChartDataOutput
} from './pareto-types';


export async function generateParetoChartData(
  input: GenerateParetoChartDataInput
): Promise<GenerateParetoChartDataOutput> {
  return generateParetoChartDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateParetoChartDataPrompt',
  input: { schema: GenerateParetoChartDataInputSchema },
  output: { schema: GenerateParetoChartDataOutputSchema },
  prompt: `Você é um especialista em gestão de qualidade e metodologias de resolução de problemas como PDCA e MASP.
Com base na descrição completa do problema fornecida abaixo, identifique as principais causas e suas frequências ou impactos para criar dados para um gráfico de Pareto.

O princípio de Pareto (regra 80/20) afirma que, para muitos resultados, cerca de 80% das consequências vêm de 20% das causas.
Sua tarefa é decompor o problema em causas potenciais e atribuir um valor quantitativo (como frequência, custo ou tempo) a cada uma.

Retorne um array de objetos, onde cada objeto tem um 'name' (a causa em português) e um 'value' (a frequência ou impacto).
O array deve ser ordenado em ordem decrescente de valor.
Gere entre 5 e 8 causas. Os dados devem ser realistas com base no contexto fornecido.
Toda a saída, incluindo os nomes das causas, deve ser em português.

Contexto Completo do Problema:
- Problema: {{{problem}}}
- Prioridade: {{{priority}}}
- Impacto: {{{impact}}}
- Meta SMART: {{{smartGoal}}}

Gere os dados do gráfico de Pareto com base neste contexto.
`,
});

const generateParetoChartDataFlow = ai.defineFlow(
  {
    name: 'generateParetoChartDataFlow',
    inputSchema: GenerateParetoChartDataInputSchema,
    outputSchema: GenerateParetoChartDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
