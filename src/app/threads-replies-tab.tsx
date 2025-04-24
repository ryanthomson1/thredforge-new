"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockThreadFeed = [
  { id: "1", author: "User A", content: "This is the first thread in the feed." },
  { id: "2", author: "User B", content: "Another interesting discussion point." },
  { id: "3", author: "User C", content: "Sharing my thoughts on this topic." },
];

const mockReplySuggestions = [
  "Great point! I agree with your perspective.",
  "I have a slightly different take on this...",
  "This is a very insightful thread, thanks for sharing!",
];

export default function ThreadsRepliesTab() {
  const [threadFeed, setThreadFeed] = useState(mockThreadFeed);
  const [replySuggestions, setReplySuggestions] = useState(mockReplySuggestions);
  const [selectedThread, setSelectedThread] = useState(threadFeed[0]); // Start with the first thread selected
  const [replyText, setReplyText] = useState("");

  const handleThreadSelect = (thread: any) => {
    setSelectedThread(thread);
    // TODO: Fetch AI-generated reply suggestions based on the selected thread
  };

  const handleGenerateNewReply = () => {
    // TODO: Implement AI-generated reply logic here
    console.log("Generating new reply for thread:", selectedThread);
  };

  const handlePostReply = () => {
    // TODO: Implement posting reply logic here
    console.log("Posting reply:", replyText, "to thread:", selectedThread);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Side: Thread Feed */}
      <div className="space-y-6">
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-dadada">Thread Feed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-4">
              {threadFeed.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-4 rounded-md mb-2 cursor-pointer ${
                    selectedThread?.id === thread.id ? "bg-muted" : "bg-card"
                  }`}
                  onClick={() => handleThreadSelect(thread)}
                >
                  <p className="text-dadada italic">{thread.content}</p>
                  <p className="text-muted-foreground text-sm mt-1">by {thread.author}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Reply Panel */}
      <div className="space-y-6">
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-dadada">Reply to Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your reply here..."
              className="bg-input border-input text-dadada rounded-md shadow-none focus-visible:ring-ring focus-visible:ring-offset-background"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <Button variant="primary" onClick={handlePostReply}>
                Post
              </Button>
              <Button variant="secondary" onClick={handleGenerateNewReply}>
                Generate New Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
