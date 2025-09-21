'use server';

/**
 * @fileOverview A flow that adaptively adjusts the urgency factor in the GUT matrix based on the user's task completion behavior.
 *
 * - adjustUrgency - A function that adjusts the urgency factor.
 * - AdjustUrgencyInput - The input type for the adjustUrgency function.
 * - AdjustUrgencyOutput - The return type for the adjustUrgency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustUrgencyInputSchema = z.object({
  taskCompletionRate: z
    .number()
    .describe(
      'The user\u0027s task completion rate, a value between 0 and 1.  A higher number indicates a higher likelihood of completing tasks on time.'
    ),
  averageTaskCompletionTime: z
    .number()
    .describe(
      'The average time it takes the user to complete a task, in hours. A lower number indicates the user completes task faster.'
    ),
  urgency: z.number().describe('The current urgency factor in the GUT matrix.'),
});
export type AdjustUrgencyInput = z.infer<typeof AdjustUrgencyInputSchema>;

const AdjustUrgencyOutputSchema = z.object({
  adjustedUrgency: z
    .number()
    .describe(
      'The adjusted urgency factor in the GUT matrix, based on the user\u0027s task completion behavior.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the adjusted urgency factor.'),
});
export type AdjustUrgencyOutput = z.infer<typeof AdjustUrgencyOutputSchema>;

export async function adjustUrgency(input: AdjustUrgencyInput): Promise<AdjustUrgencyOutput> {
  return adjustUrgencyFlow(input);
}

const adjustUrgencyPrompt = ai.definePrompt({
  name: 'adjustUrgencyPrompt',
  input: {schema: AdjustUrgencyInputSchema},
  output: {schema: AdjustUrgencyOutputSchema},
  prompt: `You are an expert in task management and prioritization. Given a user's task completion rate (between 0 and 1), their average task completion time (in hours), and the current urgency factor in the GUT matrix, you will adjust the urgency factor to better reflect the user's actual responsiveness to deadlines.

Task Completion Rate: {{{taskCompletionRate}}}
Average Task Completion Time: {{{averageTaskCompletionTime}}}
Current Urgency: {{{urgency}}}

Consider the following:
- A higher task completion rate suggests the user is good at meeting deadlines, so the urgency factor can remain relatively stable or even be slightly decreased if the completion time is very low.
- A lower task completion rate suggests the user struggles to meet deadlines, so the urgency factor should be increased.
- A lower average task completion time suggests the user completes tasks quickly, so the urgency factor can be decreased.
- A higher average task completion time suggests the user takes longer to complete tasks, so the urgency factor should be increased.

Provide a brief reasoning for the adjustment.

Adjusted Urgency:`,
});

const adjustUrgencyFlow = ai.defineFlow(
  {
    name: 'adjustUrgencyFlow',
    inputSchema: AdjustUrgencyInputSchema,
    outputSchema: AdjustUrgencyOutputSchema,
  },
  async input => {
    const {output} = await adjustUrgencyPrompt(input);
    return output!;
  }
);
