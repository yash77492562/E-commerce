import slugify from 'slugify';
import { prisma } from '@repo/prisma_database/client'; // Adjust import path as needed

export interface SlugOptions {
  lower?: boolean;
  strict?: boolean;
  trim?: boolean;
  maxLength?: number;
}

export function createBaseSlug(
  input: string, 
  options: SlugOptions = {}
): string {
  // Default options
  const defaultOptions: SlugOptions = {
    lower: true,
    strict: true,
    trim: true,
    maxLength: 100
  };

  // Merge provided options with defaults
  const finalOptions = { ...defaultOptions, ...options };

  // Generate slug using slugify
  const slug = slugify(input, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: finalOptions.lower,
    strict: finalOptions.strict,
    trim: finalOptions.trim
  });

  // Truncate to max length
  return finalOptions.maxLength 
    ? slug.substring(0, finalOptions.maxLength) 
    : slug;
}

// Function to check if slug exists in database
export async function checkSlugExists(
  slug: string, 
  excludeId?: string
): Promise<boolean> {
  const existingProduct = await prisma.product.findFirst({
    where: {
      slug,
      ...(excludeId && { NOT: { id: excludeId } })
    },
    select: { id: true }
  });

  return !!existingProduct;
}

// Function to generate a unique slug
export async function generateUniqueSlug(
  input: string, 
  excludeId?: string
): Promise<string> {
  // Create base slug
  const baseSlug = createBaseSlug(input);
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Check and modify slug if it already exists
  while (await checkSlugExists(uniqueSlug, excludeId)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

// Slug validation function
export function isValidSlug(slug: string): boolean {
  // Regular expression for valid slug
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}