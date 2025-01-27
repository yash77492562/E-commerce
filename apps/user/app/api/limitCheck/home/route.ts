import { NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';

export async function GET() {
  try {
    // Check total home images 
    const totalHomeImages = await prisma.homeImage.count();
    
    return NextResponse.json({ 
      limitReached: totalHomeImages >= 6 
    }, { status: 200 });
  } catch (error) {
    console.error('Home image limit check error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to check home image limit', 
      limitReached: false 
    }, { status: 500 });
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}