'use server';

/**
 * @fileOverview A flow that generates a brainstorming session for root cause analysis.
 */

import { ai } from '@/ai/genkit';
import {
    AnalysisInputSchema,
    BrainstormingOutputSchema,
    type AnalysisInput,
    type BrainstormingOutput,
} from './analysis-types';

export async function generateBrainstorming(input: AnalysisInput): Promise<BrainstormingOutput> {
    return generateBrainstormingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrainstormingPrompt',
  input: { schema: AnalysisInputSchema },
  output: { schema: BrainstormingOutputSchema },
  prompt: `Você é um facilitador de workshops de qualidade e especialista em resolução de problemas.
Com base em todo o contexto fornecido abaixo, conduza uma sessão de brainstorming para identificar possíveis causas para o problema.
Sua saída deve ser uma tematização das possíveis causas, agrupando-as por afinidade, para ajudar a equipe a visualizar as áreas de foco.
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

Gere a sessão de brainstorming com base neste contexto.
`,
});

const generateBrainstormingFlow = ai.defineFlow(
    {
        name: 'generateBrainstormingFlow',
        inputSchema: AnalysisInputSchema,
        outputSchema: BrainstormingOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);