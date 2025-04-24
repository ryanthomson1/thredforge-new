'use server';
/**
 * @fileOverview A Threads post generator AI agent.
 *
 * - generateThreadsPosts - A function that handles the thread post generation process.
 * - GenerateThreadsPostsInput - The input type for the generateThreadsPosts function.
 * - GenerateThreadsPostsOutput - The return type for the generateThreadsPosts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateThreadsPostsInputSchema = z.object({
  idea: z.string().describe('The idea or topic for the Threads post.'),
  systemInstruction: z.string().optional().describe('Optional system instruction to guide the AI.'),
  includeImages: z.boolean().optional().describe('Whether or not to include images.'),
});
export type GenerateThreadsPostsInput = z.infer<typeof GenerateThreadsPostsInputSchema>;

const GenerateThreadsPostsOutputSchema = z.object({
  posts: z.array(z.string()).describe('An array of generated Threads posts.'),
});
export type GenerateThreadsPostsOutput = z.infer<typeof GenerateThreadsPostsOutputSchema>;

export async function generateThreadsPosts(input: GenerateThreadsPostsInput): Promise<GenerateThreadsPostsOutput> {
  return generateThreadsPostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThreadsPostsPrompt',
  input: {
    schema: z.object({
      idea: z.string().describe('The idea or topic for the Threads post.'),
      systemInstruction: z.string().optional().describe('Optional system instruction to guide the AI.'),
      includeImages: z.boolean().optional().describe('Whether or not to include images.'),
    }),
  },
  output: {
    schema: z.object({
      posts: z.array(z.string()).describe('An array of generated Threads posts.'),
    }),
  },
  prompt: `You are a social media expert specializing in creating engaging Threads posts.

You will use the following information to generate 5 different versions of a Threads post about the given idea or topic. Ensure each post is unique and engaging.

Idea: {{{idea}}}
System Instruction: {{{systemInstruction}}}
Include Images: {{{includeImages}}}

Your output should be an array of 5 different post variations.
`,
});

const generateThreadsPostsFlow = ai.defineFlow<
  typeof GenerateThreadsPostsInputSchema,
  typeof GenerateThreadsPostsOutputSchema
>({
  name: 'generateThreadsPostsFlow',
  inputSchema: GenerateThreadsPostsInputSchema,
  outputSchema: GenerateThreadsPostsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
