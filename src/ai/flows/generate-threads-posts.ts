// tagged for gh commit 24 apr 25
'use server';
/**
 * @fileOverview A Threads post generator AI agent that can also generate image prompts, images, and store them.
 *
 * - generateThreadsPosts - A function that handles the thread post, optional image prompt, image generation, and storage process.
 * - GenerateThreadsPostsInput - The input type for the generateThreadsPosts function.
 * - GenerateThreadsPostsOutput - The return type for the generateThreadsPosts function.
 */

// Add these imports at the top of the file
import fetch from 'node-fetch'; // Or another library for fetching data over HTTP
import { v4 as uuidv4 } from 'uuid'; // To generate unique filenames

// Correct Genkit Imports - Using named imports
import { defineTool, run, type Tool, defineFlow, definePrompt } from '@genkit-ai/flow';
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

// Import Firebase Admin for server-side Firestore and Storage (used for writes)
import * as admin from 'firebase-admin';
// Assuming firebase-admin.ts exports serviceAccount or is initialized correctly and exports services
// import { serviceAccount } from '@/lib/firebase-admin'; // No longer needed if adminFirestore/adminStorage are exported

// Import the initialized Admin Firestore and Storage instances
import { adminFirestore, adminStorage } from '@/lib/firebase-admin'; // Import the initialized services
import { generateImagePromptsFlow } from './generate.image-prompts';


// Define types for Firestore documents (ensure consistency with your DB and other files)
// Assuming your Firestore collection name is 'SystemInstruction' (PascalCase) but interface is SystemInstruction (PascalCase)
export interface SystemInstruction {
  id: string; // Firestore Document ID
  name: string; // Assuming 'name' is the field for the instruction's display name
  content: string;
  is_default?: boolean;
  // Add other fields as needed, matching your Firestore documents
}

// Define a type for generated image data to be returned in the output
export interface GeneratedImage {
    prompt: string;
    imageUrl: string;
    metadataId?: string; // Optional ID of the metadata document in Firestore
}


// UPDATED INPUT SCHEMA to include imageGenerationService
const GenerateThreadsPostsInputSchema = z.object({
  idea: z.string().describe('The idea or topic for the Threads post.'),
  systemInstruction: z.string().optional().describe('Optional system instruction to guide the AI.'),
  includeImages: z.boolean().optional().describe('Whether or not to include images.'),
  imageGenerationService: z.enum(['leonardo', 'dalle']).optional().describe('The image generation service to use if includeImages is true.'),
});
export type GenerateThreadsPostsInput = z.infer<typeof GenerateThreadsPostsInputSchema>;

// UPDATED OUTPUT SCHEMA to include optional imagePrompts and generatedImages
const GenerateThreadsPostsOutputSchema = z.object({
  posts: z.array(z.string()).describe('An array of generated Threads posts.'),
  imagePrompts: z.array(z.string()).optional().describe('An optional array of generated image prompts.'),
  generatedImages: z.array(z.object({
      prompt: z.string(),
      imageUrl: z.string(),
      metadataId: z.string().optional(),
  })).optional().describe('An optional array of generated image data.'),
});
export type GenerateThreadsPostsOutput = z.infer<typeof GenerateThreadsPostsOutputSchema>;

// Define a tool to fetch a system instruction by ID
// Uses the client-side firestore instance for reads
const getSystemInstructionTool: Tool = defineTool(
  {
    name: 'getSystemInstruction',
    description: 'Fetches a system instruction from Firestore by its ID.',
  },
  z.object({
    instructionId: z.string().describe('The ID of the system instruction to fetch.'),
  }),
  async (input: { instructionId: string }) => {
    // Use the client-side firestore instance here
    const docRef = doc(firestore, 'SystemInstruction', input.instructionId); // *** Corrected collection name ***
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
       const data = docSnap.data() as Omit<SystemInstruction, 'id'>;
      return { id: docSnap.id, ...data };
    } else {
      return null;
    }
  }
);


const generateThreadsPostsPrompt = ai.definePrompt({ // ai is imported separately
  name: 'generateThreadsPostsPrompt',
  input: {
    schema: z.object({
      idea: z.string().describe('The idea or topic for the Threads post.'),
      systemInstructionContent: z.string().describe('System instruction content to guide the AI.'),
    }),
  },
  output: {
    schema: z.object({
      posts: z.array(z.string()).describe('An array of generated Threads posts.'),
    }),
  },
  prompt: `You are a social media expert specializing in creating engaging Threads posts.\\n\\nYou will use the following information to generate 5 different versions of a Threads post about the given idea or topic. Ensure each post is unique and engaging.\\n\\nIdea: {{{idea}}}\\nSystem Instruction: {{{systemInstructionContent}}}\\n\\nYour output should be a JSON object with a single key \"posts\" containing an array of 5 different post variations.\\n`,
});


// Define the Genkit flow for generating Threads posts and optional images
export const generateThreadsPostsFlow = defineFlow<
  typeof GenerateThreadsPostsInputSchema,
  typeof GenerateThreadsPostsOutputSchema
>(
  {
    name: 'generateThreadsPostsFlow',
    inputSchema: GenerateThreadsPostsInputSchema,
    outputSchema: GenerateThreadsPostsOutputSchema,
  },
  async (input: GenerateThreadsPostsInput) => {
    let systemInstructionContentToUse = input.systemInstruction;

    // If no system instruction is provided in the input, fetch a default one from Firestore
    if (!systemInstructionContentToUse) {
        console.log("No system instruction provided in input, attempting to fetch default from Firestore by query.");
        try {
            // Use the client-side firestore instance for the query
            const querySnapshot = await getDocs(
                query(collection(firestore, 'SystemInstruction'), where('is_default', '==', true)) // *** Corrected collection name ***
            );

            if (!querySnapshot.empty) {
                const defaultDoc = querySnapshot.docs[0];
                const data = defaultDoc.data() as Omit<SystemInstruction, 'id'>;
                const defaultInstruction: SystemInstruction = { id: defaultDoc.id, ...data };

                if (defaultInstruction.content) {
                    systemInstructionContentToUse = defaultInstruction.content;
                    console.log("Successfully fetched default system instruction by query.");
                } else {
                    console.warn("Default system instruction document found but is missing 'content' field.");
                }
            } else {
                 console.warn("No document with 'is_default: true' found. Proceeding without a specific default instruction.");
            }
        } catch (error) {
            console.error("Error fetching default system instruction:", error);
        }
    } else {
        console.log("Using system instruction provided in input.");
    }

    // --- Text Generation ---
    console.log("Generating Threads posts.");
    const textGenerationOutput = await run(generateThreadsPostsPrompt, {
        idea: input.idea,
        systemInstructionContent: systemInstructionContentToUse || "",
    });

    if (!textGenerationOutput || !textGenerationOutput.posts) {
        console.error("Text generation failed or returned invalid output.");
        throw new Error("Failed to generate text posts.");
    }

    let imagePrompts: string[] = [];
    const generatedImages: GeneratedImage[] = []; // Array to store generated image data


    // *** Conditional Image Prompt Generation, Image Generation, and Storage ***
    if (input.includeImages) {
        console.log("Include images is true. Starting image generation process.");
        if (!input.imageGenerationService) {
             console.warn("includeImages is true but no imageGenerationService specified. Skipping image generation.");
        } else {
             try {
                // --- Image Prompt Generation ---
                 console.log("Generating image prompts.");
                const imagePromptsOutput: GenerateImagePromptsOutput = await run(generateImagePromptsFlow, {
                    threadPost: input.idea,
                });

                if (imagePromptsOutput && imagePromptsOutput.imagePrompts) {
                    imagePrompts = imagePromptsOutput.imagePrompts;
                    console.log(`Generated ${imagePrompts.length} image prompts.`);

                    // --- Image Generation and Storage for each prompt ---
                    console.log("Generating and storing images.");
                    await Promise.all(imagePrompts.map(async (prompt) => {
                         try {
                            let imageUrl: string | undefined;

                            // Call the selected image generation service
                            if (input.imageGenerationService === 'leonardo') {
                                 console.log(`Calling Leonardo.ai for prompt: "${prompt}"`);
                                const imageParams: ImageGenerationParams = {
                                    prompt: prompt,
                                    width: 512, // Example size - adjust as needed
                                    height: 512, // Example size - adjust as needed
                                    // Add other Leonardo-specific params here if needed from input
                                    // For example: modelId: input.leonardoModelId
                                };
                                // Assuming generateImageLeonardo returns { imageUrl: string } or similar
                                const result = await generateImageLeonardo(imageParams);
                                imageUrl = result?.imageUrl;
                            } else if (input.imageGenerationService === 'dalle') {
                                 console.log(`Calling DALL-E for prompt: "${prompt}"`);
                                // Assuming generateImageDalle takes prompt string directly.
                                // If it takes options, pass them here: await generateImageDalle(prompt, { size: '512x512' });
                                const result = await generateImageDalle(prompt);
                                imageUrl = result?.imageUrl;
                            } else {
                                 console.warn(`Unknown image generation service: ${input.imageGenerationService}. Skipping image generation for this prompt.`);
                                return; // Skip if service is unknown
                            }

                            if (imageUrl) {
                                 console.log(`Successfully generated image with external URL: ${imageUrl}`);

                                // --- Fetch Image Data from URL ---
                                 console.log("Fetching image data from the generated URL.");
                                const response = await fetch(imageUrl);
                                if (!response.ok) {
                                    throw new Error(`Failed to fetch image from ${imageUrl}: ${response.statusText}`);
                                }
                                const imageBuffer = await response.buffer(); // Get image data as a Buffer

                                // --- Upload Image to Cloud Storage ---
                                 console.log("Uploading image to Cloud Storage.");
                                // Use the Admin Storage instance here
                                const bucket = adminStorage.bucket(); // Get the default bucket (set during admin.initializeApp)
                                // Determine file extension from content type or default to png/jpg
                                const contentType = response.headers.get('content-type') || 'image/png';
                                const fileExtension = contentType.split('/')[1] || 'png';
                                const filename = `generated_images/${uuidv4()}.${fileExtension}`; // Generate unique filename with uuid and extension
                                const file = bucket.file(filename);

                                // Upload the image buffer
                                await file.save(imageBuffer, {
                                    metadata: {
                                        contentType: contentType,
                                        // You can add custom metadata here if needed
                                        prompt: prompt, // Storing prompt in GCS metadata too
                                        service: input.imageGenerationService || 'unknown',
                                    },
                                });

                                // Make the file publicly readable (adjust permissions as needed for privacy)
                                // IMPORTANT: If not making public, you'll need to generate signed URLs later for display
                                try {
                                    await file.makePublic();
                                     console.log(`Image file made public: gs://${bucket.name}/${file.name}`);
                                } catch (publicError: any) {
                                     console.warn(`Could not make file public: ${publicError.message}. Ensure GCS bucket permissions allow public access or use signed URLs.`);
                                     // Continue even if making public fails, the GCS URL might still be usable with auth or signed URLs
                                }


                                // Get the public URL of the uploaded file
                                // Note: This URL format is for publicly accessible objects
                                // If objects are not public, you need file.getSignedUrl()
                                const gcsImageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
                                console.log(`Image uploaded to GCS: ${gcsImageUrl}`);

                                // --- Save Metadata to Firestore ---
                                console.log("Saving image metadata to Firestore.");
                                // Use the Admin Firestore instance here
                                const metadataRef = adminFirestore.collection('image_metadata').doc(); // Auto-generate doc ID
                                const metadata = {
                                    prompt: prompt, // Store the prompt used
                                    imageUrl: gcsImageUrl, // Store the GCS public URL (or signed URL if not public)
                                    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
                                    service: input.imageGenerationService, // Store which service was used
                                    // Add other relevant metadata
                                     // userId: 'user_id', // You'll need to get the user ID from input or context
                                     // relatedPostId: 'post_id', // Link to a specific generated post if needed
                                };
                                await metadataRef.set(metadata);
                                console.log(`Saved metadata for image "${metadataRef.id}".`);

                                generatedImages.push({ // Add to generatedImages array for output
                                    prompt: prompt,
                                    imageUrl: gcsImageUrl, // Use the GCS URL in the output
                                    metadataId: metadataRef.id,
                                });

                            } else {
                                console.warn(`Image generation service "${input.imageGenerationService}" did not return a valid image URL for prompt: "${prompt}"`);
                            }

                        } catch (imageError: any) {
                            console.error(`Error processing image prompt "${prompt}":`, imageError);
                            // Log the error and continue with other prompts
                        }
                    }));

                } else {
                    console.warn("Image prompt generation did not return valid prompts.");
                }
            } catch (imagePromptError: any) {
                console.error("Error generating image prompts:", imagePromptError);
                console.warn("Image prompt generation failed. Continuing with text posts only.");
            }
        }
    }


    // Return the combined output
    return {
      posts: textGenerationOutput.posts,
      imagePrompts: imagePrompts.length > 0 ? imagePrompts : undefined, // Include imagePrompts only if generated
      generatedImages: generatedImages.length > 0 ? generatedImages : undefined, // Include generatedImages only if generated
    };
  }
);


export async function generateThreadsPosts(input: GenerateThreadsPostsInput): Promise<GenerateThreadsPostsOutput> {
  return generateThreadsPostsFlow(input);
}

