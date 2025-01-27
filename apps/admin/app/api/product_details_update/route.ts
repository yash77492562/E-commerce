import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { productUpdateSchema } from '@repo/zod/client';
import { generateUniqueSlug } from '../../../src/utils/slug';
import logger from '../../../src/utils/logger';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { success: false, message: 'No update data provided' },
        { status: 400 }
      );
    }

    const validationResult = productUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      id,
      title,
      description,
      price,
      discount_rate,
      discount,
      discountLessValue,
      subCategory,
      updateDefaultSubCategory,
      tags,
      category,
    } = body;

    let newSlug = undefined;
    if (title !== undefined) {
      newSlug = await generateUniqueSlug(title);
    }

    // Define the type for updates object
    type UpdateData = {
      title?: string;
      description?: string;
      price?: number;
      discount_rate?: number;
      discount?: number;
      discountLessValue?: number;
      tags?: string[];
      category?: string;
      subCategory?: string | null;
      slug?: string;
    };

    // Initialize updates with proper typing
    const updates: UpdateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(discount_rate !== undefined && { discount_rate: Number(discount_rate) }),
      ...(discount !== undefined && { discount: Number(discount) }),
      ...(discountLessValue !== undefined && { discountLessValue: Number(discountLessValue) }),
      ...(tags !== undefined && { tags }),
      ...(category !== undefined && { category }),
      ...(newSlug && { slug: newSlug }),
    };

    // Handle subcategory updates
    if (subCategory !== undefined) {
      // Check if trying to set null/empty subcategory
      if (subCategory === null || subCategory === '') {
        // Get all products in the category
        const categoryProducts = await prisma.product.findMany({
          where: { category: category }
        });

        // Count products with different subcategory types
        const defaultSubCategoryProducts = categoryProducts.filter(p => p.subCategory === 'default');
        const nonDefaultProducts = categoryProducts.filter(p => p.subCategory && p.subCategory !== 'default');
        
        // Check if we have exactly two types of subcategories (default and one other)
        const uniqueSubCategories = new Set(categoryProducts.map(p => p.subCategory));
        const hasOnlyTwoTypes = uniqueSubCategories.size === 2 && defaultSubCategoryProducts.length > 0;

        // Check if the non-default subcategory has only one product and it's the current product
        const canSetNull = hasOnlyTwoTypes && 
                          nonDefaultProducts.length === 1 && 
                          nonDefaultProducts[0]?.id === id;

        if (canSetNull) {
          // Update all products in the category to have null subcategory
          await prisma.product.updateMany({
            where: { category: category },
            data: { subCategory: null }
          });
          updates.subCategory = null;
        } else {
          // Log the error before returning the response
          logger.error('Cannot remove subcategory in current category configuration', { category, id });
          return NextResponse.json({
            success: false,
            message: "Cannot remove subcategory in current category configuration"
          }, { status: 400 });
        }
      } else {
        // Handle normal subcategory updates
        updates.subCategory = subCategory;
        
        // Update products with null subcategory to 'default' if specified
        if (updateDefaultSubCategory) {
          await prisma.product.updateMany({
            where: {
              category: category,
              subCategory: null,
              id: { not: id }
            },
            data: {
              subCategory: 'default'
            }
          });
        }
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    logger.error('Product update error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update product. Please try again later.',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}