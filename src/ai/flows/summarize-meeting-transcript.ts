'use server';

/**
 * @fileOverview Summarizes a meeting transcript to extract key discussion points.
 *
 * - summarizeMeetingTranscript - A function that handles the summarization process.
 * - SummarizeMeetingTranscriptInput - The input type for the summarizeMeetingTranscript function.
 * - SummarizeMeetingTranscriptOutput - The return type for the summarizeMeetingTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting to be summarized.'),
});
export type SummarizeMeetingTranscriptInput = z.infer<typeof SummarizeMeetingTranscriptInputSchema>;

const SummarizeMeetingTranscriptOutputSchema = z.object({
  summary: z.string().describe('A summary of the key discussion points from the meeting.'),
});
export type SummarizeMeetingTranscriptOutput = z.infer<typeof SummarizeMeetingTranscriptOutputSchema>;

export async function summarizeMeetingTranscript(
  input: SummarizeMeetingTranscriptInput
): Promise<SummarizeMeetingTranscriptOutput> {
  return summarizeMeetingTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingTranscriptPrompt',
  input: {schema: SummarizeMeetingTranscriptInputSchema},
  output: {schema: SummarizeMeetingTranscriptOutputSchema},
  prompt: `You are an expert meeting summarizer. Please summarize the following meeting transcript, identifying the key discussion points.\n\nTranscript: {{{transcript}}}`,
});

const summarizeMeetingTranscriptFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingTranscriptFlow',
    inputSchema: SummarizeMeetingTranscriptInputSchema,
    outputSchema: SummarizeMeetingTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
