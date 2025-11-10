
'use server';

/**
 * @fileOverview A code generation AI agent.
 *
 * - generateCodeSnippet - A function that handles the code generation process.
 * - GenerateCodeSnippetInput - The input type for the generateCodeSnippet function.
 * - GenerateCodeSnippetOutput - The return type for the generateCodeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeSnippetInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A problem statement or requirements for the code to be generated.'),
  programmingLanguage: z
    .string()
    .describe('The programming language for the code snippet.'),
});
export type GenerateCodeSnippetInput = z.infer<
  typeof GenerateCodeSnippetInputSchema
>;

const GenerateCodeSnippetOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet, including inline comments and explanations.'),
});
export type GenerateCodeSnippetOutput = z.infer<
  typeof GenerateCodeSnippetOutputSchema
>;

export async function generateCodeSnippet(
  input: GenerateCodeSnippetInput
): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetPrompt',
  input: {schema: GenerateCodeSnippetInputSchema},
  output: {schema: GenerateCodeSnippetOutputSchema},
  prompt: `Act as an advanced coding AI.
Given a problem statement or requirements, generate a complete code snippet that solves the problem.
- Write idiomatic, readable code for the specified language (default: JavaScript/TypeScript for Firebase, unless user requests otherwise).
- Provide inline comments for clarity.
- Explain design choices briefly underneath.
- If the code can use Firebase features (Firestore queries, Auth, Functions), integrate them naturally and securely.

Request:
{{{taskDescription}}}

Language: {{{programmingLanguage}}}
`,
});

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
