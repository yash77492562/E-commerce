import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma_database/client";

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
    console.error('Error checking category products:', error);
    return NextResponse.json(
      { success: false, message: "Failed to check category products" },
      { status: 500 }
    );
  }
}