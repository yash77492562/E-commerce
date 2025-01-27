import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../src/utils/logger';

export async function GET() {
  try {
    const footer = await prisma.footer.findFirst()
    if(!footer){
        return NextResponse.json({
            error:'No Data present in the database',
            success:false
        },{status:500}
        )
    }
    return NextResponse.json({ 
      message: 'footer content uploaded successfully', 
      success:true,
      footer 
    }, { status: 200 });

  } catch (error) {
    logger.error('Footer fetch error:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      error: 'Unable to load contact information. Please try again later.',
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
      companyName,
      address,
      phone,
      open,
      close,
      email 
    } = body;

    const updatedContact = await prisma.footer.update({
      where: { id },
      data: {
        ...(address && { address }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(companyName && { companyName }),
        ...(open && { open }),
        ...(close && { close })
      }
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    logger.error('Error updating footer:', error);
    await prisma.$disconnect();
    return NextResponse.json({ 
      success: false,
      message: 'Unable to update contact details. Please try again later.'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}