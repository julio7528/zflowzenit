'use server';

/**
 * @fileOverview A flow that prioritizes potential causes of a problem.
 */

import { ai } from '@/ai/genkit';
import {
    AnalysisInputSchema,
    PrioritizationOutputSchema,
    type AnalysisInput,
    type PrioritizationOutput,
} from './analysis-types';

export async function generatePrioritization(input: AnalysisInput): Promise<PrioritizationOutput> {
    return generatePrioritizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrioritizationPrompt',
  input: { schema: AnalysisInputSchema },
  output: { schema: PrioritizationOutputSchema },
  prompt: `Você é um analista de qualidade sênior.
Com base em todo o contexto fornecido, priorize as causas potenciais do problema.
Use os dados da observação e a análise de Pareto para justificar por que certas causas são mais frequentes ou impactantes.
Apresente o resultado como uma lista de pontos (bullet points).
A resposta deve ser em português.

**Contexto Completo do Problema:**
- **Problema:** {{{problem}}}
- **Prioridade:** {{{priority}}}
- **Impacto:** {{{impact}}}
- **Meta SMART:** {{{smartGoal}}}

**Dados da Observação (Passo 2):**
- **Onde:** {{{observation.where}}}
- **Quando:** {{{observation.when}}}
- **Como:** {{{observation.how}}}
- **Dados Coletáveis:** {{{observation.data}}}

**Análise de Pareto (Gerada por IA):**
- **Dados:**
{{#each paretoData}}
- Causa: {{{name}}}, Valor: {{{value}}}
{{/each}}
- **Interpretação:** {{{paretoInterpretation}}}

Gere a lista de causas priorizadas com base neste contexto.
`,
});

const generatePrioritizationFlow = ai.defineFlow(
    {
        name: 'generatePrioritizationFlow',
        inputSchema: AnalysisInputSchema,
        outputSchema: PrioritizationOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);