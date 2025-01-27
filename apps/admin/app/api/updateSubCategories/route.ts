import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../src/utils/logger';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, newSubCategory, searchProducts } = body;

    if (!category || !newSubCategory || !searchProducts) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update products with null subcategory to 'default'
    const productIds = searchProducts.map((product: { id: string }) => product.id);
    
    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          category: category,
          subCategory: null
        },
        data: {
          subCategory: 'default'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'SubCategories updated successfully'
    });

  } catch (error) {
    logger.error('SubCategory update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while updating subcategories. Please try again later.',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}