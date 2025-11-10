
'use server';
/**
 * @fileOverview A documentation generation AI agent.
 *
 * - generateDocumentation - A function that handles the documentation generation process.
 * - GenerateDocumentationInput - The input type for the generateDocumentation function.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDocumentationInputSchema = z.object({
  code: z.string().describe('The code, function, or feature description to generate documentation for.'),
  language: z.string().describe('The programming language of the code.'),
});
export type GenerateDocumentationInput = z.infer<typeof GenerateDocumentationInputSchema>;

const GenerateDocumentationOutputSchema = z.object({
  documentation: z.string().describe('The generated user-friendly documentation.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

export async function generateDocumentation(
  input: GenerateDocumentationInput
): Promise<GenerateDocumentationOutput> {
  return generateDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentationPrompt',
  input: { schema: GenerateDocumentationInputSchema },
  output: { schema: GenerateDocumentationOutputSchema },
  prompt: `Act as a senior technical writer for a futuristic, AI-augmented developer tool.
Given code, function, or feature description, write clear, friendly user documentation anyone can follow.
- Start with a concise docstring/summary.
- Add sections for Usage, Parameters/Inputs, Outputs, Examples (with brief explanation).
- Suggest future improvements or related functions at the end.
- Make sure the language is easy for beginners, but deep enough for pros.

Code/Description:
\'\'\'{{{language}}}
{{{code}}}
\'\'\'
`,
});

const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: GenerateDocumentationInputSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
