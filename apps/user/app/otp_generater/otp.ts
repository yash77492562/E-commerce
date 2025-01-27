// otp.ts
import crypto from 'crypto';

export const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
};