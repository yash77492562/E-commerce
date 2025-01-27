import { useState, useEffect } from 'react';
import axios from 'axios';

interface ProductImage {
  id: string;
  image_url: string;
  is_main: boolean;
  uploaded_at: Date;
}

export const useProductImages = (productId: string) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/product/${productId}/images`);
        
        if (response.data.success) {
          setImages(response.data.images);
          
          // Automatically select the main image or first image
          const mainImageIndex = response.data.images.findIndex((img: ProductImage) => img.is_main);
          setSelectedImageIndex(mainImageIndex !== -1 ? mainImageIndex : 0);
        } else {
          throw new Error('Failed to fetch product images');
        }
      } catch (err) {
        setError('Error fetching product images');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductImages();
    }
  }, [productId]);

  const selectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  return {
    images,
    loading,
    error,
    selectedImage: images[selectedImageIndex],
    selectImage
  };
};