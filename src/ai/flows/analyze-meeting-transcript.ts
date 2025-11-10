
'use server';
/**
 * @fileOverview A comprehensive meeting analysis AI agent.
 *
 * - analyzeMeetingTranscript - A function that handles the full analysis of a meeting transcript.
 * - AnalyzeMeetingTranscriptInput - The input type for the analyzeMeetingTranscript function.
 * - AnalyzeMeetingTranscriptOutput - The return type for the analyzeMeetingTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMeetingTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The full text transcript of the meeting.'),
});
export type AnalyzeMeetingTranscriptInput = z.infer<typeof AnalyzeMeetingTranscriptInputSchema>;

const AnalyzeMeetingTranscriptOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key discussion points, decisions, and outcomes.'),
  actionItems: z.array(z.string()).describe('A list of clear, actionable tasks assigned during the meeting.'),
  keywords: z.array(z.string()).describe('A list of the most important keywords, topics, or entities discussed.'),
  dates: z.array(z.string()).describe('Any specific dates mentioned (e.g., "October 25th", "next Wednesday").'),
  times: z.array(z.string()).describe('Any specific times mentioned (e.g., "2:00 PM PST", "EOD").'),
});
export type AnalyzeMeetingTranscriptOutput = z.infer<typeof AnalyzeMeetingTranscriptOutputSchema>;

export async function analyzeMeetingTranscript(input: AnalyzeMeetingTranscriptInput): Promise<AnalyzeMeetingTranscriptOutput> {
  return analyzeMeetingTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMeetingTranscriptPrompt',
  input: {schema: AnalyzeMeetingTranscriptInputSchema},
  output: {schema: AnalyzeMeetingTranscriptOutputSchema},
  prompt: `You are an expert meeting analysis assistant. Your task is to process the following meeting transcript and extract key information.

Analyze the transcript provided below and generate a structured JSON output with the following fields:
- summary: A concise summary of the key discussion points, decisions, and outcomes.
- actionItems: A list of clear, actionable tasks assigned during the meeting.
- keywords: A list of the most important keywords, topics, or project names discussed.
- dates: Any specific dates mentioned (e.g., "October 25th", "next Wednesday").
- times: Any specific times mentioned (e.g., "2:00 PM PST", "EOD").

Transcript:
{{{transcript}}}
`,
});

const analyzeMeetingTranscriptFlow = ai.defineFlow(
  {
    name: 'analyzeMeetingTranscriptFlow',
    inputSchema: AnalyzeMeetingTranscriptInputSchema,
    outputSchema: AnalyzeMeetingTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
