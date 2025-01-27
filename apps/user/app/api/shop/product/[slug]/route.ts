import {NextRequest, NextResponse } from "next/server";
import { S3Config } from '@repo/s3_database/type';
import { ProductService } from "../../../../../src/lib/s3";
import { prisma } from '@repo/prisma_database/client';

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { slug } = await context.params;  // No changes needed here

    const s3Config: S3Config = {
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    };

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { product_images: true }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    const productService = new ProductService(s3Config);
    const productImages = await productService.getProductImagesWithUrls(product.id);
    return NextResponse.json({
      success: true,
      product: {
        ...product,
        product_images: productImages.map(img => ({
          index:img.index || 0,
          id:img.id || '',
          image_url: img.url || '',
          image_key:img.key || '',
          is_main: img.isMain || false
        }))
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: "Failed to retrieve product" }, { status: 500 });
  }
}
