import { NextRequest, NextResponse } from "next/server";
import { S3Config } from '@repo/s3_database/type';
import { ProductService } from "../../../../../src/lib/s3";
import { getAllCategory } from "../../../../get_all_category/get_all_category";
interface Context {
  params: Promise<{ subCatory:string }>;
}
export async function GET(
  request: NextRequest,
  context: Context
) {
    try {
      // Destructure the category array from params
      const {  subCatory } = await context.params;   
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
    // Fetch products with their first image from S3
    const products = await productService.getAllProductsWithFirstImage(undefined, undefined, undefined, subCatory)
   
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
        category: categories
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error retrieving products', error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve products" },
      { status: 500 }
    );
  }
}