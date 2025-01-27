import { NextRequest, NextResponse } from 'next/server';
import { userAuthenticate } from '../../userAuthenticate/userAuthenticate';

export async function POST(req: NextRequest) {
  try {
    const { email, phone } = await req.json();

    // Validate that at least one input is provided
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: 'Please provide either an email or a phone number.' },
        { status: 500 }  // Bad Request
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
        { status: 500 }  // Not Found
      );
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json(
      { success: false, message: 'Trouble with the server. Please try again later.' },
      { status: 500 }
    );
  }
}
