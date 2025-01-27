import { NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../../src/utils/logger';

export async function GET() {
  try {
    const totalHomeImages = await prisma.homeImage.count();
    
    return NextResponse.json({ 
      limitReached: totalHomeImages >= 6 
    }, { status: 200 });
  } catch (error) {
    logger.error('Home image limit check error:', error);
    
    return NextResponse.json({ 
      message: 'Unable to process your request at this time', 
      limitReached: false 
    }, { status: 500 });
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}