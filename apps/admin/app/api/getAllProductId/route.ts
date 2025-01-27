import {  NextResponse } from "next/server";
import { prisma } from "@repo/prisma_database/client";
import logger from '../../../src/utils/logger';

export async function GET() {
  try {
    const productId = await prisma.product.findMany({
        select:{
            product_images:{
                select:{
                    product_id:true
                }
            }
        }
    });

    if (!productId || productId.length === 0) {
      return NextResponse.json(
        { success: false, message: "No products found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        data: productId
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Product images fetch error:', { error });
    return NextResponse.json(
      { success: false, message: "Unable to retrieve product information" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}