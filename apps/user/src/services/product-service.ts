// import { prisma } from '@repo/prisma_database/client';
// import { generateUniqueSlug } from '../utils/slug';

// // Interface for product creation
// interface ProductCreateInput {
//   title: string;
//   description: string;
//   price: number;
//   // Add other necessary fields
//   product_images?: {
//     create: {
//       image_url: string;
//       is_main?: boolean;
//     }[]
//   }
// }

// export async function createProductWithSlug(
//   productData: ProductCreateInput
// ) {
//   // Generate unique slug
//   const slug = await generateUniqueSlug(productData.title);

//   // Create product with generated slug
//   return prisma.product.create({
//     data: {
//       ...productData,
//       slug // Add the generated unique slug
//     }
//   });
// }

// // Update product with potential slug regeneration
// export async function updateProductWithSlug(
//   productId: string,
//   updateData: Partial<ProductCreateInput>
// ) {
//   // If title is being updated, generate new slug
//   let slug = undefined;
//   if (updateData.title) {
//     slug = await generateUniqueSlug(
//       updateData.title, 
//       productId // Exclude current product from slug uniqueness check
//     );
//   }

//   // Update product
//   return prisma.product.update({
//     where: { id: productId },
//     data: {
//       ...updateData,
//       ...(slug && { slug }) // Conditionally add slug if regenerated
//     }
//   });
// }

// // Fetch product by slug
// export async function getProductBySlug(slug: string) {
//   return prisma.product.findUnique({
//     where: { slug },
//     include: {
//       product_images: true
//     }
//   });
// }