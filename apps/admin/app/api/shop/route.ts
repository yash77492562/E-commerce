// app/api/products/route.ts
import { NextResponse } from "next/server";
import { S3Config } from '@repo/s3_database/type';
import { ProductService } from "../../../src/lib/s3";
import logger from '../../../src/utils/logger';

export async function GET() {
  try {
    // Create S3 configuration (adjust according to your MinIO setup)
    const s3Config: S3Config = {
      region:process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    };
    // Create ProductService instance
    const productService = new ProductService(s3Config);

    // Fetch products with their first image from S3
    const products = await productService.getAllProductsWithFirstImage();
    return NextResponse.json(
      { 
        success: true, 
        products: products 
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error retrieving products', error);
    return NextResponse.json(
      { success: false, message: "An error occurred while retrieving products. Please try again later." },
      { status: 500 }
    );
  } 
}