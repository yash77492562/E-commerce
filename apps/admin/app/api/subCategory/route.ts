import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma_database/client";
import logger from '../../../src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { category, productId } = await req.json();

    // Get all products in this category
    const allProducts = await prisma.product.findMany({
      where: {
        category
      },
      select: {
        id: true,
        subCategory: true
      }
    });

    const otherProducts = allProducts.filter(p => p.id !== productId);
    
    // Get products with null subcategories in same category
    const productsWithNullSubCategory = otherProducts.filter(p => p.subCategory === null);
    
    // Get unique existing subcategories (excluding null)
    const uniqueSubCategories = Array.from(
      new Set(allProducts.map(p => p.subCategory).filter(Boolean))
    );

    // Determine subcategory management rules
    const isSingleProduct = allProducts.length === 1;
    const hasSubCategories = uniqueSubCategories.length > 0;
    const hasNullSubCategories = productsWithNullSubCategory.length > 0;
    
    const response = {
      success: true,
      search_products: allProducts,
      canSetNull: isSingleProduct || !hasSubCategories,
      requiresConfirmation: hasNullSubCategories,
      nullSubCategoryCount: productsWithNullSubCategory.length,
      message: "",
      statistics: {
        totalProducts: allProducts.length,
        uniqueSubCategories,
        hasSubCategories,
        productsWithNullSubCategory: productsWithNullSubCategory.length
      }
    };

    // Set message based on conditions
    if (hasNullSubCategories) {
      response.message = `Adding this subcategory will set 'default' as subcategory for ${productsWithNullSubCategory.length} product(s) without subcategories in this category. Products with existing subcategories will not be affected.`;
    }

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Error retrieving subCategory information:', error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while retrieving subcategory information. Please try again later." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}