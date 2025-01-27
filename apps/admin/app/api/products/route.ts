import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { S3Service } from '@repo/s3_database/client';
import logger from '../../../src/utils/logger';

// Define the ProductImage interface
interface ProductImage {
  id: string;
  product_id: string;
  image_key: string;
  image_url: string;
  is_main: boolean;
  index:number
  uploaded_at: Date;
}

// DELETE request handler
export async function DELETE(req: NextRequest) {
  try {
    // Extract product_id and imageUrl from the request body
    const { product_id, imageUrl } = await req.json(); 

    if (!product_id || !imageUrl) {
      return NextResponse.json({ success: false, message: 'Invalid data provided' }, { status: 400 });
    }

    // Find the image in the database
    const image: ProductImage | null = await prisma.productImage.findFirst({
      where: {
        product_id,
        image_key: imageUrl,
      },

    });
    if (!image) {
      return NextResponse.json({ success: false, message: 'Image not found' }, { status: 404 });
    }

    // Initialize S3 service
    const s3Service = new S3Service({
      region: process.env.S3_REGION!,
      endpoint: process.env.S3_ENDPOINT!,
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      bucket: process.env.S3_BUCKET!,
    });

    // Delete from S3
    await s3Service.deleteFile(image.image_key);

    // Delete from the database
    await prisma.productImage.delete({
      where: { id: image.id },
    });

   // Find remaining images for this product
   const remainingImages: ProductImage[] = await prisma.productImage.findMany({
    where: { product_id },
    orderBy: { index: 'asc' }
  });

  // Reorganize indices and handle main image
  if (remainingImages && remainingImages.length > 0) {
    // Create update promises for index reorganization
    const updatePromises = remainingImages.map((img, newIndex) => {
      // If the deleted image was the first one (index 0), 
      // ensure the first remaining image is set as main
      const isMainImage = newIndex === 0;

      return prisma.productImage.update({
        where: { id: img.id },
        data: {
          index: newIndex,
          is_main: isMainImage
        }
      });
    });

    // Execute all update promises
    await Promise.all(updatePromises);
  }
  
  return NextResponse.json({ 
    success: true,
    remainingImages: remainingImages.map(img => ({
      id: img.id,
      index: img.index,
      image_url: img.image_url,
      is_main: img.is_main
    }))
  }, { status: 200 });
} catch (error) {
  logger.error('Error deleting image:', error);
  await prisma.$disconnect();
  return NextResponse.json({ success: false, message: 'Failed to delete image. Please try again later.' }, { status: 500 });
}
}

// PUT request handler
export async function PUT(req: NextRequest) {
  try {
    // Extract product_id and images array from the request body
    const { product_id, images } = await req.json();

    if (!product_id || !images || !Array.isArray(images)) {
      return NextResponse.json({ success: false, message: 'Invalid data provided' }, { status: 400 });
    }

    // Update images in the database
    const updatePromises = images.map((image: ProductImage , index:number) =>
      prisma.productImage.update({
        where: { 
          id: image.id,
        },
        data: {
          index,
          id:image.id,
          image_key:image.image_key,
          image_url:image.image_url,
          is_main:image.is_main,
          uploaded_at:image.uploaded_at
        },
      })
    );
    await Promise.all(updatePromises);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error reordering images:', error);
    await prisma.$disconnect();
    return NextResponse.json({ success: false, message: 'Failed to reorder images. Please try again later.' }, { status: 500 });
  }
}
