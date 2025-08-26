'use server';

/**
 * @fileOverview Sets the task priority based on the task description.
 *
 * - setTaskPriority - A function that sets the task priority based on the task description.
 * - SetTaskPriorityInput - The input type for the setTaskPriority function.
 * - SetTaskPriorityOutput - The return type for the setTaskPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SetTaskPriorityInputSchema = z.object({
  description: z.string().describe('The description of the task.'),
});
export type SetTaskPriorityInput = z.infer<typeof SetTaskPriorityInputSchema>;

const SetTaskPriorityOutputSchema = z.object({
  priority: z
    .enum(['low', 'medium', 'high'])
    .describe("The suggested priority of the task, based on the description."),
});
export type SetTaskPriorityOutput = z.infer<typeof SetTaskPriorityOutputSchema>;

export async function setTaskPriority(input: SetTaskPriorityInput): Promise<SetTaskPriorityOutput> {
  return setTaskPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'setTaskPriorityPrompt',
  input: {schema: SetTaskPriorityInputSchema},
  output: {schema: SetTaskPriorityOutputSchema},
  prompt: `You are an AI assistant that helps users prioritize their tasks based on the task description.

  Analyze the task description and determine the appropriate priority for the task.

  If the description contains keywords such as "urgent", "critical", "ASAP", or "important", then the priority should be "high".
  If the description contains keywords such as "should", "eventually", or "when", then the priority should be "low".
  Otherwise, the priority should be "medium".

  Task Description: {{{description}}}
  `,
});

const setTaskPriorityFlow = ai.defineFlow(
  {
    name: 'setTaskPriorityFlow',
    inputSchema: SetTaskPriorityInputSchema,
    outputSchema: SetTaskPriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
