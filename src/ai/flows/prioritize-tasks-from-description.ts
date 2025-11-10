'use server';
/**
 * @fileOverview An AI agent that prioritizes tasks based on description.
 *
 * - prioritizeTasksFromDescription - A function that handles the task prioritization process.
 * - PrioritizeTasksFromDescriptionInput - The input type for the prioritizeTasksFromDescription function.
 * - PrioritizeTasksFromDescriptionOutput - The return type for the prioritizeTasksFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksFromDescriptionInputSchema = z.object({
  description: z.string().describe('The description of the task.'),
});
export type PrioritizeTasksFromDescriptionInput = z.infer<typeof PrioritizeTasksFromDescriptionInputSchema>;

const PrioritizeTasksFromDescriptionOutputSchema = z.object({
  priority: z
    .number()
    .describe(
      'A number between 1 and 10, with 1 being the highest priority and 10 being the lowest priority, indicating the priority of the task.'
    ),
  reason: z.string().describe('The reasoning behind the priority score.'),
});
export type PrioritizeTasksFromDescriptionOutput = z.infer<typeof PrioritizeTasksFromDescriptionOutputSchema>;

export async function prioritizeTasksFromDescription(
  input: PrioritizeTasksFromDescriptionInput
): Promise<PrioritizeTasksFromDescriptionOutput> {
  return prioritizeTasksFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksFromDescriptionPrompt',
  input: {schema: PrioritizeTasksFromDescriptionInputSchema},
  output: {schema: PrioritizeTasksFromDescriptionOutputSchema},
  prompt: `You are an AI assistant that helps users prioritize their tasks. You will be given a description of a task, and you will respond with a priority score between 1 and 10, with 1 being the highest priority and 10 being the lowest priority.
\nTask Description: {{{description}}}
\nRespond with a JSON object containing the priority score and the reasoning behind the score.
`,
});

const prioritizeTasksFromDescriptionFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFromDescriptionFlow',
    inputSchema: PrioritizeTasksFromDescriptionInputSchema,
    outputSchema: PrioritizeTasksFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
