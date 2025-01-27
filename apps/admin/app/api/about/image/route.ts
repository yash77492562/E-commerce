import { NextRequest, NextResponse } from 'next/server';
import { changeuploadSingleAboutImage } from '../../../../src/lib/singleImageManager';
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
      logger.warn('No file provided for about image upload');
      return NextResponse.json({ 
        message: 'Please select an image to upload' 
      }, { status: 400 });
    }

    if (!imageId) {
      logger.warn('No imageId provided for about image upload');
      return NextResponse.json({ 
        message: 'Missing required information' 
      }, { status: 400 });
    }
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Call the image upload function
    const updatedHome = await changeuploadSingleAboutImage(
      s3Config,
      imageId,
      {
        buffer,
        fileName: file.name,
        contentType: file.type,
        contentLength: file.size
      }
    );
    const response = await prisma.about.findFirst({
      where:{
        id:updatedHome.about_id
      },
      include:{
        about_images:true
      }
    })
    // Return the updated home data
    return NextResponse.json({
      message: 'Image updated successfully',
      data: response
    }, { status: 200 });
  } catch (error) {
    logger.error('Error in POST /api/about/image:', error);
    return NextResponse.json({ 
      message: 'Unable to update image. Please try again later.' 
    }, { status: 500 });
  }
}