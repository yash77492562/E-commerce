import { NextRequest, NextResponse } from 'next/server';
import { userAuthenticate } from '../../userAuthenticate/userAuthenticate';
import logger from '../../../src/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { email, phone } = await req.json();

    // Validate that at least one input is provided
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: 'Please provide either an email or a phone number.' },
        { status: 400 }  // Bad Request
      );
    }

    // Await the asynchronous user authentication function
    const userExists = await userAuthenticate({ email, phone });

    if (userExists) {
      return NextResponse.json(
        { success: true, message: 'Welcome, enjoy yourself here!' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'User does not exist for the provided credentials.' },
        { status: 404 }  // Not Found
      );
    }
  } catch (error) {
    logger.error('Error during authentication:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during authentication. Please try again later.' },
      { status: 500 }
    );
  }
}
