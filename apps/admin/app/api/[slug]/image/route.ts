import { NextRequest, NextResponse } from 'next/server';
import { changeuploadSingleHomeImage } from '../../../../src/lib/singleImageManager';
import { S3Config } from '@repo/s3_database/type';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../../src/utils/logger';

export async function POST(
  request: NextRequest
) {
  try {
    // Retrieve S3 configuration 
    
    const s3Config:S3Config = {
        region: process.env.S3_REGION || '',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        bucket: process.env.S3_BUCKET || 'default-bucket',
        endpoint: process.env.S3_ENDPOINT
      };

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageId = formData.get('imageId') as string;
    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!imageId) {
      return NextResponse.json({ error: 'Home ID is required' }, { status: 400 });
    }
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Call the image upload function
    const updatedHome = await changeuploadSingleHomeImage(
      s3Config,
      imageId,
      {
        buffer,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size
      }
    );
    const response = await prisma.home.findFirst({
      where:{
        id:updatedHome.home_id
      },
      include:{
        home_images:true
      }
    })
    // Return the updated home data
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('Image upload error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: 'POST /api/[slug]/image',
      url: request.url
    });
    return NextResponse.json(
      { message: 'Unable to process image upload' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}