import { NextRequest,NextResponse } from 'next/server';
import { deleteHomeImage } from '../../../../../src/lib/singleImageManager';
import { S3Config } from '@repo/s3_database/type';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../../../src/utils/logger';
// Define the context type with asynchronous params
interface Context {
  params: Promise<{ slug: string; imageId:string }>;
}

// GET: Fetch home details by slug
export async function DELETE(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const { slug, imageId } =await context.params;

    if (!slug || !imageId) {
      logger.warn('Missing parameters for image deletion', { context });
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      );
    }

    const home = await prisma.home.findUnique({
      where: { slug }
    });

    if (!home) {
      logger.warn('Home not found:', { slug });
      return NextResponse.json(
        { message: 'Resource not found' },
        { status: 404 }
      );
    }

    const s3Config: S3Config = {
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || 'default-bucket',
      endpoint: process.env.S3_ENDPOINT
    };

    await deleteHomeImage(s3Config, imageId);

    return NextResponse.json(
      { message: 'Image deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error deleting home image:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      context,
      endpoint: 'DELETE /api/[slug]/delete/[imageId]'
    });
    return NextResponse.json(
      { message: 'Unable to delete image' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}
