// tagged for gh commit 24 apr 25
'use server';
/**
 * @fileOverview A flow to generate image prompts based on an input text.
 *
 * - generateImagePrompts - A function that handles the image prompt generation process.
 * - GenerateImagePromptsInput - The input type for the generateImagePrompts function.
 * - GenerateImagePromptsOutput - The return type for the generateImagePrompts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateImagePromptsInputSchema = z.object({
  text: z.string().describe('The text to generate image prompts from.'),
});
export type GenerateImagePromptsInput = z.infer<typeof GenerateImagePromptsInputSchema>;

const GenerateImagePromptsOutputSchema = z.object({
  imagePrompts: z.array(z.string()).describe('An array of image prompts generated from the input text.'),
});
export type GenerateImagePromptsOutput = z.infer<typeof GenerateImagePromptsOutputSchema>;

export async function generateImagePrompts(input: GenerateImagePromptsInput): Promise<GenerateImagePromptsOutput> {
  return generateImagePromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImagePromptsPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to generate image prompts from.'),
    }),
  },
  output: {
    schema: z.object({
      imagePrompts: z.array(z.string()).describe('An array of image prompts generated from the input text.'),
    }),
  },
  prompt: `You are an AI assistant that generates image prompts based on the given text. Generate 5 different image prompts that would visually represent the text. Return a JSON array.

Text: {{{text}}}`,
});

const generateImagePromptsFlow = ai.defineFlow<
  typeof GenerateImagePromptsInputSchema,
  typeof GenerateImagePromptsOutputSchema
>({
  name: 'generateImagePromptsFlow',
  inputSchema: GenerateImagePromptsInputSchema,
  outputSchema: GenerateImagePromptsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

