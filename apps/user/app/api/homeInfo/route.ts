
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';

export async function GET() {
  try {
    const homeInfo = await prisma.homeInfo.findFirst()
    if(!homeInfo){
        return NextResponse.json({
            error:'No Data present in the database',
            success:false
        },{status:500}
        )
    }
    return NextResponse.json({ 
      message: 'home content get successfully', 
      success:true,
      homeInfo 
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
    console.error('Error updating contact details:', error);
    return NextResponse.json({ error: 'Failed to update contact details' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}