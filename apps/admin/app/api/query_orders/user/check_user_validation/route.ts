import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { generateSecureTokenWithSalt } from '../../../../token/token';
import logger from '../../../../../src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { field, value } = body

    // Validate that at least one input is provided
    if (!field && !value) {
      return NextResponse.json(
        { success: false, message: 'Please provide either an email or a phone number.' },
        { status: 500 }  // Bad Request
      );
    }


    if (field === 'email') {
        const email_token = generateSecureTokenWithSalt(value)
        const userId  = await prisma.token.findFirst({
            where:{
                email_token
            },
            select:{
                userId:true
            }
        }) 
        if(!userId){
            NextResponse.json(
                { success: false, message: 'Error while fetching your details or Provide vaild email ' },
                { status: 500 }
              );
        }
        return NextResponse.json(
          { success: true, message: 'Successfully get UserId',data:userId },
          { status: 200 }
        );
    } else if(field === 'phone') {
        const phone_token = generateSecureTokenWithSalt(value)
        const userId  = await prisma.token.findFirst({
            where:{
                phone_token
            },
            select:{
                userId:true
            }
        }) 
        if(!userId){
            NextResponse.json(
                { success: false, message: 'Error while fetching your details or Provide vaild email ' },
                { status: 500 }
              );
        }
        return NextResponse.json(
          { success: true, message: 'Successfully get UserId',data:userId },
          { status: 200 }
        );
    }
  } catch (error) {
    logger.error('Error during authentication:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { success: false, message: 'Trouble with the server. Please try again later.' },
      { status: 500 }
    );
  }
}
