// tagged for gh commit 24 apr 25
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockImages = [
  { id: "1", url: "https://picsum.photos/id/10/200/300", metadata: { description: "Image 1 description" } },
  { id: "2", url: "https://picsum.photos/id/20/200/300", metadata: { description: "Image 2 description" } },
  { id: "3", url: "https://picsum.photos/id/30/200/300", metadata: { description: "Image 3 description" } },
  { id: "4", url: "https://picsum.photos/id/40/200/300", metadata: { description: "Image 4 description" } },
  { id: "5", url: "https://picsum.photos/id/50/200/300", metadata: { description: "Image 5 description" } },
  { id: "6", url: "https://picsum.photos/id/60/200/300", metadata: { description: "Image 6 description" } },
  { id: "7", url: "https://picsum.photos/id/70/200/300", metadata: { description: "Image 7 description" } },
  { id: "8", url: "https://picsum.photos/id/80/200/300", metadata: { description: "Image 8 description" } },
];

export default function ImageControlPanelTab() {
  const [images, setImages] = useState(mockImages);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(images[0]); // Start with the first image selected

  const handleSearch = () => {
    // TODO: Implement search logic here
    console.log("Searching for:", searchTerm);
  };

  const handleImageSelect = (image: any) => {
    setSelectedImage(image);
    // TODO: Fetch image metadata to display in a separate area
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Side: Image Gallery */}
      <div className="space-y-6">
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-dadada">Image Browser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Input
                type="text"
                placeholder="Search images..."
                className="bg-input border-input text-dadada rounded-md shadow-none focus-visible:ring-ring focus-visible:ring-offset-background mr-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="secondary" onClick={handleSearch}>
                Search
              </Button>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.metadata.description}
                    className={`rounded-md cursor-pointer ${
                      selectedImage?.id === image.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleImageSelect(image)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Image Metadata & Actions */}
      <div className="space-y-6">
        <Card className="shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-dadada">Image Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedImage ? (
              <>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.metadata.description}
                  className="rounded-md mb-4"
                />
                <p className="text-dadada">Description: {selectedImage.metadata.description}</p>
                {/* TODO: Display other metadata here */}
                <Button variant="primary" className="mt-4">
                  Upload to Instagram (Future)
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Select an image to view metadata.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
