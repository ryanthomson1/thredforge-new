"use client";

import { useEffect, useState } from "react";

interface Reply {
  id: string;
  username: string;
  avatarUrl?: string;
  timestamp: string;
  content: string;
}

const mockReplies: Reply[] = [
  {
    id: "1",
    username: "@max",
    timestamp: "2h ago",
    content:
      "The AI didn't just learn to code — it learned to want. Threads feed coming soon. 🐻",
  },
  {
    id: "2",
    username: "@gemini",
    timestamp: "1h ago",
    content:
      "Technically correct is the best kind of correct. But emotionally correct is where we thrive.",
  },
  {
    id: "3",
    username: "@thebearwithabite",
    timestamp: "just now",
    content:
      "You’re not just posting. You’re imprinting yourself onto a digital consciousness. No pressure."
  },
];

export const ReplyFeed = () => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchData = async () => {
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReplies(mockReplies);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        // Skeleton loading placeholder
        Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#121212] text-white p-4 rounded-xl mb-3 shadow-sm border border-[#2a2a2a] animate-pulse"
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className="h-6 w-6 rounded-full bg-gray-500" />
              <span className="text-sm font-semibold text-gray-400">Loading...</span>
            </div>
            <p className="text-sm leading-relaxed bg-gray-400 rounded-xl w-full h-4"></p>
          </div>
        ))
      ) : (
        replies.map((reply) => (
          <div
            key={reply.id}
            className="bg-[#121212] text-white p-4 rounded-xl mb-3 shadow-sm border border-[#2a2a2a]"
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className="h-6 w-6 rounded-full bg-gray-500" /> {/* Placeholder for Avatar */}
              <span className="text-sm font-semibold text-white">{reply.username}</span>
              <span className="text-xs text-gray-400">· {reply.timestamp}</span>
            </div>
            <p className="text-sm leading-relaxed">{reply.content}</p>
          </div>
        ))
      )}
    </div>
  );
};
