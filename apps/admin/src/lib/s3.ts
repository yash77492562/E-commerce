import { S3Service } from '@repo/s3_database/client';
import { prisma } from '@repo/prisma_database/client';
import { S3Config } from '@repo/s3_database/type';
import { ProductImage } from '@repo/s3_database/type';
import { generateUniqueSlug } from '../utils/slug';

// Add new type for where conditions
type ProductWhereCondition = {
  category?: { equals: string; mode: 'insensitive' };
  subCategory?: { equals: string; mode: 'insensitive' };
  OR?: Array<{
    title?: { contains: string; mode: 'insensitive' };
    slug?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
    tags?: { hasSome: string[] };
    category?: { contains: string; mode: 'insensitive' };
    subCategory?: { contains: string; mode: 'insensitive' };
  }>;
  id?: { in: string[] };
};

// Add error logging utility
const logError = (message: string, error: unknown) => {
  // You can implement your preferred error logging strategy here
  // For example, sending to a logging service
  process.env.NODE_ENV === 'development' && console.error(message, error);
};

// Define the type that matches your Prisma product model
type ProductWithImages = {
  id: string;
  title: string;
  description: string;
  slug:string;
  price: number;
  discount: number | null;
  discount_rate: number | null;
  discountLessValue: number | null;
  tags: string[];
  category: string | null;
  subCategory : string | null
  uploaded_at: Date;
  product_images: Array<{
    id: string;
    index:number
    uploaded_at: Date;
    product_id: string;
    image_key: string;
    image_url: string; // Will be updated dynamically
    is_main: boolean;
  }>;
};

export class ProductService {
  private s3Service: S3Service;

  private extractProductId(imageKey: string): string {
  const parts = imageKey.split('/');
  if (parts.length > 1 && parts[1]) {
    return parts[1];
  }
  throw new Error('Invalid image key format');  
}

  constructor(s3Config: S3Config) {
    this.s3Service = new S3Service(s3Config);
  }
  async createProductWithImages(
    productData: {
      title: string;
      description: string;
      price: number;
    },
    product_id: string,
    files: Array<{ 
      buffer: Buffer; 
      fileName: string; 
      contentType?: string; 
      contentLength: number 
    }>
  )  {
    // Upload images to S3
    const imageUploadResponse = await this.s3Service.uploadProductImages(
      product_id, 
      files,
      { makeFirstImageMain: true }
    );
    // Create product in database
    const slug = await generateUniqueSlug(productData.title)
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        product_images: {
          createMany: {
            data: imageUploadResponse.images.map((img,index) => ({
              index:index,
              image_key: img.key,
              image_url: img.url,
              is_main: img.isMain || false
            }))
          }
        }
      },
      include: {
        product_images: true
      }
    });

    return product;
  }

  // Method to add more images to an existing product
  async addMoreProductImages(
    productId: string,
    lastIndex:number,
    files: Array<{ buffer: Buffer; fileName: string; contentType?: string }>
  ) {
    // Get existing product images
    const existingImages = await prisma.productImage.findMany({
      where: { product_id: productId }
    });
    const image_key = (existingImages && existingImages.length > 0 && existingImages[0]?.image_key)
    ? this.extractProductId(existingImages[0].image_key)  // Safe access
    : productId;  // Fallback if image_key is undefined


    // Upload new images to S3
    const newImagesResponse = await this.s3Service.addProductImages(
      image_key,
      files,
      existingImages.map((img) => ({
        id:img.id,
        key: img.image_key,
        url: img.image_url,
        uploadedAt: img.uploaded_at
      }))
    );
    // Add new images to database
  for (const img of newImagesResponse.images) {
    await prisma.productImage.create({
      data: {
        product_id: productId,
        index:lastIndex,
        image_key: img.key,
        image_url: img.url,
        is_main: img.isMain || false,
        uploaded_at: img.uploadedAt, // Ensure this field exists in your schema
      },
    });
  }

    return newImagesResponse;
  }

  // Method to get product images with signed URLs
  async getProductImagesWithUrls(productId: string): Promise<ProductImage[]> {
    try {
      // First, get the image keys from the database
      const productImages = await prisma.productImage.findMany({
        where: { product_id: productId  },
        select: {
          id:true,
          image_key: true,
          is_main: true,
          uploaded_at: true,
        },
        orderBy: { index: 'asc' },
      });
      // If no images found, return an empty array
      if (!productImages || productImages.length === 0) {
        return [];
      }

      // Get signed URLs for images
      const s3Images = await this.s3Service.getProductImageUrls(
        productImages.map((img) => img.image_key)
      );
      // Merge database image info with S3 URLs
      return s3Images.map((s3Image, index) => ({
        ...s3Image,
        is_main: productImages[index]?.is_main ?? false,
        id:productImages[index]?.id ?? '',
        uploaded_at: productImages[index]?.uploaded_at ?? new Date(),
      }));
    } catch (error) {
      logError('Error retrieving product images from S3:', error);
      throw new Error('Failed to retrieve product images');
    }
  }

  // Method to get all products with their first image
  async getAllProductsWithFirstImage(category?: string, query?: string, userId?: string,subCategory?:string): Promise<ProductWithImages[]> {
    try {
      const whereCondition: ProductWhereCondition = {};

      if (category && category.toLowerCase() !== 'all') {
        whereCondition.category = { equals: category, mode: 'insensitive' };
      }

      if (subCategory && subCategory.toLowerCase() !== 'all') {
        whereCondition.subCategory = { equals: subCategory, mode: 'insensitive' };
      }

      if (query) {
        whereCondition.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: query.toLowerCase().split(' ') } },
          { category: { contains: query, mode: 'insensitive' } },
          { subCategory: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (userId) {
        const cartProductIds = await prisma.cart.findMany({
          where: { userId },
          select: { productId: true }
        });

        whereCondition.id = { in: cartProductIds.map(item => item.productId) };
      }
  
      const products = await prisma.product.findMany({
        where: whereCondition,
        include: {
          product_images: {
            take: 1, // Only get the first main image
            where: { is_main: true }, 
            orderBy: { uploaded_at: 'asc' },
          },
        },
        orderBy: {
          uploaded_at: 'desc',
        },
      });
  
      // Rest of the method remains the same as the existing implementation
      const productsWithS3Images: ProductWithImages[] = await Promise.all(
        products.map(async (product): Promise<ProductWithImages> => {
          const productCopy: ProductWithImages = {
            id: product.id ?? '',
            title: product.title ?? '',
            slug: product.slug ?? '',
            description: product.description ?? '',
            price: product.price ?? 0,
            discount: product.discount ?? null,
            discountLessValue: product.discountLessValue ?? null,
            discount_rate: product.discount_rate ?? null,
            tags: product.tags ?? [],
            category: product.category ?? null,
            subCategory: product.subCategory ?? null,
            uploaded_at: product.uploaded_at ?? new Date(),
            product_images: product.product_images?.length
              ? product.product_images.map((img, index) => ({
                  index,
                  id: img.id ?? '',
                  uploaded_at: img.uploaded_at ?? new Date(),
                  product_id: img.product_id ?? '',
                  image_key: img.image_key ?? '',
                  image_url: img.image_url ?? '',
                  is_main: img.is_main ?? false,
                }))
              : [],
          };
  
          // Fetch S3 image URLs (existing implementation)
          if (productCopy.product_images && productCopy.product_images.length > 0) {
            try {
              const s3Images = await this.s3Service.getProductImageUrls(
                productCopy.product_images.map((img) => img.image_key)
              );
  
              if (s3Images?.length > 0 && s3Images?.[0]?.url && productCopy.product_images?.[0]) {
                productCopy.product_images[0].image_url = s3Images[0].url;
              }
            } catch (error) {
              logError(`Failed to fetch S3 image for product ${productCopy.id}:`, error);
            }
          }
  
          return productCopy;
        })
      );
  
      return productsWithS3Images;
    } catch (error) {
      logError('Error retrieving products with first image:', error);
      throw new Error('Failed to retrieve products with images');
    }
  }

  async getRecommendedProducts(currentProductTags: string[], id:string): Promise<ProductWithImages[]> {
    try {
      // Validate input
      if (!currentProductTags || currentProductTags.length === 0) {
        return []; // Return empty array if no tags provided
      }
  
      // Normalize tags to lowercase for consistent matching
      const normalizedTags = currentProductTags.map(tag => tag.toLowerCase());
  
      // Fetch products with tag matching logic
      const products = await prisma.product.findMany({
        where: {
          // Exclude the current product (if product ID is available)
            tags: {
              // Ensure no overlap with all current product tags
              hasSome: normalizedTags
            },
            NOT:{
              id
            }
        },
        include: {
          product_images: {
            take: 1, // Only get the first main image
            where: { is_main: true },
            orderBy: { uploaded_at: 'asc' },
          },
        },
        orderBy: {
          uploaded_at: 'desc',
        },
      });
  
      // Custom sorting function to rank products by tag matching
      const rankedProducts = products
        .map(product => {
          // Normalize product tags to lowercase
          const productTags = product.tags?.map(tag => tag.toLowerCase()) || [];
          
          // Count tag matches
          const matchedTags = productTags.filter(tag => 
            normalizedTags.includes(tag)
          );
  
          return {
            product,
            tagMatchCount: matchedTags.length,
            // Calculate match percentage
            matchPercentage: (matchedTags.length / normalizedTags.length) * 100
          };
        })
        // Sort by tag match count in descending order
        .sort((a, b) => b.tagMatchCount - a.tagMatchCount)
        // Take top 15 recommendations (configurable)
        .slice(0, 15)
        .map(item => item.product);
  
      // Fetch S3 images for recommended products (similar to existing implementation)
      const productsWithS3Images: ProductWithImages[] = await Promise.all(
        rankedProducts.map(async (product): Promise<ProductWithImages> => {
          const productCopy: ProductWithImages = {
            id: product.id ?? '',
            title: product.title ?? '',
            slug: product.slug ?? '',
            description: product.description ?? '',
            price: product.price ?? 0,
            discount: product.discount ?? null,
            discountLessValue: product.discountLessValue ?? null,
            discount_rate: product.discount_rate ?? null,
            tags: product.tags ?? [],
            category: product.category ?? null,
            subCategory: product.subCategory ?? null,
            uploaded_at: product.uploaded_at ?? new Date(),
            product_images: product.product_images?.length
              ? product.product_images.map((img, index) => ({
                  index,
                  id: img.id ?? '',
                  uploaded_at: img.uploaded_at ?? new Date(),
                  product_id: img.product_id ?? '',
                  image_key: img.image_key ?? '',
                  image_url: img.image_url ?? '',
                  is_main: img.is_main ?? false,
                }))
              : [],
          };
  
          // Fetch S3 image URLs (similar to existing method)
          if (productCopy.product_images && productCopy.product_images.length > 0) {
            try {
              const s3Images = await this.s3Service.getProductImageUrls(
                productCopy.product_images.map((img) => img.image_key)
              );
  
              if (s3Images?.length > 0 && s3Images?.[0]?.url && productCopy.product_images?.[0]) {
                productCopy.product_images[0].image_url = s3Images[0].url;
              }
            } catch (error) {
              logError(`Failed to fetch S3 image for product ${productCopy.id}:`, error);
            }
          }
  
          return productCopy;
        })
      );
  
      return productsWithS3Images;
    } catch (error) {
      logError('Error retrieving recommended products:', error);
      throw new Error('Failed to retrieve recommended products');
    }
  }
  
}

