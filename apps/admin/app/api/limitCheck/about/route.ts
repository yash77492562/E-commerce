import { NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../../src/utils/logger';

export async function GET() {
  try {
    const existingAbout = await prisma.about.findFirst();
    
    return NextResponse.json({ 
      limitReached: !!existingAbout 
    }, { status: 200 });
  } catch (error) {
    logger.error('Error checking about content limit:', error);
    
    return NextResponse.json({ 
      message: 'Unable to process your request. Please try again later.', 
      limitReached: false 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}