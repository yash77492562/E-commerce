import { prisma } from '@repo/prisma_database/client'; // Adjust based on your structure
import { generateSecureTokenWithSalt } from '../token/token';

interface User {
  email?: string;  
  phone?: string;  
}

export const userAuthenticate = async ({ email, phone }: User): Promise<boolean> => {
  try {
    // Validate that either email or phone is provided
    if (!email && !phone) {
      throw new Error('Either email or phone number must be provided.');
    }

    // Prepare the conditions array with valid objects only
    const conditions = [];
    if (email) conditions.push({ email_token: generateSecureTokenWithSalt(email) });
    if (phone) conditions.push({ phone_token: generateSecureTokenWithSalt(phone) });

    // Query Prisma with the valid conditions array
    const userExist = await prisma.token.findFirst({
      where: {
        OR: conditions,  // This now contains only valid objects
      },
    });

    if (userExist) {
      return true;  // User exists, return true
    } else {
      return false
    }
  } catch (error) {
    // Handle and log the error appropriately
    if (error instanceof Error) {
      throw new Error(`Authentication failed: ${error.message}`);
    } else {
      throw new Error('Unexpected error during authentication.');
    }
  }
};
