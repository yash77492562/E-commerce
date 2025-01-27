import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "../../userId/userID";
import { prisma } from "@repo/prisma_database/client";
import { decrypt } from "@repo/encrypt/client";
import { generateOTP } from "../../otp_generater/otp";
import { OTP_Create } from "../../database_create/otp_create";
import { sendOTPEmail } from "../../sending_email/sending_email";
import logger from '../../../src/utils/logger';

export async function POST(req: NextRequest) {  // Remove res parameter as it's not needed
    try {
        const body = await req.json();  // Change res.json() to req.json()
        const { email } = body;
        
        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 500 }
            );
        }

        const adminId = await getUserId();
        if (!adminId) {
            return NextResponse.json(
                { success: false, message: "User not found or login and try again" },
                { status: 401 }  // Changed to 401 for unauthorized
            );
        }

        const admin = await prisma.admin.findUnique({
            where:{
                id: adminId
            }
        });

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Error while connecting to database" },
                { status: 500 }  // Changed to 404 for not found
            );
        }

        const decryptedEmail = decrypt(admin.email);
        
        if (decryptedEmail === email) {
            const otp = generateOTP()
            if(otp){
                const send_email = await sendOTPEmail(email,otp)
                if(send_email){
                    const otp_create = await OTP_Create({otp,adminId})
                    if(otp_create){
                        return NextResponse.json(
                            { success: true, message: "OTP sent successfully" },
                            { status: 200 }
                        );
                    }else{
                        return NextResponse.json({success:false,message:"Error while sending your otp"},{status:500})
                    }
                }else{
                    return NextResponse.json({success:false,message:"Error while sending your otp"},{status:500})
                }
            }else{
                return NextResponse.json({success:false,message:"Error while sending your otp"},{status:500})
            }
        } else {
            return NextResponse.json(
                { success: false, message: "Please enter registered email only" },
                { status: 400 }  // Added status code
            );
        }

    } catch (error) {
        logger.error('Error in email validation:', error);
        return NextResponse.json(
            { success: false, message: "An error occurred while processing your request. Please try again later." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}