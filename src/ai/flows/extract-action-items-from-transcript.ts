'use server';
/**
 * @fileOverview Extracts action items from a meeting transcript using AI.
 *
 * - extractActionItemsFromTranscript - A function that extracts action items from a meeting transcript.
 * - ExtractActionItemsFromTranscriptInput - The input type for the extractActionItemsFromTranscript function.
 * - ExtractActionItemsFromTranscriptOutput - The return type for the extractActionItemsFromTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractActionItemsFromTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting.'),
});
export type ExtractActionItemsFromTranscriptInput = z.infer<typeof ExtractActionItemsFromTranscriptInputSchema>;

const ExtractActionItemsFromTranscriptOutputSchema = z.object({
  actionItems: z.array(z.string()).describe('The action items extracted from the transcript.'),
});
export type ExtractActionItemsFromTranscriptOutput = z.infer<typeof ExtractActionItemsFromTranscriptOutputSchema>;

export async function extractActionItemsFromTranscript(input: ExtractActionItemsFromTranscriptInput): Promise<ExtractActionItemsFromTranscriptOutput> {
  return extractActionItemsFromTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsFromTranscriptPrompt',
  input: {schema: ExtractActionItemsFromTranscriptInputSchema},
  output: {schema: ExtractActionItemsFromTranscriptOutputSchema},
  prompt: `You are an AI assistant that extracts action items from a meeting transcript.\n\nTranscript: {{{transcript}}}\n\nAction Items:`,
});

const extractActionItemsFromTranscriptFlow = ai.defineFlow(
  {
    name: 'extractActionItemsFromTranscriptFlow',
    inputSchema: ExtractActionItemsFromTranscriptInputSchema,
    outputSchema: ExtractActionItemsFromTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
