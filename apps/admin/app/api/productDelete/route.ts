import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { S3Service } from '@repo/s3_database/client';
import { S3Config } from '@repo/s3_database/type';
import logger from '../../../src/utils/logger';

// Custom error class for more detailed error handling
class ProductDeletionError extends Error {
  constructor(
    public message: string, 
    public errorType: 'VALIDATION' | 'CART_RELATIONSHIP' | 'ORDER_RELATIONSHIP' | 'S3_ERROR' | 'DATABASE_ERROR'
  ) {
    super(message);
    this.name = 'ProductDeletionError';
    Object.defineProperty(this, 'errorType', {
      enumerable: true,
      value: errorType
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      throw new ProductDeletionError('Product ID is required', 'VALIDATION');
    }

    // Check relationships first
    await handleCartRelationships(productId);
    await checkOrderRelationships(productId);
    await deleteProductImages(productId);
    await deleteRelatedRecords(productId); // This will now handle subcategory reset

    return NextResponse.json({ 
      success: true, 
      message: 'Product and all related records deleted successfully' 
    });

  } catch (error) {
    logger.error('Product deletion error:', error);
    await prisma.$disconnect();
    return handleErrorResponse(error);
  }
}

// Separate function to handle cart relationships
async function handleCartRelationships(productId: string) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const cartRelationships = await prisma.cart.findMany({
    where: { productId },
    include: { user: true }
  });

  const staleCartRelationships = cartRelationships.filter(cart => 
    new Date(cart.uploaded_at) < oneMonthAgo
  );

  if (staleCartRelationships.length > 0) {
    await prisma.cart.deleteMany({
      where: { 
        id: { 
          in: staleCartRelationships.map(cart => cart.id) 
        } 
      }
    });
  }
}

// Separate function to check order relationships
async function checkOrderRelationships(productId: string) {
  const mostRecentOrder = await findMostRecentOrderRelationship(productId);

  if (mostRecentOrder) {
    // Prevent deletion if order is processing or out for delivery
    if (
      mostRecentOrder.order_status === 'processing' || 
      mostRecentOrder.order_status === 'out_for_delivery'
    ) {
      throw new ProductDeletionError(
        'Cannot delete product. Recent order is in processing or out for delivery.', 
        'ORDER_RELATIONSHIP'
      );
    }

    // Check delivered order age
    if (mostRecentOrder.order_status === 'delivered') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      if (new Date(mostRecentOrder.track_change_at) > oneMonthAgo) {
        throw new ProductDeletionError(
          'Cannot delete product. Delivered order is less than a month old.', 
          'ORDER_RELATIONSHIP'
        );
      }
    }
  }
}

// Function to find the most recent order relationship
async function findMostRecentOrderRelationship(productId: string) {
  const orderItemRelationships = await prisma.orderItem.findMany({
    where: { productId },
    include: { order: true },
    orderBy: { order: { uploaded_at: 'desc' } },
    take: 1
  });

  return orderItemRelationships.length > 0 ? orderItemRelationships[0]?.order : null;
}

// Function to delete product images from S3
async function deleteProductImages(productId: string) {
  // Initialize S3 service
  const s3Config: S3Config = {
    region: process.env.S3_REGION || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET || 'default-bucket',
    endpoint: process.env.S3_ENDPOINT
  };
  const s3Service = new S3Service(s3Config);

  // Find and delete product images from S3
  const productImages = await prisma.productImage.findMany({
    where: { product_id: productId },
    select: { image_key: true }
  });

  if (productImages.length > 0) {
    const imageKeys = productImages.map(img => img.image_key);
    try {
      await s3Service.deleteProductImages(imageKeys);
    } catch (error) {
      throw new ProductDeletionError(
        'Failed to delete product images from S3', 
        'S3_ERROR'
      );
    }
  }
}

// Modified function to delete related database records
async function deleteRelatedRecords(productId: string) {
  try {
    // First get the product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        category: true,
        subCategory: true
      }
    });

    if (!product) {
      throw new ProductDeletionError('Product not found', 'DATABASE_ERROR');
    }

    // Start a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (prisma) => {
      // Check and handle subcategory reset if needed
      if (product.category && product.subCategory) {
        const categoryProducts = await prisma.product.findMany({
          where: { category: product.category }
        });

        const defaultSubCategoryProducts = categoryProducts.filter(p => p.subCategory === 'default');
        const nonDefaultProducts = categoryProducts.filter(p => p.subCategory && p.subCategory !== 'default');
        const uniqueSubCategories = new Set(categoryProducts.map(p => p.subCategory));
        const hasOnlyTwoTypes = uniqueSubCategories.size === 2 && defaultSubCategoryProducts.length > 0;

        const shouldResetSubCategories = hasOnlyTwoTypes && 
                                       nonDefaultProducts.length === 1 && 
                                       nonDefaultProducts[0]?.id === productId;

        if (shouldResetSubCategories) {
          // Reset subcategories within the transaction
          await prisma.product.updateMany({
            where: { category: product.category },
            data: { subCategory: null }
          });
        }
      }

      // Delete related records within the same transaction
      await prisma.cart.deleteMany({
        where: { productId }
      });

      await prisma.orderItem.deleteMany({
        where: { productId }
      });

      // Finally delete the product
      await prisma.product.delete({
        where: { id: productId }
      });
    });

  } catch (error) {
    throw new ProductDeletionError(
      'Failed to delete product and related records', 
      'DATABASE_ERROR'
    );
  }
}

// Centralized error handling function
function handleErrorResponse(error: unknown) {
  logger.error('Product deletion error:', error);

  if (error instanceof ProductDeletionError) {
    return NextResponse.json({ 
      success: false, 
      message: error.message,
      errorType: error.errorType
    }, { status: getStatusCodeForErrorType(error.errorType) });
  }

  // Fallback for unexpected errors
  return NextResponse.json({ 
    success: false, 
    message: 'An unexpected error occurred during product deletion. Please try again later.',
    errorType: 'UNKNOWN_ERROR'
  }, { status: 500 });
}

// Helper function to map error types to appropriate HTTP status codes
function getStatusCodeForErrorType(errorType: string): number {
  switch (errorType) {
    case 'VALIDATION':
      return 400;
    case 'CART_RELATIONSHIP':
    case 'ORDER_RELATIONSHIP':
      return 409; // Conflict
    case 'S3_ERROR':
    case 'DATABASE_ERROR':
      return 500;
    default:
      return 500;
  }
}