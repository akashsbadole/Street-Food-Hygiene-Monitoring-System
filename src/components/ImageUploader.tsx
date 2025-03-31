
import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  onImageUploaded: (image: string) => void;
}

const ImageUploader = ({ onImageUploaded }: ImageUploaderProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      onImageUploaded(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!previewImage ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer hover:border-street-orange ${
            isDragOver ? 'border-street-orange bg-street-yellow/10' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-street-yellow/20">
              <Upload className="h-8 w-8 text-street-orange" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Upload an image</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, GIF up to 10MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-street-orange text-street-orange hover:bg-street-orange hover:text-white"
            >
              Select Image
            </Button>
          </div>
        </div>
      ) : (
        <Card className="relative overflow-hidden rounded-lg">
          <div className="absolute top-2 right-2 z-10">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleClearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader;
