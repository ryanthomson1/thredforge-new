"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HeatmapData, getHeatmapData } from "@/services/heatmap";
import { AIModel, getModels, updateModel } from "@/services/models";
import { ThreadsAccount, getAccounts, addAccount } from "@/services/accounts";
import { LogEntry, fetchLogs } from "@/services/logs";

export default function AppControlPanelTab() {
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [imageModels, setImageModels] = useState<AIModel[]>([]);
  const [selectedAIModel, setSelectedAIModel] = useState<string | undefined>(undefined);
  const [selectedImageModel, setSelectedImageModel] = useState<string | undefined>(undefined);
  const [accounts, setAccounts] = useState<ThreadsAccount[]>([]);
  const [newAccountToken, setNewAccountToken] = useState("");
  const [newAccountAlias, setNewAccountAlias] = useState("");
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Fetch available models
    getModels().then((models) => {
      setAIModels(models.filter((model) => model.type === 'ai'));
      setImageModels(models.filter((model) => model.type === 'image'));
    });

    // Fetch Threads accounts
    getAccounts().then(setAccounts);

    // Fetch Heatmap Data (initial data)
    getHeatmapData(['example', 'sample'], { start: '2024-01-01', end: '2024-01-02' }).then(setHeatmapData);

      // Fetch Logs (initial data)
    fetchLogs('info', '2024-01-01T00:00:00Z').then(setLogs);

  }, []);

  const handleAIModelChange = (modelId: string) => {
      setSelectedAIModel(modelId);
      updateModel('ai', modelId); // Update the AI model in the backend
  };

  const handleImageModelChange = (modelId: string) => {
      setSelectedImageModel(modelId);
      updateModel('image', modelId); // Update the image model in the backend
  };

  const handleAddAccount = () => {
    addAccount(newAccountToken, newAccountAlias).then(() => {
      // Refresh accounts after adding a new one
      getAccounts().then(setAccounts);
      setNewAccountToken("");
      setNewAccountAlias("");
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Model Selector */}
      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-dadada">AI Model Selector</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleAIModelChange}>
            <SelectTrigger className="bg-input border-input text-dadada rounded-md shadow-none focus-visible:ring-ring focus-visible:ring-offset-background">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {aiModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Image Model Selector */}
      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-dadada">Image Model Selector</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleImageModelChange}>
            <SelectTrigger className="bg-input border-input text-dadada rounded-md shadow-none focus-visible:ring-ring focus-visible:ring-offset-background">
              <SelectValue placeholder="Select Image Model" />
            </SelectTrigger>
            <SelectContent>
              {imageModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Threads Account Management */}
      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-dadada">Threads Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-dadada">Add Account</h4>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Account Token"
                className="bg-input border-input text-dadada rounded-md shadow-none focus-visible:ring-ring focus-visible:ring-offset-background"
                value={newAccountToken}
                onChange={(e) => setNewAccountToken(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Account Alias"
                className="bg-input border-input text-dadada rounded-md shadow-none focus-visible:ring-ring focus-visible:ring-offset-background"
                value={newAccountAlias}
                onChange={(e) => setNewAccountAlias(e.target.value)}
              />
              <Button variant="secondary" onClick={handleAddAccount}>Add</Button>
            </div>
            <h4 className="text-dadada">Current Accounts</h4>
            <ul>
              {accounts.map((account) => (
                <li key={account.id} className="text-dadada">{account.alias}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Debug / Code Status Panel */}
      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-dadada">Debug / Code Status Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="text-dadada">Logs</h4>
          <ul>
            {logs.map((log, index) => (
              <li key={index} className="text-dadada text-sm">
                <span className="text-muted-foreground">{log.timestamp}</span> - <span className={log.logLevel === 'error' ? 'text-destructive' : log.logLevel === 'warn' ? 'text-warning' : ''}>{log.logLevel}</span>: {log.message}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
