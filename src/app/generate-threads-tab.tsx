// src/app/generate-threads-tab.tsx
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
// Assuming you have a useToast hook
// import { useToast } from "@/components/ui/use-toast"; // Adjust import path if needed

// Import the Server Action and its input/output types
import { generatePostsAction } from '@/app/actions';
import { GenerateThreadsPostsInput, GenerateThreadsPostsOutput } from '@/ai/flows/generate-threads-posts'; // Import types

// Remove mock data - we'll fetch real data here
// const mockGeneratedPosts = ["Post 1 content goes here.", "Post 2 content.", "Post 3: This is a third example."];


export default function GenerateThreadsTab() {
  const [threadIdea, setThreadIdea] = useState("");
  const [includeImages, setIncludeImages] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]); // State for generated posts
  const [selectedPost, setSelectedPost] = useState<string | null>(null); // State for selected post
  const [isLoading, setIsLoading] = useState(false); // Add loading state

   // If you need toast notifications, uncomment and initialize the hook
   // const { toast } = useToast();

  // This handleGeneratePosts function will now call the Server Action
  const handleGeneratePosts = async () => { // Make the function async
    // Add basic input validation
    if (!threadIdea.trim()) {
       console.warn("Thread idea is empty.");
       // If you have toast, uncomment this:
       // toast({
       //   title: "Input Error",
       //   description: "Please enter an idea before generating.",
       //   variant: "destructive",
       // });
      return; // Stop if idea is empty
    }

    setIsLoading(true); // Set loading state to true
    setGeneratedPosts([]); // Clear previous results
    setSelectedPost(null); // Clear selected post


    const input: GenerateThreadsPostsInput = {
      idea: threadIdea, // Use the state variable for the idea
      includeImages: includeImages, // Use the state variable for includeImages
      // You could potentially add systemInstruction here if you want to
      // override the flow's internal routing with a specific instruction from the UI.
      // systemInstruction: 'your_selected_instruction_id_content',
    };

    console.log("Calling Generate Posts Server Action with input:", input); // Log the call

    try {
      // Call the Server Action
      console.log("🧪 Before calling generatePostsAction");
      const output: GenerateThreadsPostsOutput = await generatePostsAction(input);
      console.log("Received output from Server Action:", output); // Log the output

      // Check if the output is valid and contains posts
      if (output && output.posts && output.posts.length > 0) {
        setGeneratedPosts(output.posts); // Update the state with the generated posts
        console.log("Posts state updated.");
      } else if (output && output.posts && output.posts.length === 0) {
         console.log("AI generated 0 posts.");
         // If you have toast, uncomment this:
         // toast({
         //    title: "No Posts Generated",
         //    description: "The AI did not generate any posts for this idea.",
         //    variant: "default",
         //  });
         setGeneratedPosts([]); // Ensure state is empty
      }
       else {
         // Handle unexpected output format
         console.error("Unexpected output format from Server Action:", output);
          // If you have toast, uncomment this:
          // toast({
          //   title: "Generation Error",
          //   description: "Received unexpected data from the generation service.",
          //   variant: "destructive",
          // });
          setGeneratedPosts(["Error: Failed to generate posts due to unexpected response."]); // Display error in UI
       }


    } catch (error: any) {
      console.error("Error during post generation:", error); // Log the error
      // If you have toast, uncomment this:
      // toast({
      //   title: "Generation Failed",
      //   description: `An error occurred: ${error.message || 'Unknown error'}`,
      //   variant: "destructive",
      // });
       setGeneratedPosts([`Error: Failed to generate posts: ${error.message || 'Unknown error'}`]); // Display error in UI

    } finally {
      setIsLoading(false); // Set loading state back to false
      console.log("Generation process finished.");
    }
  };

  // Function to handle selecting a generated post (already exists in your snippet)
  const handlePostSelect = (post: string) => {
    setSelectedPost(post === selectedPost ? null : post);
  };

   // Function to handle regenerating a specific post (placeholder for now)
  const handleRegenerate = (post: string) => {
    // TODO: Implement regenerate logic - potentially call the flow again with a specific instruction
    console.log("Regenerating post:", post);
    // You might want to clear the selected post and set loading state here
  };

   // Function to handle using a selected post (placeholder for now)
   const handleUsePost = (post: string) => {
     // TODO: Implement logic to "use" the selected post - e.g., copy to clipboard, stage for publishing
     console.log("Using post:", post);
     // Example: Copy to clipboard
     navigator.clipboard.writeText(post).then(() => {
         console.log("Post copied to clipboard!");
         // Optionally show a toast notification
     }).catch(err => {
         console.error("Failed to copy post:", err);
          // Optionally show an error notification
     });
   };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Side: Controls */}
      <div className="space-y-6">
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-dadada">New Thread Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your idea here..."
              className="bg-input border-input text-dadada rounded-md shadow-none focus-visible:ring-ring focus-visible:ring-offset-background"
              value={threadIdea}
              onChange={(e) => setThreadIdea(e.target.value)}
              rows={6} // Give more rows for ideas
              disabled={isLoading} // Disable input while loading
            />
            <p className="text-muted-foreground text-sm mt-2">Character Count: {threadIdea.length}</p>
            <div className="flex justify-between mt-4">
              {/* Button to trigger generation */}
              <Button
                variant="primary"
                onClick={handleGeneratePosts} // This calls the updated async function
                disabled={isLoading || !threadIdea.trim()} // Disable when loading or idea is empty
              >
                {isLoading ? 'Generating...' : 'Generate'} {/* Button text changes with loading state */}
              </Button>
              <Button variant="secondary" onClick={() => { setThreadIdea(""); setGeneratedPosts([]); setSelectedPost(null); setSelectedImageIndex(null); }} disabled={isLoading}> {/* Simplified Clear All */}
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Include Images Card */}
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-dadada">Include Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-dadada">Enable image suggestions with the posts</p>
              <Switch
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(!!checked)}
                id="include-images"
                disabled={isLoading} // Disable switch while loading
              />
            </div>
          </CardContent>
        </Card>

         {/* System Instructions Selector Card (Optional, if you want to manually select instruction) */}
         {/*
         <Card className="shadow-md bg-card">
             <CardHeader>
                 <CardTitle className="text-dadada">System Instruction</CardTitle>
             </CardHeader>
             <CardContent>
                 {/* You would fetch and display system instructions here,
                    and update a state variable for the selected instruction ID.
                    Then, you could pass that ID or the instruction content
                    in the input to generatePostsAction if you want to override
                    the flow's internal routing.
                 */}
             {/* </CardContent>
         </Card>
         */}


      </div>

      {/* Right Side: Generated Posts Display */}
      <div className="space-y-6">
        <Card className="shadow-md bg-card h-full"> {/* Added h-full for consistent height */}
          <CardHeader>
            <CardTitle className="text-dadada">Generated Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]"> {/* Adjusted height for ScrollArea */}
            <ScrollArea className="h-full px-4 pb-4"> {/* Used h-full and added padding-bottom */}
              {generatedPosts.length > 0 ? ( // Render posts if the array is not empty
                generatedPosts.map((post, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-md mb-2 cursor-pointer ${
                      selectedPost === post ? "bg-muted" : "bg-card"
                    }`}
                    onClick={() => handlePostSelect(post)}
                  >
                    <p className="text-dadada whitespace-pre-wrap">{post}</p>{/* Use whitespace-pre-wrap */}
                    <div className="flex justify-end mt-2 space-x-2"> {/* Added space-x-2 for button spacing */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleUsePost(post); }} // Stop propagation to prevent selecting the post
                        disabled={isLoading} // Disable buttons while loading
                      >
                        Use
                      </Button>
                      <Button
                         variant="secondary"
                         size="sm"
                         onClick={(e) => { e.stopPropagation(); handleRegenerate(post); }} // Stop propagation
                         disabled={isLoading} // Disable buttons while loading
                       >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ))
              ) : ( // Show loading or placeholder message
                isLoading ? (
                  <p className="text-dadada text-center">Generating posts...</p>
                ) : (
                   <p className="text-muted-foreground text-center">Enter an idea and click "Generate" to see posts here.</p>
                )
              )}
               {/* Add Skeleton loading indicators if needed, similar to post-generator */}
               {/* {isLoading && generatedPosts.length === 0 && (
                   // Render skeleton loaders
               )} */}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

