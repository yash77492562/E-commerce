import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../../src/lib/s3";
import { prisma } from '@repo/prisma_database/client';
import { S3Config } from '@repo/s3_database/type';
import logger from '../../../../src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchType, searchQuery } = body;

    let orders;
    let totalOrderCount = 0;
    let singleOrder = null;

    switch(searchType) {
      case 'phone_no':
        orders = await prisma.order.findMany({
          where: { phone: searchQuery },
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
            uploaded_at: 'desc'
          }
        });
        totalOrderCount = orders.length;
        break;

      case 'order_id':
        singleOrder = await prisma.order.findUnique({
          where: { id: searchQuery },
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
          }
        });
        break;

      case 'transaction_id':
        singleOrder = await prisma.order.findUnique({
          where: { transactionId: searchQuery },
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
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid search type" },
          { status: 400 }
        );
    }

    // S3 Configuration
    const s3Config: S3Config = {
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    };

    const productService = new ProductService(s3Config);

    // Enrich orders or single order with images
    if (orders) {
      const enrichedOrders = await Promise.all(orders.map(async (order) => {
        const enrichedOrderItems = await Promise.all(order.orderItems.map(async (item) => {
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
          orders: enrichedOrders,
          latestOrder: enrichedOrders[0] || null,
          totalOrderCount
        },
        { status: 200 }
      );
    }

    // For single order (order_id or transaction_id)
    if (singleOrder) {
      const enrichedOrderItems = await Promise.all(singleOrder.orderItems.map(async (item) => {
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

      const enrichedOrder = {
        ...singleOrder,
        orderItems: enrichedOrderItems
      };

      return NextResponse.json(
        { 
          success: true, 
          order: enrichedOrder 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "No orders found" 
      },
      { status: 404 }
    );

  } catch (error) {
    logger.error('Error retrieving orders', error);
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

// Add a new route for autocomplete suggestions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type');

    if (!query || !type) {
      return NextResponse.json(
        { success: false, message: "Missing query or type" },
        { status: 400 }
      );
    }

    let results: string[] = [];

    switch(type) {
      case 'order_id':
        results = await prisma.order.findMany({
          where: {
            id: {
              contains: query
            }
          },
          take: 5,
          select: {
            id: true
          }
        }).then(orders => orders.map(order => order.id));
        break;

      case 'transaction_id':
        results = await prisma.order.findMany({
          where: {
            transactionId: {
              contains: query
            }
          },
          take: 5,
          select: {
            transactionId: true
          }
        }).then(orders => orders.map(order => order.transactionId));
        break;
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    logger.error('Error retrieving autocomplete suggestions', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to retrieve suggestions. Please try again later." 
      },
      { status: 500 }
    );
  }
}