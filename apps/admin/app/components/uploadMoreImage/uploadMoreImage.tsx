import React, { useState, useRef } from 'react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedImage {
  url: string;
  key:string;
  id: string;
  index: number;
}

interface UploadMoreImagesProps {
  productId: string;
  lastIndex: number;
  onImagesUploaded: (images: UploadedImage[]) => void;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  images: UploadedImage[];
}

export default function UploadMoreImages({ 
  productId, 
  lastIndex,
  onImagesUploaded 
}: UploadMoreImagesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    
    const file = files[0];
    if (!file) return;
    
    setIsUploading(true);
  
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productId', productId);
      formData.append('lastIndex', lastIndex.toString());
  
      const response = await fetch('/api/uploadMoreImage', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json() as UploadResponse;
  
      if (result.success) {
        toast.success(`Image uploaded successfully`);
        onImagesUploaded(result.images);
      } else {
        toast.error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An error occurred while uploading image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className={`
          relative w-20 h-20 flex items-center justify-center 
          border-2 border-dashed border-gray-300 
          hover:border-blue-500 transition-colors
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="Upload image"
      >
        {isUploading ? (
          <div className="animate-spin" aria-label="Loading">
            <svg 
              className="w-8 h-8 text-blue-500" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <PlusIcon size={32} className="text-gray-500" />
        )}
      </button>
    </div>
  );
}