import { NextRequest, NextResponse } from 'next/server';
import { uploadSingleHomeImage } from '../../../src/lib/singleImageManager';
import { prisma } from '@repo/prisma_database/client';
import { S3Service } from '@repo/s3_database/client';

export async function GET() {
  try {
    // Fetch all home images
    const homes = await prisma.home.findMany({
      include: {
        home_images: true
      },
      orderBy: {
        uploaded_at: 'desc' // Optional: sort by most recent first
      }
    });

    // If no homes found, return empty array
    if (!homes || homes.length === 0) {
      return NextResponse.json({ 
        homes: [],
        message: 'No home images found' 
      }, { status: 200 });
    }

    // S3 Configuration 
    const s3Config = {
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || 'default-bucket',
      endpoint: process.env.S3_ENDPOINT // Optional: for custom endpoints like Minio
    };

    // Initialize S3 Service
    const s3Service = new S3Service(s3Config);

    // Generate signed URLs for images
    const homesWithSignedUrls = await Promise.all(homes.map(async (home) => {
      const imagesWithUrls = await Promise.all(home.home_images.map(async (image) => {
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
            image_url: '' // Provide empty URL if signing fails
          };
        }
      }));
    
      return {
        ...home,
        home_images: imagesWithUrls
      };
    }));

    return NextResponse.json({ 
      homes: homesWithSignedUrls,
      message: 'Home images retrieved successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error retrieving home images:', error);
    
    return NextResponse.json({ 
      error: 'Failed to retrieve home images', 
      details: error instanceof Error 
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          } 
        : { message: 'Unknown error occurred' }
    }, { status: 500 });
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const firstPara = formData.get('first_para') as string;
    const secondPara = formData.get('second_para') as string;
    const thirdPara = formData.get('third_para') as string;

    // Validate required fields
    if (!title || !firstPara || !secondPara) {
      return NextResponse.json({ 
        error: 'Title, first paragraph, and second paragraph are required' 
      }, { status: 400 });
    }

    // Check if file exists
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // S3 Configuration 
    const s3Config = {
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || 'default-bucket',
      endpoint: process.env.S3_ENDPOINT // Optional: for custom endpoints like Minio
    };

    // Check total home images 
    const totalHomeImages = await prisma.homeImage.count();
    if (totalHomeImages >= 6) {
      return NextResponse.json({ error: 'Maximum image limit reached' }, { status: 400 });
    }

    // Upload the image
    const home = await uploadSingleHomeImage(s3Config, {
      title: title.trim(),
      first_para: firstPara.trim(),
      second_para: secondPara.trim(),
      third_para: thirdPara?.trim() || ''
    }, {
      buffer,
      fileName: file.name,
      contentType: file.type,
      contentLength: buffer.length
    });

    // Return the uploaded image details
    return NextResponse.json({ 
      message: 'Image uploaded successfully', 
      home 
    }, { status: 200 });

  } catch (error) {
    console.error('Detailed image upload error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to upload image', 
      details: error instanceof Error 
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          } 
        : { message: 'Unknown error occurred' }
    }, { status: 500 });
  }
}

