
'use server';
/**
 * @fileOverview A test case generation AI agent.
 *
 * - generateTestCases - A function that handles the test case generation process.
 * - GenerateTestCasesInput - The input type for the generateTestCases function.
 * - GenerateTestCasesOutput - The return type for the generateTestCases function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTestCasesInputSchema = z.object({
  code: z.string().describe('The code or feature description to generate test cases for.'),
  language: z.string().describe('The programming language of the code.'),
  framework: z.string().describe('The testing framework to use (e.g., Jest, PyTest, JUnit).'),
});
export type GenerateTestCasesInput = z.infer<typeof GenerateTestCasesInputSchema>;

const GenerateTestCasesOutputSchema = z.object({
  testCases: z.string().describe('A JSON string of an array of test case objects. Includes a summary of the test cases.'),
});
export type GenerateTestCasesOutput = z.infer<typeof GenerateTestCasesOutputSchema>;

export async function generateTestCases(
  input: GenerateTestCasesInput
): Promise<GenerateTestCasesOutput> {
  return generateTestCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: { schema: GenerateTestCasesInputSchema },
  // We ask for a string and will parse it in the app, as complex nested objects can be unreliable.
  output: { schema: GenerateTestCasesOutputSchema },
  prompt: `Act as an expert developer and QA engineer.
Given this code or feature description, generate thorough, contextual test cases so all important branches, edge conditions, and failures are exercised.
Return output as a JSON array of test case objects. Each object must have the following structure:
{
  "title": "string",
  "description": "string",
  "input": "any",
  "expected_output": "any",
  "edge_case": "boolean"
}

After the JSON array, add a short summary explaining which problems these test cases cover, and why they’re important for reliability.

Description/Code:
\'\'\'{{{language}}}
{{{code}}}
\'\'\'

Testing Framework: {{{framework}}}
`,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: GenerateTestCasesInputSchema,
    outputSchema: GenerateTestCasesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
