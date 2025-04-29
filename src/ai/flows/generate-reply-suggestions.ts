// src/ai/flows/generate-reply-suggestions.ts
'use server'; // This should be the very first line

// Correct Genkit Imports - Using named imports
import { defineTool, run, type Tool, defineFlow, definePrompt } from '@genkit-ai/flow'; // Import from @genkit-ai/flow
import { ai } from '@/ai/ai-instance'; // Import ai instance from your project file

import { z } from 'genkit';

// Correct Firestore Imports (combine all needed imports into one line) - Client-side SDK used for reads
import { firestore } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where, // Import where from firebase/firestore for queries
  getDocs,
  DocumentData // Also need DocumentData for casting
} from 'firebase/firestore';


// Define types for Firestore documents (ensure consistency with your DB and other files)
export interface SystemInstruction {
  id: string; // Firestore Document ID
  name: string;
  content: string;
  is_default?: boolean; // Added for default instruction query
  // Add other fields as needed
}

export interface EmotionTag {
  id: string; // Firestore Document ID (e.g., 'joy', 'anger')
  emotion_name: string; // Human-readable name
  description?: string;
  // associated_personas should store System Instruction IDs (strings), not direct references
  associated_personas?: string[]; // Array of System Instruction IDs
  // Add other fields as needed
}

export interface Keyword {
  id: string; // Firestore Document ID
  keyword_name: string;
  normalized_name: string; // Lowercase trimmed version for search
  popularity_count?: number;
  last_used?: Date; // Use Date for timestamps in TS
  emotional_score?: number;
  // emotional_tags should store Emotion Tag IDs (strings), not direct references
  emotional_tags?: string[]; // Array of Emotion Tag IDs
  // user_routing should store User ID (string), not direct reference
  user_routing?: string; // User ID (document ID)
  created_at?: Date; // Added created_at
  status?: string; // Added status
  // Add other fields as needed
}

export interface AppUser { // Renamed from User to AppUser to avoid conflicts
  id: string; // Firestore Document ID (e.g., Firebase Auth UID)
  username: string;
  threads_user_id?: string;
  // default_instruction_id should store System Instruction ID (string), not direct reference
  default_instruction_id?: string; // System instruction ID
  created_at?: Date;
  settings?: { [key: string]: any };
  // Add other fields as needed
}


const GenerateReplySuggestionsInputSchema = z.object({
  postContent: z.string().describe('The content of the original Threads post.'),
  systemInstruction: z.string().optional().describe('Optional system instruction to guide the AI (used as fallback).'),
});
export type GenerateReplySuggestionsInput = z.infer<typeof GenerateReplySuggestionsInputSchema>;

const GenerateReplySuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A suggested reply to the original post.')
  ).describe('A list of suggested replies.')
});
export type GenerateReplySuggestionsOutput = z.infer<typeof GenerateReplySuggestionsOutputSchema>;


// --- Genkit Tools Definitions ---

// Define a tool to fetch emotion tags from Firestore
// *** Updated usage with defineTool and Tool (removed GenkitFlow. prefix) ***
const getEmotionTagsTool: Tool = defineTool(
  {
    name: 'getEmotionTags',
    description: 'Fetches the available emotion tags from Firestore.',
  },
  z.object({}), // Input schema (empty)
  async (input: {}) => { // Function implementation with explicit input type
    const snapshot = await getDocs(collection(firestore, 'ai_emo_tags'));
    // Map document data to EmotionTag interface, using doc.id as the tag ID
    return snapshot.docs.map(doc => {
        const data = doc.data() as Omit<EmotionTag, 'id'>;
        return { id: doc.id, ...data };
    });
  }
);

// Define a tool to fetch a system instruction from Firestore by ID
// *** Updated usage with defineTool and Tool (removed GenkitFlow. prefix) ***
const getSystemInstructionTool: Tool = defineTool(
  {
    name: 'getSystemInstruction',
    description: 'Fetches a system instruction from Firestore by its ID.',
  },
  z.object({ // Input schema
    instructionId: z.string().describe('The ID of the system instruction to fetch.'),
  }),
  async (input: { instructionId: string }) => { // Function implementation with explicit input type
    const docRef = doc(firestore, 'system_instructions', input.instructionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
       // Map Firestore data to SystemInstruction interface
      const data = docSnap.data() as Omit<SystemInstruction, 'id'>;
      return { id: docSnap.id, ...data };
    } else {
      return null;
    }
  }
);

// Define a tool to fetch keywords from Firestore
// *** Updated usage with defineTool and Tool (removed GenkitFlow. prefix) ***
const getKeywordsTool: Tool = defineTool(
  {
    name: 'getKeywords',
    description: 'Fetches all keywords from Firestore.',
  },
   z.object({}), // Input schema (empty)
  async (input: {}) => { // Function implementation with explicit input type
    const snapshot = await getDocs(collection(firestore, 'keywords'));
     // Map document data to Keyword interface, using doc.id as the keyword ID
    return snapshot.docs.map(doc => {
        const data = doc.data() as Omit<Keyword, 'id'>;
        // Convert Firestore Timestamps to JavaScript Dates if necessary
        if (data.last_used && typeof data.last_used === 'object' && 'toDate' in data.last_used) {
             data.last_used = (data.last_used as any).toDate(); // Assuming it's a Firestore Timestamp object
        }
         if (data.created_at && typeof data.created_at === 'object' && 'toDate' in data.created_at) {
             data.created_at = (data.created_at as any).toDate(); // Assuming it's a Firestore Timestamp object
        }
        return { id: doc.id, ...data };
    });
  }
);

// Define a tool to fetch a user from Firestore by ID
// *** Updated usage with defineTool and Tool (removed GenkitFlow. prefix) ***
const getUserTool: Tool = defineTool(
  {
    name: 'getUser',
    description: 'Fetches a user from Firestore by their ID.',
  },
  z.object({ // Input schema
    userId: z.string().describe('The ID of the user to fetch.'),
  }),
  async (input: { userId: string }) => { // Function implementation with explicit input type
    const docRef = doc(firestore, 'users', input.userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
       // Map document data to AppUser interface
      const data = docSnap.data() as Omit<AppUser, 'id'>;
       // Convert Firestore Timestamps to JavaScript Dates if necessary
        if (data.created_at && typeof data.created_at === 'object' && 'toDate' in data.created_at) {
             data.created_at = (data.created_at as any).toDate(); // Assuming it's a Firestore Timestamp object
        }
      return { id: docSnap.id, ...data };
    } else {
      return null;
    }
  }
);


// --- Genkit Prompt Definitions ---

// Define a prompt specifically for emotion analysis
// *** Updated usage with ai.definePrompt (ai is imported separately) ***
const emotionAnalysisPrompt = ai.definePrompt({
  name: 'emotionAnalysisPrompt',
  input: {
    schema: z.object({
      postContent: z.string().describe('The content of the original Threads post.'),
      emotionTags: z.array(z.object({
        tag_name: z.string(),
        description: z.string().optional(),
      })).describe('A list of possible emotion tags and their descriptions.'),
    }),
  },
  output: {
    // The AI should output the name of the most relevant emotion tag
    schema: z.object({
      predicted_tag: z.string().describe('The most relevant emotion tag for the post content.'),
    }),
  },
  prompt: `Analyze the following Threads post content and identify the primary emotion or tone from the provided list of tags.
  Respond with only the 'tag_name' that best fits. If none fit, respond with 'neutral'.

  Post Content: {{{postContent}}}

  Available Emotion Tags:
  {{#each emotionTags}}
  - {{tag_name}}: {{description}}
  {{/each}}

  Predicted Tag:`,
});


// Define the prompt for generating reply suggestions
// *** Updated usage with ai.definePrompt ***
const replyGenerationPrompt = ai.definePrompt({
  name: 'generateReplySuggestionsPrompt',
  input: {
    schema: z.object({
      postContent: z.string().describe('The content of the original Threads post.'),
      systemInstructionContent: z.string().describe('System instruction content to guide the AI.'),
    }),
  },
  output: {
    schema: z.array( // Output is an array of strings (suggestions)
        z.string().describe('A suggested reply to the original post.')
      ).describe('A list of suggested replies.')
  },
  prompt: `You are an AI assistant designed to generate reply suggestions to Threads posts.

  Given the following post content and system instruction, generate a list of suggested replies.

  Post Content: {{{postContent}}}
  System Instruction: {{{systemInstructionContent}}}

  Suggestions:`,
});


// --- Main Genkit Flow Definition ---

// *** Updated usage with defineFlow (removed GenkitFlow. prefix) ***
export const generateReplySuggestionsFlow = defineFlow<
  typeof GenerateReplySuggestionsInputSchema,
  typeof GenerateReplySuggestionsOutputSchema
>(
  {
    name: 'generateReplySuggestionsFlow',
    inputSchema: GenerateReplySuggestionsInputSchema,
    outputSchema: GenerateReplySuggestionsOutputSchema,
  },
  // Added explicit type annotation for input
  async (input: GenerateReplySuggestionsInput) => {
    let finalSystemInstructionContent = input.systemInstruction; // Start with the fallback

    try {
      // Fetch all keywords at the beginning for use in both routing stages
      // *** Updated usage with run (removed GenkitFlow. prefix) ***
      const keywords = await run(getKeywordsTool, {});
      const postContentLower = input.postContent.toLowerCase();

      // --- STAGE 1: Keyword/User Routing ---
      // Find a keyword in the post content that has user routing
      const matchedKeyword = keywords.find(keyword =>
        keyword.normalized_name &&
        postContentLower.includes(keyword.normalized_name.toLowerCase()) && // Ensure comparison is lowercase
        keyword.user_routing // Only if it has user_routing
      );

      if (matchedKeyword && matchedKeyword.user_routing) { // Double check user_routing exists
        console.log(`Keyword "${matchedKeyword.normalized_name}" matched. Attempting user routing for user ID: ${matchedKeyword.user_routing}`);
        // *** Updated usage with run (removed GenkitFlow. prefix) ***
        const user = await run(getUserTool, { userId: matchedKeyword.user_routing });

        if (user && user.default_instruction_id) {
          console.log(`User found. Fetching system instruction for default_instruction_id: ${user.default_instruction_id}`);
          // *** Updated usage with run (removed GenkitFlow. prefix) ***
          const systemInstruction = await run(getSystemInstructionTool, { instructionId: user.default_instruction_id });

          if (systemInstruction && systemInstruction.content) {
            finalSystemInstructionContent = systemInstruction.content;
            console.log(`Successfully routed using user's default instruction: ${systemInstruction.name}`);
             // If found, we've successfully routed, exit this routing block
          } else {
            console.warn(`User's default instruction not found for ID: ${user.default_instruction_id}. Falling back to emotion-based routing.`);
             // Instruction not found for user, fall through to emotion routing
          }
        } else {
          console.warn(`User with ID ${matchedKeyword.user_routing} not found or no default instruction set. Falling back to emotion-based routing.`);
           // User not found or no default instruction, fall through to emotion routing
        }
      } else {
        console.log("No keyword with user routing matched. Proceeding with emotion-based routing.");
         // No keyword with user routing matched, fall through to emotion routing
      }

      // --- STAGE 2: Emotion-Based Routing (Only if keyword/user routing didn't succeed) ---
      if (finalSystemInstructionContent === input.systemInstruction) { // Check if the fallback instruction is still the current one
         console.log("Attempting emotion-based routing.");
         // *** Updated usage with run (removed GenkitFlow. prefix) ***
        const emotionTags = await run(getEmotionTagsTool, {});

        if (emotionTags && emotionTags.length > 0) {
            // *** Updated usage with run (removed GenkitFlow. prefix) ***
            const emotionAnalysisResult = await run(emotionAnalysisPrompt, {
              postContent: input.postContent,
              emotionTags: emotionTags.map(tag => ({ tag_name: tag.id, description: tag.description })), // Use tag.id as tag_name for prompt
            });

            const predictedTag = emotionAnalysisResult.predicted_tag;
            console.log(`Emotion analysis predicted tag: ${predictedTag}`);

            // Check if any keywords have emotional_tags including the predictedTag
            // This uses array.includes(), no Genkit prefix needed here
            const emotionMatchedKeyword = keywords.find(keyword =>
              keyword.emotional_tags?.includes(predictedTag)
            );

            if (emotionMatchedKeyword && emotionMatchedKeyword.user_routing) { // Check if this keyword also has user routing
               console.log(`Keyword matched by emotion tag "${predictedTag}". Attempting user-based routing again with user: ${emotionMatchedKeyword.user_routing}`);
               // Re-attempt user routing if an emotion-matched keyword has user routing
               // *** Updated usage with run (removed GenkitFlow. prefix) ***
               const user = await run(getUserTool, { userId: emotionMatchedKeyword.user_routing });

              if (user && user.default_instruction_id) {
                // *** Updated usage with run (removed GenkitFlow. prefix) ***
                const systemInstruction = await run(getSystemInstructionTool, { instructionId: user.default_instruction_id });
                if (systemInstruction && systemInstruction.content) {
                  finalSystemInstructionContent = systemInstruction.content;
                  console.log(`Successfully routed using emotion-based keyword's user's instruction.`);
                   // If found, we've successfully routed, exit this routing block
                } else {
                    console.warn(`User's default instruction not found for ID: ${user.default_instruction_id} from emotion-matched keyword. Trying default emotion persona.`);
                     // Instruction not found for user from emotion-matched keyword, fall through to default emotion persona
                }
              } else {
                 console.warn(`User with ID ${emotionMatchedKeyword.user_routing} not found or no default instruction set from emotion-matched keyword. Trying default emotion persona.`);
                  // User not found or no default instruction from emotion-matched keyword, fall through to default emotion persona
              }
            }

             // If systemInstructionContent is *still* the fallback (meaning previous emotion keyword didn't route),
             // then try the default persona associated directly with the predicted emotion tag.
            if (finalSystemInstructionContent === input.systemInstruction) {
                 console.log("No emotion-matched keyword with user routing or instruction found. Trying default instruction for predicted emotion tag.");
                 // This find uses array.find(), no Genkit prefix needed here
                const matchedEmotionTag = emotionTags.find(tag => tag.id === predictedTag); // Use tag.id for matching

                if (matchedEmotionTag && matchedEmotionTag.associated_personas && matchedEmotionTag.associated_personas.length > 0) {
                  // Use the first associated persona's instruction ID
                  const personaIdToUse = matchedEmotionTag.associated_personas[0];
                   console.log(`Matched emotion tag "${predictedTag}". Attempting to fetch instruction for persona ID: ${personaIdToUse}`);
                  // *** Updated usage with run (removed GenkitFlow. prefix) ***
                  const systemInstruction = await run(getSystemInstructionTool, { instructionId: personaIdToUse });

                  if (systemInstruction && systemInstruction.content) {
                    finalSystemInstructionContent = systemInstruction.content;
                    console.log(`Successfully routed to system instruction via emotion tag: ${systemInstruction.name}`);
                  } else {
                     console.warn(`Emotion persona instruction not found for ID: ${personaIdToUse}. Falling back to input.systemInstruction.`);
                  }
                } else {
                   console.warn(`No associated personas found for predicted emotion tag "${predictedTag}" or tag not found. Falling back to input.systemInstruction.`);
                }
            }

        } catch (error) {
          console.error("Error during emotion-based routing:", error);
          // On error, we stay with initial fallback systemInstruction
        }
      } else {
          console.log("Keyword/User routing successfully determined the system instruction. Skipping emotion-based routing.");
      }

    } catch (error) {
        console.error("Unhandled error in routing flow:", error);
         // Catch any errors from the try block wrapping the entire routing logic
         // systemInstructionContentToUse remains the initial fallback
    }


    // --- FINAL: Generate Replies ---
    console.log("Generating reply suggestions with the final system instruction.");
     // Ensure systemInstructionContent is always a string for the prompt
     const systemInstructionForPrompt = finalSystemInstructionContent || input.systemInstruction || "";

    // *** Updated usage with run (removed GenkitFlow. prefix) ***
    const { output } = await run(replyGenerationPrompt, {
      postContent: input.postContent,
      systemInstructionContent: systemInstructionForPrompt,
    });

    // The replyGenerationPrompt outputs an array of strings directly, so return that
    // Ensure output is not null/undefined before returning
    return { suggestions: output || [] };
  }
);

// Utility export
export async function generateReplySuggestions(input: GenerateReplySuggestionsInput): Promise<GenerateReplySuggestionsOutput> {
  return generateReplySuggestionsFlow(input);
}

