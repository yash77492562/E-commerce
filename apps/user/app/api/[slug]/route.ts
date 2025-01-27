// Import necessary modules
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { S3Service } from '@repo/s3_database/client';

interface Context {
  params: Promise<{ slug: string }>;
}

// GET: Fetch home details by slug
export async function GET(
  request: NextRequest,
  context: Context // Proper type for context
) {
  try {
    const { slug } = await context.params; // Explicitly extract params from the context

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
    console.error('Error fetching home details:', error);
    return NextResponse.json({ error: 'Failed to fetch home details' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
