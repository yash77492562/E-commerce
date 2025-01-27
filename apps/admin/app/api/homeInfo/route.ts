import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../src/utils/logger';

export async function GET() {
  try {
    const homeInfo = await prisma.homeInfo.findFirst()
    if(!homeInfo){
        return NextResponse.json({
            message: 'No home information available at the moment',
            success: false
        }, { status: 404 })
    }
    return NextResponse.json({ 
      message: 'Home information retrieved successfully', 
      success: true,
      homeInfo 
    }, { status: 200 });

  } catch (error) {
    logger.error('Home info fetch error:', { error });
    return NextResponse.json({ 
      message: 'Unable to retrieve home information', 
      success: false
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();  
    const { 
      id,
      heading,
      para
    } = body;

    const updatedContact = await prisma.homeInfo.update({
      where: { id },
      data: {
        ...(heading && { heading }),
        ...(para && { para })
      }
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    logger.error('Home info update error:', { error });
    return NextResponse.json({ 
      message: 'Unable to update home information',
      success: false 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}