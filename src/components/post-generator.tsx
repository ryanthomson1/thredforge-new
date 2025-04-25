//post-generator.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateThreadPosts } from "@/ai/flows/generate-thread-posts";
import { generateImagePrompts } from "@/ai/flows/generate-image-prompts";
import { generateImage, ImageGenerationParams } from "@/services/leonardo-ai";
import { generateImage as generateImageDalle } from "@/services/dalle-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Ensure Select is imported
import { useToast } from "@/hooks/use-toast";
import { useControlPanelContext } from "@/components/control-panel-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function PostGenerator() { // Ensure component name matches file name
  const [idea, setIdea] = useState("");
  const [selectedInstructionId, setSelectedInstructionId] = useState("default");
  const [selectedImageInstructionId, setSelectedImageInstructionId] = useState("image_instructions");
  const [generateImages, setGenerateImages] = useState(false);
  const [posts, setPosts] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagePrompts, setImagePrompts] = useState<string[]>([]); // Store image prompts
  const [loading, setLoading] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageGenerationService, setImageGenerationService] = useState("leonardo");

  const { toast } = useToast();
  const { logApiCall, availableInstructions } = useControlPanelContext();

  useEffect(() => {
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setPosts([]);
    setImageUrls([]);
    setImagePrompts([]); // Clear previous image prompts

    try {
      // Find the selected instruction
      const selectedInstruction = availableInstructions.find(
        (instruction) => instruction.id === selectedInstructionId
      );

      const selectedImageInstruction = availableInstructions.find(
        (instruction) => instruction.id === selectedImageInstructionId
      );

      const generateThreadPostsInput = {
        input: idea,
        systemInstructions: selectedInstruction?.content || "",
      };

      logApiCall("Generating thread posts",
        "/ai/flows/generate-thread-posts",
        generateThreadPostsInput,
        null,
        200
      );

      const generatedPosts = await generateThreadPosts(generateThreadPostsInput);

      logApiCall("Generated thread posts",
        "/ai/flows/generate-thread-posts",
        generateThreadPostsInput,
        generatedPosts,
        200
      );

      setPosts(generatedPosts.posts.map((post) => post.content));

      if (generateImages) {
        const imageResults = await Promise.all(
          generatedPosts.posts.map(async (post) => {
            // Combine image instructions and the generated thread post
            const combinedPrompt = `${selectedImageInstruction?.content || ""} ${post.content}`;

            const generateImagePromptsInput = {
              threadPost: combinedPrompt,
            };

            logApiCall("Generating image prompts",
              "/ai/flows/generate-image-prompts",
              generateImagePromptsInput,
              null,
              200
            );

            const imagePromptResult = await generateImagePrompts(generateImagePromptsInput);

            logApiCall("Generated image prompts",
              "/ai/flows/generate-image-prompts",
              generateImagePromptsInput,
              imagePromptResult,
              200
            );

            let generatedImage;

            if (imageGenerationService === "dalle") {
              logApiCall("Generating image with DALL-E",
                "/services/dalle-ai",
                { prompt: imagePromptResult.imagePrompt },
                null,
                200
              );

              generatedImage = await generateImageDalle(imagePromptResult.imagePrompt);

              logApiCall("Generated image with DALL-E",
                "/services/dalle-ai",
                { prompt: imagePromptResult.imagePrompt },
                generatedImage,
                200
              );

              return { imageUrl: generatedImage.imageUrl, imagePrompt: imagePromptResult.imagePrompt };
            } else {
              const imageParams: ImageGenerationParams = {
                prompt: imagePromptResult.imagePrompt,
                width: 512,
                height: 512,
              };

              logApiCall("Generating image with Leonardo",
                "/services/leonardo-ai",
                imageParams,
                null,
                200
              );

              generatedImage = await generateImage(imageParams, logApiCall);

              logApiCall("Generated image with Leonardo",
                "/services/leonardo-ai",
                imageParams,
                generatedImage,
                200
              );

            }
            return { imageUrl: generatedImage.imageUrl, imagePrompt: imageParams.prompt };
          })
        );

        setImageUrls(imageResults.map(result => result.imageUrl));
        setImagePrompts(imageResults.map(result => result.imagePrompt));
      }
    } catch (error: any) {
      console.error("Error generating posts:", error);
      toast({
        title: "Error",
        description: `Failed to generate content: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostToThreads = () => {
    if (selectedPostIndex !== null) {
      // Implement the logic to post to Threads here
      alert(`Posting to Threads: ${posts[selectedPostIndex]}`);
    } else {
      alert("Please select a post to post to Threads.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Idea/Text/URL
        </label>
        <Input
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          System Instructions
        </label>
        <Select value={selectedInstructionId} onValueChange={setSelectedInstructionId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select System Instructions" />
          </SelectTrigger>
          <SelectContent>
            {availableInstructions.map((instruction) => (
              instruction.id !== "image_instructions" && (
                <SelectItem key={instruction.id} value={instruction.id}>
                  {instruction.name}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Image Instructions
        </label>
        <Select value={selectedImageInstructionId} onValueChange={setSelectedImageInstructionId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select Image Instructions" />
          </SelectTrigger>
          <SelectContent>
            {availableInstructions.map((instruction) => (
              instruction.id === "image_instructions" && (
                <SelectItem key={instruction.id} value={instruction.id}>
                  {instruction.name}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <Checkbox
          checked={generateImages}
          onCheckedChange={(checked) => setGenerateImages(!!checked)}
          id="generate-images"
        />
        <label
          htmlFor="generate-images"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Generate Images
        </label>
      </div>

      {generateImages && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Image Generation Service
          </label>
          <Select value={imageGenerationService} onValueChange={setImageGenerationService}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leonardo">Leonardo</SelectItem>
              <SelectItem value="dalle">DALL-E</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Posts"}
      </Button>

      {posts.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Post {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post}</p>
                {generateImages && imageUrls[index] && (
                  <>
                    <img
                      src={imageUrls[index]}
                      alt={`Generated Image ${index + 1}`}
                      className="mt-2 rounded-md"
                    />
                  </>
                )}
                <Button
                  disabled={loading}
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => {
                    setSelectedPostIndex(index);
                    setSelectedImageIndex(index); // Select corresponding image if available
                  }}
                >
                  {selectedPostIndex === index ? "Selected" : "Select Post"}
                </Button>
              </CardContent>
              {loading && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-100 dark:bg-gray-800 opacity-75 flex flex-col items-center justify-center rounded-lg">
                  {generateImages ? (
                    <>
                      <Skeleton className="h-4 w-1/2 mb-1 animate-pulse" />
                      <Skeleton className="h-4 w-3/4 mb-1 animate-pulse" />
                      <Skeleton className="h-4 w-2/3 animate-pulse" />
                    </>
                  ) : (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-4 w-3/4 mb-2 animate-pulse"
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {selectedPostIndex !== null && (
        <Button onClick={handlePostToThreads} className="mt-4">
          Post to Threads
        </Button>
      )}
    </div>
  );
}
