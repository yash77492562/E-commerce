
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';

export async function GET() {
  try {
    const homeMain = await prisma.homeMain.findFirst()
    if(!homeMain){
        return NextResponse.json({
            error:'No Data present in the database',
            success:false
        },{status:500}
        )
    }
    return NextResponse.json({ 
      message: 'Home content uploaded successfully', 
      success:true,
      homeMain 
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
      first_para,
      second_para,
      third_para
    } = body;

    const updatedContact = await prisma.homeMain.update({
      where: { id },
      data: {
        ...(heading && { heading }),
        ...(first_para && { first_para }),
        ...(second_para && { second_para }),
        ...(third_para && { third_para })
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