"use client";
// tagged for gh commit 24 apr 25
"use client";

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GenerateThreadsTab from './generate-threads-tab';
import ThreadsRepliesTab from './threads-replies-tab';
import ImageControlPanelTab from './image-control-panel-tab';
import AppControlPanelTab from './app-control-panel-tab';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Home() {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-202123 p-4 flex items-center justify-between shadow-md">
        <div className="text-xl font-semibold text-dadada">Bear Threads Generator (v2)</div>
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://picsum.photos/id/237/32/32" alt="User Avatar" />
          <AvatarFallback>BT</AvatarFallback>
        </Avatar>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="generate">Generate Threads Posts</TabsTrigger>
            <TabsTrigger value="replies">Threads Replies</TabsTrigger>
            <TabsTrigger value="images">Image Control Panel</TabsTrigger>
            <TabsTrigger value="control">Application Control Panel</TabsTrigger>
          </TabsList>
          <TabsContent value="generate">
            <GenerateThreadsTab />
          </TabsContent>
          <TabsContent value="replies">
            <ThreadsRepliesTab />
          </TabsContent>
          <TabsContent value="images">
            <ImageControlPanelTab />
          </TabsContent>
          <TabsContent value="control">
            <AppControlPanelTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-202123 p-4 text-center text-muted-foreground">
        <a href="#" className="text-primary">
          Heatmap Link
        </a>
      </footer>
    </div>
  );
}
