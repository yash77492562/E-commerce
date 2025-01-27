import React from 'react';
import Image from 'next/image';
import { useProductImages } from '../../../src/hooks/useProductGet';

interface ProductImageGalleryProps {
  productId: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ productId }) => {
    const { images, loading, error, selectedImage, selectImage } = useProductImages(productId);
  
    if (loading) return <div>Loading images...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!images.length) return <div>No images found</div>;
  
    return (
      <div className="flex flex-col">
        {/* Main Image Display */}
        {selectedImage ? (
          <div className="main-image mb-4 relative h-96">
            <Image 
              loader={() => selectedImage.image_url}
              src={selectedImage.image_url}
              alt="Selected Product Image" 
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="main-image mb-4">No image selected</div>
        )}
  
        {/* Thumbnail Gallery */}
        <div className="thumbnail-gallery flex space-x-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative w-16 h-16 cursor-pointer ${
                selectedImage && selectedImage.id === image.id 
                  ? 'border-2 border-blue-500' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => selectImage(index)}
            >
              <Image
                loader={() => image.image_url}
                src={image.image_url}
                alt={`Product Image ${index + 1}`}
                fill
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
