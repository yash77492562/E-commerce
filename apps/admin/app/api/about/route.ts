import { NextRequest, NextResponse } from 'next/server';
import { uploadAboutContent } from '../../../src/lib/singleImageManager';
import { prisma } from '@repo/prisma_database/client';
import { S3Service } from '@repo/s3_database/client';
import logger from '../../../src/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const existingAbout = await prisma.about.findFirst();
    
    if (existingAbout) {
      logger.warn('Attempted to create duplicate about entry');
      return NextResponse.json({ 
        message: 'About section already exists. Only one entry is allowed.' 
      }, { status: 400 });
    }
    // Get the form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const heading = formData.get('heading') as string;
    const firstPara = formData.get('first_para') as string;
    const secondPara = formData.get('second_para') as string;
    const thirdPara = formData.get('third_para') as string;
    const fourPara = formData.get('four_para') as string;

    // Validate required fields
    if (!heading || !firstPara || !secondPara || !thirdPara || !fourPara) {
      logger.warn('Missing required fields in about creation');
      return NextResponse.json({ 
        message: 'Please fill in all required fields' 
      }, { status: 400 });
    }

    // Check if exactly 3 files exist
    if (!files || files.length !== 3) {
      logger.warn('Invalid number of files uploaded');
      return NextResponse.json({ 
        message: 'Please upload exactly 3 images' 
      }, { status: 400 });
    }

    // Check total about images 
    const totalAboutImages = await prisma.aboutImage.count();
    if (totalAboutImages >= 6) {
      logger.warn('Maximum image limit reached');
      return NextResponse.json({ 
        message: 'Maximum number of images already uploaded' 
      }, { status: 400 });
    }

    // Convert files to buffers
    const fileBuffers = await Promise.all(files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        fileName: file.name,
        contentType: file.type,
        contentLength: arrayBuffer.byteLength
      };
    }));

    // S3 Configuration 
    const s3Config = {
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || 'default-bucket',
      endpoint: process.env.S3_ENDPOINT // Optional: for custom endpoints like Minio
    };

    // Upload the about content
    const about = await uploadAboutContent(s3Config, {
      heading: heading.trim(),
      first_para: firstPara.trim(),
      second_para: secondPara.trim(),
      third_para: thirdPara.trim(),
      four_para: fourPara.trim()
    }, fileBuffers);

    // Return the uploaded content details
    return NextResponse.json({ 
      message: 'About section created successfully', 
      about 
    }, { status: 200 });

  } catch (error) {
    logger.error('Error in POST /api/about:', error);
    return NextResponse.json({ 
      message: 'Unable to create about section. Please try again later.' 
    }, { status: 500 });
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}

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
        message: 'About section not found'
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
    logger.error('Error in GET /api/about:', error);
    return NextResponse.json({
      message: 'Unable to fetch about section. Please try again later.'
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
  }
}

// PATCH: Update home details
export async function PATCH(
  request: NextRequest, 
) {
  try {

    const body = await request.json();
    const { id ,heading, first_para, second_para, third_para,four_para } = body;

    const updatedHome = await prisma.about.update({
      where: { id },
      data: {
        ...(heading && { heading }),
        ...(first_para && { first_para }),
        ...(second_para && { second_para }),
        ...(third_para && { third_para }),
        ...(four_para && { four_para })
      },
      include: { about_images: true }
    });

    return NextResponse.json({
      message: 'About section updated successfully',
      data: updatedHome
    });
  } catch (error) {
    logger.error('Error in PATCH /api/about:', error);
    return NextResponse.json({ 
      message: 'Unable to update about section. Please try again later.' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
