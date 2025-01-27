import { NextRequest, NextResponse } from "next/server";
import { S3Config } from '@repo/s3_database/type';
import { ProductService } from "../../../src/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tags , id } = body;
    // Create S3 configuration (adjust according to your MinIO setup)
    const s3Config: S3Config = {
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    };

    // Create ProductService instance
    const productService = new ProductService(s3Config);

    // Fetch recommended products based on tags
    const products = await productService.getRecommendedProducts(tags , id);
    
    return NextResponse.json(
      { 
        success: true, 
        recommended_products: products 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error retrieving recommended products', error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve recommended products" },
      { status: 500 }
    );
  }
}