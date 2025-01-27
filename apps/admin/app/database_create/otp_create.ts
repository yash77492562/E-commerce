import { prisma } from "@repo/prisma_database/client"
import * as argon2 from "argon2";

interface OtpProps{
    otp:string
    adminId:string
}
export const OTP_Create = async ({otp, adminId}: OtpProps) => {
    const hashedOtp = await argon2.hash(otp, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4
    });
    // Set expiration to 2 minutes from now
    const expires_at = new Date(Date.now() + 2 * 60 * 1000);

    const otp_model = await prisma.password_otp.create({
        data: {
            otp:hashedOtp,
            adminId,
            expires_at
        }
    });

    return otp_model;
};