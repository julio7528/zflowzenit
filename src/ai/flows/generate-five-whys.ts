'use server';

/**
 * @fileOverview A flow that applies the 5 Whys technique to find a root cause.
 */

import { ai } from '@/ai/genkit';
import {
    AnalysisInputSchema,
    FiveWhysOutputSchema,
    type AnalysisInput,
    type FiveWhysOutput,
} from './analysis-types';

export async function generateFiveWhys(input: AnalysisInput): Promise<FiveWhysOutput> {
    return generateFiveWhysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFiveWhysPrompt',
  input: { schema: AnalysisInputSchema },
  output: { schema: FiveWhysOutputSchema },
  prompt: `Você é um especialista em análise de causa raiz.
Com base no contexto completo do problema e na análise de Pareto, pegue a causa principal (a primeira da lista de dados do Pareto) e aplique a técnica dos 5 Porquês para encontrar a causa raiz fundamental.
Para cada "Porquê", forneça uma resposta plausível com base no contexto geral.
A resposta deve ser em português.

**Contexto Completo do Problema:**
- **Problema:** {{{problem}}}
- **Prioridade:** {{{priority}}}
- **Impacto:** {{{impact}}}
- **Meta SMART:** {{{smartGoal}}}
- **Observação:** {{{observation.how}}}

**Análise de Pareto (Gerada por IA):**
- **Dados:**
{{#each paretoData}}
- Causa: {{{name}}}, Valor: {{{value}}}
{{/each}}
- **Causa Principal a ser investigada:** {{paretoData.0.name}}

Aplique a técnica dos 5 Porquês para a causa principal.
`,
});

const generateFiveWhysFlow = ai.defineFlow(
    {
        name: 'generateFiveWhysFlow',
        inputSchema: AnalysisInputSchema,
        outputSchema: FiveWhysOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);