import { NextRequest, NextResponse } from "next/server";
import { check_otp } from "../../checking_otp/check_otp";
import logger from '../../../src/utils/logger';

export async function POST(req: NextRequest) {  
    try {
        const { otp } = await req.json();

        if (!otp) {
            return NextResponse.json(
                { success: false, message: "Please enter the OTP to continue" },
                { status: 400 }
            );
        }

        const check_OTP = await check_otp(otp);

        if (check_OTP === false || !check_OTP.success) {
            return NextResponse.json(
                { success: false, message: "The OTP you entered is incorrect or has expired. Please try again." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: true, message: check_OTP.message },
            { status: 200 }
        );

    } catch (error) {
        logger.error('Error validating OTP:', error);
        return NextResponse.json(
            { success: false, message: "We couldn't verify your OTP. Please try again." },
            { status: 500 }
        );
    }
}
