'use client'
import {  useState } from 'react';
import { S3Config } from '@repo/s3_database/type';
import { validateFiles, createImagePreviews } from '../utils/fileUtils';
import { ProductCreateData } from '../types/product';
import { Buffer } from 'buffer';
import axios from 'axios'

export const useProductUpload = (s3Config: S3Config) => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [, setProductData] = useState<Omit<ProductCreateData, 'images'>>({
    title: '',
    description: '',
    tags:[],
    discount:0, 
    discount_rate:0,
    discountLessValue:0,
    price: 0,
    category: '', 
    subCategory:'',
  });
  const [, setUploadFiles] = useState<
    { buffer: Buffer; fileName: string; contentType: string }[]
  >([]);

  
  const handleFileSelect = (files: File[]) => {
    const validationResult = validateFiles(files);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setErrors([]);

    const newImages = createImagePreviews(files);

    if (images.length + newImages.length > 5) {
      setErrors(['You can only upload up to 5 images at a time.']);
      return;
    }

    setImages(prevImages => [...prevImages, ...newImages]);
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const clearImages = () => {
    setImages([]);
    setUploadFiles([]);
  };

  const submitProduct = async (productData: Omit<ProductCreateData, 'images'>) => {
    try {
      // Check if there are images
      if (images.length === 0) {
        setErrors(['Please upload at least one image']);
        return false;
      }
  
      const fileUploads = await Promise.all(
        images.map(async (image) => {
          const arrayBuffer = await image.file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          return {
            buffer: buffer,
            fileName: image.file.name,
            contentType: image.file.type,
            contentLength: buffer.length
          };
        })
      );
  
      // Set uploadFiles and productData
      setUploadFiles(fileUploads);
      setProductData(productData);
  
      // Trigger upload manually if useEffect doesn't fire
      if (fileUploads.length > 0 && productData.title) {
        try {
          await axios.post("/api/productService", {
            uploadFiles: fileUploads,
            productData,
            s3Config
          }, {
            headers: {
              "Content-Type": "application/json"
            }
          });
          return true;
        } catch (error) {
          console.error('Direct upload error:', error);
          setErrors(["Error uploading product"]);
          return false;
        }
      }
  
      return true;
    } catch (error) {
      setErrors(['Failed to create product']);
      throw error;
    }
  };

  return {
    images,
    errors,
    handleFileSelect,
    removeImage,
    submitProduct,
    clearImages, // Added clearImages method
    setProductData, // Optional: expose setProductData if needed
  };
};