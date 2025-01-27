
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';

export async function GET() {
  try {
    const contact = await prisma.contact.findFirst()
    if(!contact){
        return NextResponse.json({
            error:'No Data present in the database',
            success:false
        },{status:500}
        )
    }
    return NextResponse.json({ 
      message: 'About content uploaded successfully', 
      success:true,
      contact 
    }, { status: 200 });

  } catch (error) {
    console.error('Detailed about contact error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to get contact content', 
      details: error instanceof Error 
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          } 
        : { message: 'Unknown error occurred' }
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
    console.error('Error updating contact details:', error);
    return NextResponse.json({ error: 'Failed to update contact details' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}