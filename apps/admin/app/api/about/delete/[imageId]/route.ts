import { NextRequest, NextResponse } from 'next/server';
import { deleteAboutImage } from '../../../../../src/lib/singleImageManager';
import { S3Config } from '@repo/s3_database/type';
import logger from '../../../../../src/utils/logger';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ imageId: string }> } // Updated to Promise
) {
  try {
    const { imageId } = await context.params; // Awaiting params

    if (!imageId) {
      logger.warn('No imageId provided for about image deletion');
      return NextResponse.json(
        { message: 'Missing required information' },
        { status: 400 }
      );
    }

    const s3Config: S3Config = {
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || 'default-bucket',
      endpoint: process.env.S3_ENDPOINT,
    };

    // Delete the image
    const result = await deleteAboutImage(s3Config, imageId);
    return NextResponse.json(
      {
        message: 'Image deleted successfully',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in DELETE /api/about/delete/[imageId]:', error);
    return NextResponse.json(
      {
        message: 'Unable to delete image. Please try again later.',
      },
      { status: 500 }
    );
  }
}
