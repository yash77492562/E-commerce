// pages/api/admin/orders.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { ProductService } from '../../../src/lib/s3';
import { S3Config } from '@repo/s3_database/type';
import logger from '../../../src/utils/logger';

export async function GET() {
  try {
    // S3 Configuration
    const s3Config: S3Config = {
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string,
    };

    const productService = new ProductService(s3Config);

    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                product_images: {
                  where: { is_main: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        track_change_at: 'desc',
      },
    });

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const enrichedOrderItems = await Promise.all(
          order.orderItems.map(async (item) => {
            if (item.product.product_images.length > 0) {
              const imageUrls = await productService.getProductImagesWithUrls(item.product.id);
              return {
                ...item,
                product: {
                  ...item.product,
                  product_images: imageUrls,
                },
              };
            }
            return item;
          })
        );

        return {
          ...order,
          orderItems: enrichedOrderItems,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: enrichedOrders,
    });
  } catch (error) {
    logger.error('Order retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to fetch orders at this time',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide all required information' 
        },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        order_status: newStatus,
        track_change_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    logger.error('Order status update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to update order status at this time',
      },
      { status: 500 }
    );
  }
}
