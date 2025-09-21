'use server';

/**
 * @fileOverview A flow that generates a comparative analysis of a problem before and after actions.
 */

import { ai } from '@/ai/genkit';
import {
    ComparativeAnalysisInputSchema,
    ComparativeAnalysisOutputSchema,
    type ComparativeAnalysisInput,
    type ComparativeAnalysisOutput,
} from './analysis-types';

export async function generateComparativeAnalysis(input: ComparativeAnalysisInput): Promise<ComparativeAnalysisOutput> {
    return generateComparativeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComparativeAnalysisPrompt',
  input: { schema: ComparativeAnalysisInputSchema },
  output: { schema: ComparativeAnalysisOutputSchema },
  prompt: `Você é um especialista em análise de dados e gestão da qualidade.
Com base nos dados fornecidos do "antes" (Gráfico de Pareto inicial) e no contexto do "depois" (resultados da verificação), crie uma tabela comparativa.

Sua tarefa é estimar o "Valor Posterior" para cada causa com base nos resultados descritos na verificação. O "Valor Posterior" deve ser um número realista que reflita se o problema foi reduzido, eliminado ou se teve efeitos colaterais.
Calcule a "Mudança Percentual" para cada causa. Uma redução deve ser um número negativo.

**Contexto Inicial:**
- **Problema:** {{{problem}}}
- **Dados de Pareto (Antes):**
{{#each paretoDataBefore}}
- Causa: {{{name}}}, Valor: {{{value}}}
{{/each}}

**Contexto da Verificação (Depois):**
- **Meta Atingida?** {{{check.goalMet}}}
- **Problema Reduzido?** {{{check.problemReduced}}}
- **Efeitos Colaterais?** {{{check.sideEffects}}}

Gere a tabela comparativa com base neste contexto. O "afterValue" deve ser inferido a partir das descrições do contexto da verificação.
A resposta deve ser em português.
`,
});

const generateComparativeAnalysisFlow = ai.defineFlow(
    {
        name: 'generateComparativeAnalysisFlow',
        inputSchema: ComparativeAnalysisInputSchema,
        outputSchema: ComparativeAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
