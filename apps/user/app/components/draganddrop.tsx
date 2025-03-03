import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ProductImage = {
  index: number;
  image_url: string;
  is_main?: boolean;
  image_key: string;
  id: string;
};

type ProductImageGalleryProps = {
  product: {
    id: string;
    title: string;
    product_images: ProductImage[];
  };
};

export default function ProductImageGallery({ 
  product, 
}: ProductImageGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>(product.product_images);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    images.find(img => img.is_main)?.image_url || images[0]?.image_url || null
  );

  useEffect(() => {
    // Update images when product images change
    setImages(product.product_images);
  }, [product.product_images]);

  const nextImage = () => {
    if (images.length <= 1) return;
    const newIndex = (currentImageIndex + 1) % images.length;
    const nextImage = images[newIndex];
    if (!nextImage?.image_url) return;
    setCurrentImageIndex(newIndex);
    setSelectedImage(nextImage.image_url);
  };
  
  const previousImage = () => {
    if (images.length <= 1) return;
    const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    const prevImage = images[newIndex];
    if (!prevImage?.image_url) return;
    setCurrentImageIndex(newIndex);
    setSelectedImage(prevImage.image_url);
  };

  return (
    <div className="flex flex-col h-full ">
      {/* Main Image Display with Navigation Arrows */}
      <div className="flex-grow relative mb-4">
        {selectedImage ? (
          <>
            <Image
              loader={() => selectedImage || ''}
              src={selectedImage || ''}
              alt={product.title}
              loading='lazy'
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            No Image
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex space-x-2 overflow-x-auto hide-scrollbar  pb-2">
        {images.map((image, index) => (
          <div 
            key={image.image_url}
            className="relative w-20 h-20 flex-shrink-0"
          >
            <Image
              loader={() => image.image_url || ''}
              src={image.image_url}
              alt={`Product Image ${index + 1}`}
              loading='lazy'
              fill
              onClick={() => {
                setSelectedImage(image.image_url);
                setCurrentImageIndex(index);
              }}
              className={`object-cover object-center border-2 cursor-pointer 
                ${currentImageIndex === index 
                  ? 'border' 
                  : 'border-transparent'
                } 
                ${index === 0 ? 'border' : ''}
                hover:opacity-80 transition-opacity
              `}
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 80px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}