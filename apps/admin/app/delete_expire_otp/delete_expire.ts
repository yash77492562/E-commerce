import { prisma } from "@repo/prisma_database/client";
import cron from 'node-cron';

// Weekly cleanup of OTPs every Sunday at midnight
export const setupWeeklyOTPCleanup = () => {
    cron.schedule('0 0 * * 0', async () => {
        try {
            await prisma.password_otp.deleteMany({
                where: {
                    expires_at: {
                        lt: new Date() // Delete entries older than current time
                    }
                }
            });

        } catch (error) {
            console.error('Weekly OTP cleanup failed:', error);
        }
    });
};

// Call this function when your application starts
setupWeeklyOTPCleanup();