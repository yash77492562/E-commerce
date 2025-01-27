import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../src/lib/s3';
import { S3Config } from '@repo/s3_database/type';
import { getUserId } from '../../userId/userID';
import { prisma } from '@repo/prisma_database/client';
import { Buffer } from 'buffer';
import logger from '../../../src/utils/logger';

// Configure S3 credentials (ensure these are securely stored in environment variables)
const s3Config: S3Config = {
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    bucket: process.env.S3_BUCKET!,
};

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getUserId();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const productId = formData.get('productId');
    const lastIndex = formData.get('lastIndex');
    const file = formData.get('image') as File;
    // Validate inputs
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' }, 
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image uploaded' }, 
        { status: 400 }
      );
    }

    // Verify product ownership
    const product = await prisma.product.findUnique({
      where: { id: productId.toString() },
      select: { id: true }
    });
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' }, 
        { status: 404 }
      );
    }
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Prepare image for upload
    const imageBuffer = {
      buffer: buffer,
      fileName: file.name,
      contentType: file.type,
      contentLength: file.size,
    };
    // Initialize ProductService
    const productService = new ProductService(s3Config);

    // Upload image
    await productService.addMoreProductImages(
      productId.toString(), 
      Number(lastIndex),
      [imageBuffer]
    );

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    logger.error('Error uploading image:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred while uploading the image. Please try again later.' 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Optionally, add a GET method to handle CORS preflight requests if needed
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}