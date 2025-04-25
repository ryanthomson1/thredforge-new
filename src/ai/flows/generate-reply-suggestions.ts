// tagged for gh commit 24 apr 25
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating reply suggestions to a Threads post.
 *
 * - generateReplySuggestions - A function that takes a post content and system instruction as input and returns a list of suggested replies.
 * - GenerateReplySuggestionsInput - The input type for the generateReplySuggestions function.
 * - GenerateReplySuggestionsOutput - The return type for the generateReplySuggestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateReplySuggestionsInputSchema = z.object({
  postContent: z.string().describe('The content of the original Threads post.'),
  systemInstruction: z.string().describe('System instruction to guide the reply generation.'),
});
export type GenerateReplySuggestionsInput = z.infer<typeof GenerateReplySuggestionsInputSchema>;

const GenerateReplySuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A suggested reply to the original post.')
  ).describe('A list of suggested replies.')
});
export type GenerateReplySuggestionsOutput = z.infer<typeof GenerateReplySuggestionsOutputSchema>;

export async function generateReplySuggestions(input: GenerateReplySuggestionsInput): Promise<GenerateReplySuggestionsOutput> {
  return generateReplySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReplySuggestionsPrompt',
  input: {
    schema: z.object({
      postContent: z.string().describe('The content of the original Threads post.'),
      systemInstruction: z.string().describe('System instruction to guide the reply generation.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.array(
        z.string().describe('A suggested reply to the original post.')
      ).describe('A list of suggested replies.')
    }),
  },
  prompt: `You are an AI assistant designed to generate reply suggestions to Threads posts.

  Given the following post content and system instruction, generate a list of suggested replies.

  Post Content: {{{postContent}}}
  System Instruction: {{{systemInstruction}}}

  Suggestions:`, // Ensure the output is valid JSON format for parsing.
});

const generateReplySuggestionsFlow = ai.defineFlow<
  typeof GenerateReplySuggestionsInputSchema,
  typeof GenerateReplySuggestionsOutputSchema
>(
  {
    name: 'generateReplySuggestionsFlow',
    inputSchema: GenerateReplySuggestionsInputSchema,
    outputSchema: GenerateReplySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
