import { prisma } from "@repo/prisma_database/client";
import * as argon2 from "argon2";
import { getUserId } from "../userId/userID";

interface CheckOtpResult {
    success: boolean;
    message: string;
}

export const check_otp = async (otp: string): Promise<CheckOtpResult | false> => {
    try {
        const adminId = await getUserId();
        if (!adminId) {
            return false;  // Return `false` for an invalid user
        }

        // Get the latest OTP entry for the user
        const latestOtp = await prisma.password_otp.findFirst({
            where: {
                adminId
            },
            orderBy: {
                created_at: 'desc'  // Order by creation date descending (newest first)
            },
            select: {
                id: true,
                otp: true,
                created_at: true,
                expires_at: true
            }
        });

        if (!latestOtp) {
            return { success: false, message: "No OTP found for the user" };
        }

        // Check if OTP has expired
        if (latestOtp.expires_at < new Date()) {
            // Optionally, clean up expired OTP
            await prisma.password_otp.delete({
                where: {
                    id: latestOtp.id
                }
            });
            return { success: false, message: "OTP has expired" };
        }

        // Verify the OTP
        const isValidOtp = await argon2.verify(latestOtp.otp, otp);
        if (!isValidOtp) {
            return { success: false, message: "Invalid OTP" };
        }

        // Clean up all OTP entries for this user after successful verification
        await prisma.password_otp.deleteMany({
            where: {
                adminId
            }
        });

        return { success: true, message: "OTP is valid" };

    } catch (error) {
        console.error('Error while verifying OTP:', error);
        return { success: false, message: "Error occurred while checking OTP" };
    }
};
