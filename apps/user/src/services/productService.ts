import { S3Service } from '@repo/s3_database/client';
import { ProductCreateData, ProductDataWithImages } from '../types/product';
import { v4 as uuidv4 } from 'uuid';
import { ProductService } from '../lib/s3';
import { S3Config } from '@repo/s3_database/type';

export class ProductUploadService extends S3Service {
  async createProductWithImages(
    productData: ProductCreateData,
    files: Array<{ 
      buffer: Buffer; 
      fileName: string; 
      contentType?: string; 
      contentLength: number 
    }>
  ): Promise<ProductDataWithImages> {
    try {
      const productId = uuidv4();
      
      // Save product and its image data in the database
      await this.saveProductToDatabase(productData, files, productId);
  
      return {
        productId,
        title: productData.title,
        description: productData.description,
        price: productData.price,
      };
    } catch (error) {
      console.error('Product creation failed:', error);
      throw error;
    }
  }
  
  private async saveProductToDatabase(
    productData: ProductCreateData,
    files: Array<{ 
      buffer: Buffer; 
      fileName: string; 
      contentType?: string; 
      contentLength: number 
    }>,
    productId: string,
  ) {
    const s3Config: S3Config = {
      region: process.env.NEXT_PUBLIC_S3_REGION || process.env.S3_REGION as string,
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET as string,
      endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT || process.env.S3_ENDPOINT as string,
    };
    const productService = new ProductService(s3Config);

    // Pass the image upload response to ProductService to create product in the database
    await productService.createProductWithImages(
      productData,
      productId,
      files
    );
  }
}
