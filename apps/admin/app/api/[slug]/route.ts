// Import necessary modules
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { S3Service } from '@repo/s3_database/client';
import { generateUniqueSlug } from '../../../src/utils/slug';
import logger from '../../../src/utils/logger';

// Define the context type with asynchronous params
interface Context {
  params: Promise<{ slug: string }>;
}

// GET: Fetch home details by slug
export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const home = await prisma.home.findUnique({
      where: { slug },
      include: {
        home_images: {
          orderBy: { uploaded_at: 'asc' }
        }
      }
    });

    if (!home) {
      return NextResponse.json({ error: 'Home not found' }, { status: 404 });
    }

    const imagesWithUrls = await Promise.all(
      home.home_images.map(async (image) => {
        if (image.image_key) {
          const s3Config = {
            region: process.env.S3_REGION || '',
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            bucket: process.env.S3_BUCKET || 'default-bucket',
            endpoint: process.env.S3_ENDPOINT
          };

          const s3Service = new S3Service(s3Config);

          try {
            const url = await s3Service.getSignedUrl(image.image_key);
            return { ...image, image_url: url };
          } catch (err) {
            console.error(`Failed to get signed URL for image ${image.id}:`, err);
            return { ...image, image_url: '' };
          }
        }
        return { ...image, image_url: '' };
      })
    );

    return NextResponse.json({
      ...home,
      home_images: imagesWithUrls
    });
  } catch (error) {
    logger.error('Error fetching home details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      slug: (await context.params).slug,
      endpoint: 'GET /api/[slug]'
    });
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}

// PATCH: Update home details
export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const body = await request.json();
    const { title, first_para, second_para, third_para } = body;

    // Generate a new slug if the title is provided
    const newSlug = title ? await generateUniqueSlug(title) : undefined;

    const updatedHome = await prisma.home.update({
      where: { slug },
      data: {
        ...(title && { title }),
        ...(newSlug && { slug: newSlug }),
        ...(first_para && { first_para }),
        ...(second_para && { second_para }),
        third_para: third_para === '' ? null : third_para,
      },
      include: { home_images: true }
    });

    // Return both the updated data and the new slug
    return NextResponse.json({
      ...updatedHome,
      newSlug: newSlug || slug // Include the new slug in response
    });
  } catch (error) {
    logger.error('Error updating home details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      slug: (await context.params).slug,
      endpoint: 'PATCH /api/[slug]'
    });
    return NextResponse.json({ message: 'Unable to update home' }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}
