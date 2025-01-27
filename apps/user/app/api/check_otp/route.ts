import { NextRequest, NextResponse } from "next/server";
import { check_otp } from "../../checking_otp/check_otp";

export async function POST(req: NextRequest) {  
    try {
        // Parse the incoming JSON body
        const body = await req.json(); 
        const { otp } = body;

        // Validate OTP (check if OTP is provided)
        if (!otp) {
            return NextResponse.json(
                { success: false, message: "OTP is required" },
                { status: 400 }
            );
        }

        const check_OTP = await check_otp(otp);

        // If OTP verification fails
        if (check_OTP === false || !check_OTP.success) {
            return NextResponse.json(
                { success: false, message: check_OTP === false ? "User not found or invalid OTP data" : check_OTP.message },
                { status: 400 }  // 400 for bad request errors like OTP mismatch or expiry
            );
        }

        // OTP is valid
        return NextResponse.json(
            { success: true, message: check_OTP.message },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in OTP validation route:', error);  
        return NextResponse.json(
            { success: false, message: "An unexpected error occurred while checking OTP" },
            { status: 500 }
        );
    }
}          
