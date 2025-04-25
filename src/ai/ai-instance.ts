import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// src/lib/ai-instance.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY as string);

export default genAI;

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
