'use server';
/**
 * @fileOverview A theme generation AI agent.
 *
 * - generateTheme - A function that handles the theme generation process.
 * - GenerateThemeInput - The input type for the generateTheme function.
 * - GenerateThemeOutput - The return type for the generateTheme function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { promises as fs } from 'fs';
import path from 'path';

const GenerateThemeInputSchema = z.object({
  prompt: z
    .string()
    .describe('A prompt to generate a new theme from, e.g. "A cyberpunk theme"'),
});
export type GenerateThemeInput = z.infer<typeof GenerateThemeInputSchema>;

const GenerateThemeOutputSchema = z.object({
  theme: z.object({
    light: z.object({
      background: z.string().describe('The background color'),
      foreground: z.string().describe('The foreground color'),
      primary: z.string().describe('The primary color'),
      'primary-foreground': z.string().describe('The primary-foreground color'),
      secondary: z.string().describe('The secondary color'),
      'secondary-foreground': z
        .string()
        .describe('The secondary-foreground color'),
      muted: z.string().describe('The muted color'),
      'muted-foreground': z.string().describe('The muted-foreground color'),
      accent: z.string().describe('The accent color'),
      'accent-foreground': z.string().describe('The accent-foreground color'),
      destructive: z.string().describe('The destructive color'),
      'destructive-foreground': z
        .string()
        .describe('The destructive-foreground color'),
      border: z.string().describe('The border color'),
      input: z.string().describe('The input color'),
      ring: z.string().describe('The ring color'),
    }),
    dark: z.object({
      background: z.string().describe('The background color'),
      foreground: z.string().describe('The foreground color'),
      primary: z.string().describe('The primary color'),
      'primary-foreground': z.string().describe('The primary-foreground color'),
      secondary: z.string().describe('The secondary color'),
      'secondary-foreground': z
        .string()
        .describe('The secondary-foreground color'),
      muted: z.string().describe('The muted color'),
      'muted-foreground': z.string().describe('The muted-foreground color'),
      accent: z.string().describe('The accent color'),
      'accent-foreground': z.string().describe('The accent-foreground color'),
      destructive: z.string().describe('The destructive color'),
      'destructive-foreground': z
        .string()
        .describe('The destructive-foreground color'),
      border: z.string().describe('The border color'),
      input: z.string().describe('The input color'),
      ring: z.string().describe('The ring color'),
    }),
  }),
});
export type GenerateThemeOutput = z.infer<typeof GenerateThemeOutputSchema>;

export async function generateTheme(
  input: GenerateThemeInput
): Promise<GenerateThemeOutput> {
  const result = await generateThemeFlow(input);
  await applyTheme(result.theme);
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateThemePrompt',
  input: { schema: GenerateThemeInputSchema },
  output: { schema: GenerateThemeOutputSchema },
  prompt: `You are an expert theme designer. You will generate a new theme based on the prompt provided. The theme should be accessible and visually appealing. All colors must be in HSL format.

  You must provide a light and a dark version of the theme.

Prompt: {{{prompt}}}
`,
});

const generateThemeFlow = ai.defineFlow(
  {
    name: 'generateThemeFlow',
    inputSchema: GenerateThemeInputSchema,
    outputSchema: GenerateThemeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

async function applyTheme(theme: GenerateThemeOutput['theme']) {
  const cssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  let cssContent = await fs.readFile(cssPath, 'utf-8');

  // Helper to replace variables for a given mode (light or dark)
  const replaceThemeVariables = (
    mode: 'light' | 'dark',
    vars: Record<string, string>
  ) => {
    const selector = mode === 'light' ? ':root' : '.dark';
    const regex = new RegExp(`(${selector}\\s*{[^}]*})`, 's');
    const match = cssContent.match(regex);

    if (match) {
      let block = match[1];
      for (const [key, value] of Object.entries(vars)) {
        const a = new RegExp(`--${key}:\\s*[^;]*;`);
        if (block.match(a)) {
          block = block.replace(a, `--${key}: ${value};`);
        }
      }
      cssContent = cssContent.replace(match[0], block);
    }
  };

  replaceThemeVariables('light', theme.light);
  replaceThemeVariables('dark', theme.dark);

  await fs.writeFile(cssPath, cssContent, 'utf-8');
}
