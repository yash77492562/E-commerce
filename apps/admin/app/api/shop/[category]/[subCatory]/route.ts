import {NextRequest, NextResponse } from 'next/server';
import { S3Config } from '@repo/s3_database/type';
import { ProductService } from '../../../../../src/lib/s3';
import { getAllCategory } from '../../../../get_all_category/get_all_category';
import logger from '../../../../../src/utils/logger';
interface Context {
  params: Promise<{ category: string; subCategory:string }>;
}
export async function GET(
  request: NextRequest,
  context: Context 
) {
  try {
    // Await the params to extract category and subCategory
    const { category, subCategory } = await context.params;

    // Create S3 configuration
    const s3Config: S3Config = {
      region: process.env.S3_REGION || '',
      endpoint: process.env.S3_ENDPOINT || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || 'default-bucket',
    };

    // Create ProductService instance
    const productService = new ProductService(s3Config);

    // Fetch products with their first image from S3
    const products = await productService.getAllProductsWithFirstImage(
      undefined,
      undefined,
      category,
      subCategory
    );

    // Fetch categories
    const categoryResponse = await getAllCategory();
    if ('message' in categoryResponse) {
      return NextResponse.json(
        { success: false, message: categoryResponse.message },
        { status: 500 }
      );
    }
    const categories = categoryResponse.data;

    return NextResponse.json(
      {
        success: true,
        products: products,
        category: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error retrieving products', error);
    return NextResponse.json(
      {
        success: false,
        message:
          'An error occurred while retrieving products. Please try again later.',
      },
      { status: 500 }
    );
  }
}
