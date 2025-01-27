import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import logger from '../../../src/utils/logger';

export async function GET() {
  try {
    const contact = await prisma.contact.findFirst()
    if(!contact){
        return NextResponse.json({
            message: 'Contact information not available',
            success: false
        }, { status: 404 })
    }
    return NextResponse.json({ 
      message: 'Contact information retrieved successfully', 
      success: true,
      contact 
    }, { status: 200 });

  } catch (error) {
    logger.error('Contact fetch error:', { error });
    return NextResponse.json({ 
      message: 'Unable to retrieve contact information',
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
      address_main, 
      address_city, 
      email, 
      phone_main,
      phone_second,
      sunday, 
      monday, 
      tuesday,
      wednesday, 
      thrusday,
      friday,
      saturday 
    } = body;

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        ...(address_main && { address_main }),
        ...(address_city && { address_city }),
        ...(email && { email }),
        ...(phone_main && { phone_main }),
        ...(phone_second && { phone_second }),
        ...(sunday && { sunday }),
        ...(monday && { monday }),
        ...(tuesday && { tuesday }),
        ...(wednesday && { wednesday }),
        ...(thrusday && { thrusday }),
        ...(friday && { friday }),
        ...(saturday && { saturday }),
      }
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    logger.error('Contact update error:', { error });
    return NextResponse.json({ 
      message: 'Unable to update contact information',
      success: false 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}