import {  NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { S3Service } from '@repo/s3_database/client';




export async function GET() {
  try {
    // Fetch the first (and only) About entry
    const about = await prisma.about.findFirst({
      include: {
        about_images: true
      },
      orderBy: {
        uploaded_at: 'desc'
      }
    });

    // If no about entry found, return appropriate response
    if (!about) {
      return NextResponse.json({
        about: null,
        message: 'No About entry found'
      }, { status: 200 });
    }

    // S3 Configuration
    const s3Config = {
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || 'default-bucket',
      endpoint: process.env.S3_ENDPOINT
    };

    // Initialize S3 Service
    const s3Service = new S3Service(s3Config);

    // Generate signed URLs for images, only for images with valid keys
    const imagesWithSignedUrls = await Promise.all(about.about_images.map(async (image) => {
      // Check if image_key exists and is not empty
      if (!image.image_key || image.image_key.trim() === '') {
        return {
          ...image,
          image_url: '',
          image_key: ''
        };
      }

      try {
        const url = await s3Service.getSignedUrl(image.image_key);
        return {
          ...image,
          image_url: url
        };
      } catch (urlError) {
        console.error(`Failed to get signed URL for image ${image.id}:`, urlError);
        return {
          ...image,
          image_url: '',
          image_key: ''
        };
      }
    }));

    // Return about entry with signed image URLs
    return NextResponse.json({
      about: {
        ...about,
        about_images: imagesWithSignedUrls
      },
      message: 'About entry retrieved successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error retrieving About entry:', error);

    return NextResponse.json({
      error: 'Failed to retrieve About entry',
      details: error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          }
        : { message: 'Unknown error occurred' }
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
  }
}

