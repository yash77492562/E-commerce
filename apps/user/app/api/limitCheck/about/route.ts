import { NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';

export async function GET() {
  try {
    // Check if About content exists
    const existingAbout = await prisma.about.findFirst();
    
    return NextResponse.json({ 
      limitReached: !!existingAbout 
    }, { status: 200 });
  } catch (error) {
    console.error('About content limit check error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to check about content limit', 
      limitReached: false 
    }, { status: 500 });
  } finally {
    // Ensure Prisma client is disconnected
    await prisma.$disconnect();
  }
}