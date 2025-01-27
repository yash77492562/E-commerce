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
        <div className="main-image mb-4">
          <Image 
            src={selectedImage.image_url} 
            alt="Selected Product Image" 
            width={500}
            height={500}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
      ) : (
        <div className="main-image mb-4">No image selected</div>
      )}

      {/* Thumbnail Gallery */}
      <div className="thumbnail-gallery flex space-x-2">
        {images.map((image, index) => (
          <Image
            key={image.id}
            src={image.image_url}
            alt={`Product Image ${index + 1}`}
            width={64}
            height={64}
            className={`w-16 h-16 object-cover rounded cursor-pointer ${
              selectedImage && selectedImage.id === image.id 
                ? 'border-2 border-blue-500' 
                : 'opacity-70 hover:opacity-100'
            }`}
            onClick={() => selectImage(index)}
          />
        ))}
      </div>
    </div>
  );
};
