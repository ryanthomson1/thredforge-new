import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { toast } from "./ui/use-toast";
import SearchHeatmap from "@/components/SearchHeatmap";
import { ai } from "@/ai/ai-instance";

const MAX_LENGTH = 500;

export default function MVPWireframe() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [includeImages, setIncludeImages] = useState(false);

  const handleGenerate = async () => {
    if (!current.trim()) {
      setError("Prompt cannot be empty");
      return;
    }
    setError(null);
    setLoading(true);
    setPosts([]);
    try {
      const result = await ai.generate(current);
      setPosts((prev) => [result.text, ...prev]);
      setSelectedIndex(0);
      toast({ title: "Post generated", description: "The post was generated successfully" });
    } catch (e: any) {
      const message = e.message || "Unknown error";
      setError(message);
      toast({
        variant: "destructive",
        title: "Failed to generate",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCurrent("");
    setError(null);
    setPosts([]);
    setSelectedIndex(null);
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    const text = posts[index];
    setCurrent(text);
    toast({ title: "Post selected", description: "The post was added to the input" });
  };

  const handleRegenerateVariant = async (index: number) => {
    setLoading(true);
    try {
      const result = await ai.generate(current);
      setPosts((prev) => [result.text, ...prev]);
      setSelectedIndex(0);
      toast({ title: "Variant regenerated", description: "The post was regenerated successfully" });
    } catch (e: any) {
      const message = e.message || "Unknown error";
      toast({
        variant: "destructive",
        title: "Regeneration failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 grid gap-4">
      {/* Core Controls */}
      <Card>
        <CardHeader>
          <CardTitle>New Thread Idea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            disabled={loading}
            className="w-full h-24 p-2 border rounded"
            placeholder="Type your idea here..."
          />
          {error && <p className="text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <div className="space-x-2">
              <Button onClick={handleGenerate} disabled={loading || !current.trim()}>
                {loading ? <Spinner size="sm" /> : "Generate"}
              </Button>
              <Button variant="outline" onClick={handleClear} disabled={loading}>
                Clear All
              </Button>
            </div>
            <span className={current.length > MAX_LENGTH ? "text-destructive" : ""}>
              {current.length} / {MAX_LENGTH}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Variants List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-60 overflow-auto">
          {posts.map((text, i) => (
            <div
              key={i}
              className={`${
                i === selectedIndex ? "border-blue-500 bg-blue-50" : "border"
              } p-2 rounded flex justify-between items-start`}
            >
              <p className="flex-1 cursor-pointer p-1" onClick={() => handleSelect(i)}>
                {text}
              </p>
              <div className="flex flex-col space-y-1 ml-2">
                <Button size="sm" variant="ghost" onClick={() => handleSelect(i)}>
                  Use
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleRegenerateVariant(i)}>
                  Regenerate
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Heatmap + Keyword Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchHeatmap clickable onKeywordClick={(kw) => setCurrent(kw)} />
        </CardContent>
      </Card>

      {/* Image Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Include Images</CardTitle>
        </CardHeader>
        <CardContent>
          <Switch checked={includeImages} onCheckedChange={setIncludeImages} disabled={posts.length === 0} />
        </CardContent>
      </Card>
    </div>
  );
}