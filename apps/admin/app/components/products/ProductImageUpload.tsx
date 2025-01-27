'use client'
import React, { useRef } from 'react';
import Image from 'next/image';
import { enhancedHandleFileChange } from '../../../src/ImageEnhance/imageProcessor';

interface ProductImageUploadProps {
  images: { file: File; preview: string }[];
  onFileSelect: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  errors?: string[];
  onError?: (errors: string[]) => void;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ 
  images, 
  onFileSelect, 
  onRemoveImage, 
  errors,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange =async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    onFileSelect(files);
    const newErrors = await enhancedHandleFileChange(event, onFileSelect);
    if (newErrors.length > 0 && onError) {
      onError(newErrors);  // Pass errors up to parent instead of using setErrors
    }
  };

  return (
    <div className="product-image-upload">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden-file-input"
        id="product-image-upload"
      />
      
      {errors && errors.length > 0 && (
        <div className="error-container">
          {errors.map((error, index) => (
            <p key={index} className="error-message">{error}</p>
          ))}
        </div>
      )}

      <label 
        htmlFor="product-image-upload" 
        className="upload-button"
      >
        Select Images (Max 5)
      </label>

      <div className="image-preview-container">
        {images.map((image, index) => (
          <div key={image.preview} className="image-preview-wrapper">
            <div className="relative w-full h-full">
              <Image
                src={image.preview}
                alt={`Product preview ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <button 
              onClick={() => onRemoveImage(index)} 
              className="remove-image-btn"
            >
              ✕
            </button>
            {index === 0 && <div className="main-image-label">Main</div>}
          </div>
        ))}
      </div>

      <style jsx>{`
        .product-image-upload {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 2px dashed #ccc;
          border-radius: 8px;
          text-align: center;
        }

        .hidden-file-input {
          display: none;
        }

        .upload-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .upload-button:hover {
          background-color: #0056b3;
        }

        .image-preview-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }

        .image-preview-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background-color: rgba(255,0,0,0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .remove-image-btn:hover {
          background-color: rgba(255,0,0,0.9);
        }

        .error-container {
          background-color: #ffeeee;
          border: 1px solid red;
          color: red;
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 5px;
        }

        .error-message {
          margin: 5px 0;
        }

        .main-image-label {
          position: absolute;
          top: 5px;
          left: 5px;
          background-color: rgba(0,0,0,0.7);
          color: white;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
};

export default ProductImageUpload;