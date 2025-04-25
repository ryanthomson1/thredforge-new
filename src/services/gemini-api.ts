// src/services/gemini-api.ts
import { ai } from "@/ai/ai-instance";

export const generateText = async (prompt: string) => {
  try {
    const result = await ai.generate(prompt);
    console.log("Generated text:", result.text);
    return result.text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};
