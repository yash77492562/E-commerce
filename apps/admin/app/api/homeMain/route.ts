import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../src/utils/logger';

export async function GET() {
  try {
    const homeMain = await prisma.homeMain.findFirst()
    if(!homeMain){
        return NextResponse.json({
            message: 'No content available',
            success: false
        }, { status: 404 });
    }
    return NextResponse.json({ 
      message: 'Home content uploaded successfully', 
      success:true,
      homeMain 
    }, { status: 200 });

  } catch (error) {
    logger.error('Home main content fetch error:', error);
    
    return NextResponse.json({ 
      message: 'Unable to fetch content at this time', 
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
      first_para,
      second_para,
      third_para
    } = body;

    if (!id) {
      return NextResponse.json({ 
        message: 'Missing required information', 
        success: false 
      }, { status: 400 });
    }

    const updatedContact = await prisma.homeMain.update({
      where: { id },
      data: {
        ...(heading !== undefined && { heading }),
        ...(first_para !== undefined && { first_para }),
        ...(second_para !== undefined && { second_para }),
        ...(third_para !== undefined && { third_para })
      }
    });

    return NextResponse.json({ 
      message: 'Home content updated successfully',
      success: true,
      data: updatedContact 
    }, { status: 200 });

  } catch (error) {
    logger.error('Home main content update error:', error);
    return NextResponse.json({ 
      message: 'Unable to update content at this time',
      success: false
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}