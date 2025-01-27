import { prisma } from '@repo/prisma_database/client';
import { NextRequest, NextResponse } from 'next/server';
import logger from '../../../src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { searchTerm } = await req.json();

    if (!searchTerm) {
      return NextResponse.json({ suggestions: [] });
    }

    // Split search term into words
    const searchWords = searchTerm.toLowerCase().split(' ');

    // Get all categories
    const categories = await prisma.product.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    // Filter categories that match any of the search words
    const matchedCategories = categories.filter(item => {
      const categoryLower = item.category ? item.category.toLowerCase() : '';
      return searchWords.every((word: string) => categoryLower.includes(word));
    });

    // Sort by relevance (exact matches first, then partial matches)
    const sortedCategories = matchedCategories.sort((a, b) => {
      const aLower = a.category ? a.category.toLowerCase() : '';
      const bLower = b.category ? b.category.toLowerCase() : '';
      
      // Exact match gets highest priority
      if (aLower === searchTerm.toLowerCase()) return -1;
      if (bLower === searchTerm.toLowerCase()) return 1;
      
      // Then check if it starts with the search term
      const aStarts = aLower.startsWith(searchTerm.toLowerCase());
      const bStarts = bLower.startsWith(searchTerm.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return aLower.localeCompare(bLower);
    });

    const suggestions = sortedCategories.map(item => item.category).slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch (error) {
    logger.error('Category suggestion error:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { 
        success: false,
        message: 'Unable to fetch suggestions. Please try again later.',
        suggestions: []
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}