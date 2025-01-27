// Import the PrismaClient class from the generated Prisma client
import { PrismaClient } from '@prisma/client';

// Create a function that returns a new instance of PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};
// Declare global variables to store the PrismaClient instances
declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Initialize the Prisma instance or use the existing one if already initialized
const prisma: ReturnType<typeof prismaClientSingleton> =
  globalThis.prismaGlobal ?? prismaClientSingleton();

// If not in production, set the global variable to store the Prisma instances
// This prevents creating multiple instances in development mode, where hot-reloading can cause issues.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Export the Prisma instances for use in other parts of the app
export { prisma };


