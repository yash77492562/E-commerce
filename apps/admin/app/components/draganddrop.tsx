'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Grip, ChevronLeft, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import UploadMoreImages from './uploadMoreImage/uploadMoreImage';

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
  onImagesUpdated: (images: ProductImage[]) => void;
};

export default function ProductImageGallery({ 
  product, 
  onImagesUpdated 
}: ProductImageGalleryProps) {
  // Ensure product_images is never undefined by providing an empty array as fallback
  const initialImages = product?.product_images || [];
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Safely initialize selectedImage with proper null checks
  const [selectedImage, setSelectedImage] = useState<string | null>(() => {
    if (!product?.product_images?.length) return null;
    const mainImage = product.product_images.find(img => img?.is_main)?.image_url;
    const firstImage = product.product_images[0]?.image_url;
    return mainImage || firstImage || null;
  });

  useEffect(() => {
    if (!product?.product_images) return;
    
    // Safely update images when product images change
    const newImages = product.product_images;
    setImages(newImages);
    
    // Update selectedImage if current selection is no longer valid
    if (newImages.length > 0 && !newImages.some(img => img.image_url === selectedImage)) {
      const mainImage = newImages.find(img => img?.is_main)?.image_url;
      const firstImage = newImages[0]?.image_url;
      setSelectedImage(mainImage || firstImage || null);
      setCurrentImageIndex(0);
    }
  }, [product?.product_images, selectedImage]);

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

  const handleDeleteImage = async (imageToDelete: ProductImage) => {
    try {
      const response = await fetch(`/api/products/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          product_id: product.id,
          imageUrl: imageToDelete.image_key
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newImages = images.filter(img => img.image_url !== imageToDelete.image_url);
        
        const newSelectedImage = imageToDelete.is_main 
          ? (newImages[0]?.image_url || null) 
          : selectedImage;

        setImages(newImages);
        setSelectedImage(newSelectedImage);
        setCurrentImageIndex(0); // Reset to first image after deletion
        
        onImagesUpdated(newImages);
      } else {
        console.error('Failed to delete image:', result.message);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
  
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
  
    if (
      sourceIndex < 0 ||
      sourceIndex >= images.length ||
      destinationIndex < 0 ||
      destinationIndex >= images.length
    ) {
      return;
    }
  
    const newImages = Array.from(images);
    const [reorderedImage] = newImages.splice(sourceIndex, 1);
  
    if (!reorderedImage) return; 
  
    newImages.splice(destinationIndex, 0, reorderedImage);
  
    const updatedImages: ProductImage[] = newImages.map((img, index) => ({
      ...img,
      is_main: index === 0,
    }));
  
    try {
      const response = await fetch(`/api/products/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            images: updatedImages,
            product_id: product.id
        }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        setImages(updatedImages);
        setSelectedImage(updatedImages[0]?.image_url || null);
        setCurrentImageIndex(0);
        onImagesUpdated(updatedImages);
      } else {
        console.error('Failed to reorder images:', result.message);
      }
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };

  const handleNewImagesUpload = (newImages: ProductImage[]) => {
    if (!newImages?.length) return;
    
    // Immediately update the gallery with new images
    setImages(prev => {
      const updatedImages = [...prev, ...newImages];
      return updatedImages;
    });

    // If no image is currently selected, select the first new image
    if (!selectedImage) {
      setSelectedImage(newImages[0]?.image_url || null);
      setCurrentImageIndex(0);
    }

    // Notify parent component
    onImagesUpdated(newImages);
  };

  // Add effect to sync images when product images change
  useEffect(() => {
    if (product?.product_images) {
      setImages(product.product_images);
      
      // Update selected image if none is selected
      if (!selectedImage && product.product_images.length > 0) {
        setSelectedImage(product.product_images[0]?.image_url || null);
        setCurrentImageIndex(0);
      }
    }
  }, [product?.product_images, selectedImage]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col h-full">
        {/* Main Image Display with Navigation Arrows */}
        <div className="flex-grow relative mb-4">
          {selectedImage ? (
            <>
              <Image
                loader={() => selectedImage || ''}
                src={selectedImage || ''}
                alt={product.title}
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
        <Droppable droppableId="product-images" direction="horizontal">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex space-x-2 overflow-x-auto hide-scrollbar pb-2"
            >
              {images.map((image, index) => (
                <Draggable 
                  key={image.image_url} 
                  draggableId={image.image_url} 
                  index={index}
                >
                  {(provided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative w-20 h-20 flex-shrink-0 group"
                    >
                      <div 
                        {...provided.dragHandleProps} 
                        className="absolute top-0 left-0 z-10 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Grip size={16} className="text-gray-500" />
                      </div>
                      <button 
                        onClick={() => handleDeleteImage(image)}
                        className="absolute top-0 right-0 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      <Image
                        loader={() => image.image_url || ''}
                        src={image.image_url}
                        alt={`Product Image ${index + 1}`}
                        fill
                        onClick={() => {
                          setSelectedImage(image.image_url);
                          setCurrentImageIndex(index);
                        }}
                        className={`object-cover object-center border-2 cursor-pointer 
                          ${currentImageIndex === index 
                            ? 'border-blue-500' 
                            : 'border-transparent'
                          } 
                          ${index === 0 ? 'border-green-500' : ''}
                          hover:opacity-80 transition-opacity
                        `}
                        sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 80px"
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              <UploadMoreImages 
                productId={product.id}
                lastIndex={images.length} 
                onImagesUploaded={(uploadedImages) => {
                  const productImages: ProductImage[] = uploadedImages.map((img, idx) => ({
                    index: images.length + idx,
                    image_url: img.url,
                    image_key: img.key,
                    id: img.id,
                    is_main: false
                  }));
                  handleNewImagesUpload(productImages);
                }}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}