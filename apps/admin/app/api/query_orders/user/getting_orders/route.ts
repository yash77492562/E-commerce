import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../../../src/lib/s3";
import { prisma } from '@repo/prisma_database/client';
import { S3Config } from '@repo/s3_database/type';
import logger from '../../../../../src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {userId} = body;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Server Error while fetching your order" },
        { status: 401 }
      );
    }

    // S3 Configuration (ensure these are set in your .env)
    const s3Config: S3Config = {
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    };

    const productService = new ProductService(s3Config);

    // Fetch orders with their items and associated products
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                product_images: {
                  where: { is_main: true },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: {
        // Sort by most recent order first
        uploaded_at: 'desc'
      }
    });

    // Enhance orders with product images
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const enrichedOrderItems = await Promise.all(order.orderItems.map(async (item) => {
        // Get signed URLs for product images
        if (item.product.product_images.length > 0) {
          const imageUrls = await productService.getProductImagesWithUrls(item.product.id);
          return {
            ...item,
            product: {
              ...item.product,
              product_images: imageUrls
            }
          };
        }
        return item;
      }));

      return {
        ...order,
        orderItems: enrichedOrderItems
      };
    }));

    return NextResponse.json(
      { 
        success: true, 
        orders: enrichedOrders 
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error retrieving user orders', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to retrieve orders. Please try again later." 
      },
      { status: 500 }
    );
  }
}