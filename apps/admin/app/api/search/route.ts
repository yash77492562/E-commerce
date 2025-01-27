import { NextRequest , NextResponse } from "next/server";
import { S3Config } from '@repo/s3_database/type';
import { ProductService } from "../../../src/lib/s3";
import logger from '../../../src/utils/logger';

export async function POST(req:NextRequest) {
  try {
    const body = await req.json()
    const {query} = body;

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
    const products = await productService.getAllProductsWithFirstImage(undefined,query);
    
    return NextResponse.json(
      { 
        success: true, 
        search_products: products 
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