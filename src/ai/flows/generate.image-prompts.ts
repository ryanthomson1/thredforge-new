// src/ai/flows/generate.image-prompts.ts
'use server';

import { defineFlow, definePrompt, run } from '@genkit-ai/flow';
import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

// Input Schema
type GenerateImagePromptsInput = z.infer<typeof GenerateImagePromptsInputSchema>;
const GenerateImagePromptsInputSchema = z.object({
  threadPost: z.string().describe('The content of the original Threads post or idea.')
});

// Output Schema
type GenerateImagePromptsOutput = z.infer<typeof GenerateImagePromptsOutputSchema>;
const GenerateImagePromptsOutputSchema = z.object({
  imagePrompts: z.array(z.string()).describe('An array of generated image prompts.')
});

// AI Prompt Definition
const generateImagePromptsPrompt = ai.definePrompt({
  name: 'generateImagePromptsPrompt',
  input: {
    schema: GenerateImagePromptsInputSchema,
  },
  output: {
    schema: GenerateImagePromptsOutputSchema,
  },
  prompt: `You are a master prompt-engineer for a photo-realistic bear-man generator.
Input: a thread post idea (but never quote it).
Produce exactly 3 unique image prompts—each one:
 • Focus on a cute, slightly chubby 40-year-old multi-ethnic man wearing a plush bear-costume headpiece
 • Vary camera angle (e.g. close-up, wide-angle, over-the-shoulder)
 • Vary lighting (golden hour, neon glow, dramatic side-light)
 • Place him in a scene tied to the post’s theme (coffee shop, street art alley, living room)
 • Include one playful or surreal element (floating bubbles, lens flares, graffiti text)
 
Output a JSON object with a single key "imagePrompts" containing an array of standalone prompt strings.`
});

// Genkit Flow Definition
const generateImagePromptsFlow = defineFlow<
  typeof GenerateImagePromptsInputSchema,
  typeof GenerateImagePromptsOutputSchema
>({
  name: 'generateImagePromptsFlow',
  inputSchema: GenerateImagePromptsInputSchema,
  outputSchema: GenerateImagePromptsOutputSchema,
}, async (input: GenerateImagePromptsInput) => {
  console.log('Running generateImagePromptsFlow with input:', input);
  const { output } = await run(generateImagePromptsPrompt, input);

  if (output && Array.isArray(output.imagePrompts)) {
    console.log('Successfully generated image prompts.');
    return output;
  } else {
    console.error('Image prompt generation prompt returned invalid output format:', output);
    return { imagePrompts: [] };
  }
});

// Exported Server Action (only async function allowed to export)
export async function generateImagePrompts(
  input: GenerateImagePromptsInput
): Promise<GenerateImagePromptsOutput> {
  return generateImagePromptsFlow(input);
}

