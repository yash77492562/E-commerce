import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma_database/client";
import logger from '../../../src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { category, productId } = await req.json();

    const categoryProducts = await prisma.product.findMany({
      where: {
        category,
        id: { not: productId }
      },
      select: {
        id: true,
        subCategory: true
      }
    });

    const hasSubCategories = categoryProducts.some(p => p.subCategory !== null);
    
    return NextResponse.json({
      success: true,
      otherProducts: categoryProducts.length,
      hasSubCategories
    });

  } catch (error) {
    logger.error('Error checking category products:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { 
        success: false, 
        message: "Unable to verify category information. Please try again later."
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}