import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../src/lib/s3";
import { S3Config } from '@repo/s3_database/type';
import logger from '../../../src/utils/logger';

export async function GET(req:NextRequest) {
  try {
    const body = await req.json()
    const {productId} = body;

    // Validate product ID
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // You might need to pass S3 configuration from environment or another source
    
    const s3Config: S3Config = {
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    };

    // Create product service instance
    const productService = new ProductService(s3Config);

    // Retrieve product images using the correct method name
    const images = await productService.getProductImagesWithUrls(productId);

    // Return images
    return NextResponse.json(
      { 
        success: true, 
        images: images 
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error retrieving product images', error);
    return NextResponse.json(
      { success: false, message: "An error occurred while retrieving product images. Please try again later." },
      { status: 500 }
    );
  }
}