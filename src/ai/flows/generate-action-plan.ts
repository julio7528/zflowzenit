'use server';

/**
 * @fileOverview A flow that generates an action plan based on a complete problem analysis.
 */

import { ai } from '@/ai/genkit';
import {
    AnalysisInputSchema,
    ActionPlanOutputSchema,
    type AnalysisInput,
    type ActionPlanOutput,
} from './analysis-types';

export async function generateActionPlan(input: AnalysisInput): Promise<ActionPlanOutput> {
    return generateActionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionPlanPrompt',
  input: { schema: AnalysisInputSchema },
  output: { schema: ActionPlanOutputSchema },
  prompt: `Você é um gerente de projetos sênior e especialista em metodologias de melhoria contínua.
Com base em toda a análise de causa raiz fornecida, crie um plano de ação passo a passo para eliminar a causa raiz fundamental identificada.
O plano de ação deve ser claro, conciso e prático. Cada passo deve ser uma ação distinta.
Para cada passo, forneça um 'theme' (um título com no máximo 5 palavras) e uma 'description' (uma descrição detalhada da ação com no máximo 40 palavras).
A resposta deve ser em português.

**Contexto Completo do Problema:**
- **Problema:** {{{problem}}}
- **Meta SMART:** {{{smartGoal}}}
- **Observação:** O problema ocorre em '{{{observation.where}}}', '{{{observation.when}}}', e se manifesta da seguinte forma: '{{{observation.how}}}'.
- **Interpretação de Pareto:** {{{paretoInterpretation}}}
- **Brainstorming:** {{{brainstormingSession}}}
- **Causas Priorizadas:** 
{{#each prioritizedCauses}}
- {{{cause}}}: {{{justification}}}
{{/each}}
- **Análise 5 Porquês (Causa Raiz):** {{{fiveWhysAnalysis.rootCause}}}

Crie um plano de ação detalhado com base na causa raiz identificada.
`,
});

const generateActionPlanFlow = ai.defineFlow(
    {
        name: 'generateActionPlanFlow',
        inputSchema: AnalysisInputSchema,
        outputSchema: ActionPlanOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
