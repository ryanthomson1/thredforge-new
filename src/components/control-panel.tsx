"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as geminiApi from "@/services/gemini-api";
import {
  generateText as generateTextOpenAI,
  useRecentKeywordsContext,
  RecentKeyword,
} from "@/providers/recent-keywords-provider";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useControlPanelContext,
  SystemInstruction,
} from "@/components/control-panel-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchHeatmap } from "@/components/SearchHeatmap";
import * as threadsApi from "@/services/threads-api";
import {
  deleteSystemInstruction,
  getSystemInstructions,
  getThreadsAccounts,
  saveRecentKeyword,
  saveSystemInstruction,
  saveThreadsAccount,
  deleteThreadsAccount,
  getRecentKeywords,
  ThreadsAccount,
} from "@/lib/db";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ThreadsAccountForm } from "@/components/ThreadsAccountForm";

export function ControlPanel() {
  const { recentKeywords, addRecentKeyword } = useRecentKeywordsContext();
  const [threadsAccount, setThreadsAccount] = useState("thebearwithabite");
  const {
    apiLogs,
    availableInstructions,
    setAvailableInstructions,
    logApiCall,
  } = useControlPanelContext();
  const { toast } = useToast();
  const [generatedPost, setGeneratedPost] = useState("");
  const [idea, setIdea] = useState("");
  const [selectedInstructionId, setSelectedInstructionId] =
    useState("default");
  const [generationOption, setGenerationOption] = useState("gemini");
  const [systemInstructions, setSystemInstructions] = useState("");

  const [selectedImageInstructionId, setSelectedImageInstructionId] =
    useState("image_instructions");
  const [imageInstructions, setImageInstructions] = useState("");

  const [threadsAccounts, setThreadsAccounts] = useState<ThreadsAccount[]>([]);

  useEffect(() => {
    const fetchSystemInstructions = async () => {
      const instructions = await getSystemInstructions();
      setAvailableInstructions(instructions);
    };

    fetchSystemInstructions();
  }, [setAvailableInstructions]);

  useEffect(() => {
    const selectedInstruction = availableInstructions.find(
      (instruction) => instruction.id === selectedInstructionId
    );
    setSystemInstructions(selectedInstruction?.content || "");

    const selectedImageInstruction = availableInstructions.find(
      (instruction) => instruction.id === selectedImageInstructionId
    );
    setImageInstructions(selectedImageInstruction?.content || "");
  }, [
    selectedInstructionId,
    selectedImageInstructionId,
    availableInstructions,
  ]);

  useEffect(() => {
    const fetchThreadsAccounts = async () => {
      const accounts = await getThreadsAccounts();
      setThreadsAccounts(accounts);
    };

    fetchThreadsAccounts();
  }, []);

  useEffect(() => {
    const fetchRecentKeywords = async () => {
      const keywords = await getRecentKeywords();
      // todo: implement this correctly
      // setRecentKeywords(keywords);
    };

    fetchRecentKeywords();
  }, []);

  const handleSaveInstructions = async (
    instructionType: "text" | "image"
  ) => {
    const instructionContent =
      instructionType === "text" ? systemInstructions : imageInstructions;
    const selectedId =
      instructionType === "text"
        ? selectedInstructionId
        : selectedImageInstructionId;

    const selectedInstruction = availableInstructions.find(
      (instruction) => instruction.id === selectedId
    );

    if (selectedInstruction) {
      const updatedInstruction = {
        ...selectedInstruction,
        content: instructionContent,
      };
      await saveSystemInstruction(updatedInstruction);
      setAvailableInstructions((prevInstructions) =>
        prevInstructions.map((instruction) =>
          instruction.id === selectedId ? updatedInstruction : instruction
        )
      );
      toast({
        title: "Success",
        description: `System instruction updated!`,
      });
    } else {
      toast({
        title: "Error",
        description: `Selected ${instructionType} system instruction not found.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteInstruction = async (id: string) => {
    try {
      await deleteSystemInstruction(id);
      setAvailableInstructions((prevInstructions) =>
        prevInstructions.filter((instruction) => instruction.id !== id)
      );
      toast({
        title: "Success",
        description: `System instruction deleted!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Error deleting system instruction`,
        variant: "destructive",
      });
    }
  };

  const handlePostChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedPost(event.target.value);
  };

  const handleIdeaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIdea(event.target.value);
  };

  const handlePost = async (text: string = "", account: string = "") => {
    toast.dismiss(); // Dismiss any existing toasts

    if (!text) {
      toast({
        title: "Error",
        description: "Please generate a post first.",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "Error",
        description: "Please select a Threads account.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await threadsApi.postToThreads(account, text);
      console.log("Post successful:", response);
      toast({ title: "Success", description: "Posted to Threads!" });
    } catch (error: any) {
      console.error("Error posting to Threads:", error);
      toast({
        title: "Error",
        description: `Failed to post: ${error.message || "Unknown error"}.`,
        variant: "destructive",
      });
    }
  };

  const generatePost = async (idea: string = "") => {
    try {
      let result = "";
      if (generationOption === "gemini") {
        result = await geminiApi.generateText(idea);
      } else if (generationOption === "openai") {
        result = await generateTextOpenAI(idea);
      }
      setGeneratedPost(result);
      await saveRecentKeyword(idea);
      addRecentKeyword({ keyword: idea, searchedAt: Date.now() });
      console.log(result);
    } catch (error) {
      console.error("Error generating text:", error);
    }
  };

  const handleGenerationOptionChange = (value: string) => {
    setGenerationOption(value);
  };

  const handleSelectChange = (value: string) => {
    setSelectedInstructionId(value);
    const selectedInstruction = availableInstructions.find(
      (instruction) => instruction.id === value
    );
    if (selectedInstruction) {
      setSystemInstructions(selectedInstruction.content);
    }
  };

  const handleDeleteThreadsAccount = async (id: string) => {
    try {
      await deleteThreadsAccount(id);
      setThreadsAccounts((prev) => prev.filter((acc) => acc.id !== id));
      toast({
        title: "Success",
        description: `Threads account deleted!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Error deleting Threads account`,
        variant: "destructive",
      });
    }
  };

  const handleSaveThreadsAccount = async (
    account: ThreadsAccount
  ): Promise<void> => {
    try {
      await saveThreadsAccount(account);
      setThreadsAccounts((prev) => [...prev, account]);
      toast({
        title: "Success",
        description: `Threads account saved!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Error saving Threads account`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <SearchHeatmap recentKeywords={recentKeywords} />
      <Card className="mb-4">
        <CardContent>
          <Input
            value={idea}
            onChange={handleIdeaChange}
            placeholder="Enter your idea"
            className="mb-2"
          />
          <Textarea
            value={generatedPost}
            onChange={handlePostChange}
            className="mb-4"
            placeholder="Edit generated post here..."
          />
          <Select
            value={generationOption}
            onValueChange={handleGenerationOptionChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Generation Option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => generatePost(idea)}>Generate</Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Threads Account Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={threadsAccount} onValueChange={setThreadsAccount}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {threadsAccounts.map((account) => (
                <SelectItem key={account.id} value={account.name}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => handlePost(generatedPost, threadsAccount)}
            className="ml-2"
          >
            Post
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-2">
                Add new account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <ThreadsAccountForm
                onSave={handleSaveThreadsAccount}
                threadsAccounts={threadsAccounts}
                setThreadsAccounts={setThreadsAccounts}
              />
            </DialogContent>
          </Dialog>
          {threadsAccounts.map((account) => (
            <Button
              key={account.id}
              onClick={() => handleDeleteThreadsAccount(account.id)}
              className="ml-2"
            >
              Delete account {account.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>System Instructions Management (Text)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedInstructionId}
            onValueChange={setSelectedInstructionId}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select System Instructions" />
            </SelectTrigger>
            <SelectContent>
              {availableInstructions.map((instruction) => {
                return instruction.id !== "image_instructions" ? (
                  <SelectItem key={instruction.id} value={instruction.id}>
                    {instruction.name}
                  </SelectItem>
                ) : null;
              })}
            </SelectContent>
          </Select>
          <Textarea
            value={systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
            className="mb-2 mt-2"
            placeholder="Enter system instructions"
          />
          <Button onClick={() => handleSaveInstructions("text")}>
            Save Text Instructions
          </Button>
          {availableInstructions.map((instruction) => {
            return instruction.id !== "image_instructions" ? (
              <Button
                key={instruction.id}
                onClick={() => handleDeleteInstruction(instruction.id)}
                className="ml-2"
              >
                Delete instruction {instruction.name}
              </Button>
            ) : null;
          })}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>System Instructions Management (Image)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedImageInstructionId}
            onValueChange={setSelectedImageInstructionId}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select Image Instructions" />
            </SelectTrigger>
            <SelectContent>
              {availableInstructions.map((instruction) => {
                return instruction.id === "image_instructions" ? (
                  <SelectItem key={instruction.id} value={instruction.id}>
                    {instruction.name}
                  </SelectItem>
                ) : null;
              })}
            </SelectContent>
          </Select>
          <Textarea
            value={imageInstructions}
            onChange={(e) => setImageInstructions(e.target.value)}
            className="mb-2 mt-2"
            placeholder="Enter image generation instructions"
          />
          <Button onClick={() => handleSaveInstructions("image")}>
            Save Image Gen. Instructions
          </Button>
          {availableInstructions.map((instruction) => {
            return instruction.id === "image_instructions" ? (
              <Button
                key={instruction.id}
                onClick={() => handleDeleteInstruction(instruction.id)}
                className="ml-2"
              >
                Delete instruction {instruction.name}
              </Button>
            ) : null;
          })}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Debugging Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 w-full rounded-md border">
            <Textarea
              readOnly
              value={apiLogs || ""}
              placeholder="API call logs will appear here"
              className="min-h-[80px] font-mono text-xs"
            />
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Recent Keyword Searches</CardTitle>
        </CardHeader>
        <CardContent>
          {recentKeywords.length === 0 ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-3/4 mb-2" />
            ))
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {recentKeywords.map((item: RecentKeyword) => {
                const time = formatDistanceToNow(item.searchedAt, {
                  addSuffix: true,
                });
                const ageInDays = Math.floor(
                  (Date.now() - item.searchedAt) / (1000 * 60 * 60 * 24)
                );
                const opacity = Math.max(0.2, 1 - ageInDays / 30);

                return (
                  <li key={item.keyword} style={{ opacity }}>
                    {item.keyword} <span className="text-xs text-muted-foreground">
                      (last searched {time})
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
