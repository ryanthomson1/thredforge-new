import { ChatCompletionRequestMessage } from "openai";
import { callGemini } from "@/services/gemini";

export interface GenerateImagePromptsInput {
  threadPost: string;
}

/**
 * Generates 3 unique image prompts based on a thread post.
 * Each prompt will vary angle, lighting, setting, and include a playful or surreal element.
 * Returns a JSON-parsed array of prompt strings.
 */
export async function generateImagePrompts(
  { threadPost }: GenerateImagePromptsInput
): Promise<string[]> {
  // System instructions for the prompt-engineer LLM
  const systemMessage = `
You are a master prompt-engineer for a photo-realistic bear-man generator.
Input: a thread post idea (but never quote it).
Produce exactly 3 unique image prompts—each one:
 • Focus on a cute, slightly chubby 40-year-old multi-ethnic man wearing a plush bear-costume headpiece
 • Vary camera angle (e.g. close-up, wide-angle, over-the-shoulder)
 • Vary lighting (golden hour, neon glow, dramatic side-light)
 • Place him in a scene tied to the post’s theme (coffee shop, street art alley, living room)
 • Include one playful or surreal element (floating bubbles, lens flares, graffiti text)
 • End with a standalone image description—no extra commentary, no direct quotes from the post
Output as a JSON array of strings.
  `.trim();

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: threadPost }
  ];

  // Call Gemini (or your preferred LLM) to engineer prompts
  const rawResponse = await callGemini({ messages });

  try {
    const prompts = JSON.parse(rawResponse) as string[];
    return prompts.map(p => p.trim());
  } catch (error) {
    throw new Error(`Failed to parse image prompts from Gemini response: ${rawResponse}`);
  }
}
