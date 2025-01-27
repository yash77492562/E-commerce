import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  ListBucketsCommand,
  ListBucketsCommandOutput,
  BucketLocationConstraint
} from '@aws-sdk/client-s3';
import { ServerImageProcessor } from './ImageEnhance/imageProcessor';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { S3Config, UploadResponse, MultipleUploadResponse, ProductImage, HomeImage, SingleUploadResponse } from './types';

export class S3Service {
  private client: S3Client;
  private bucket: string;
  private region: string;

  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.region || 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true
    });
    this.bucket = config.bucket;
    this.region = config.region || 'auto';
  }

  private async testConnection(): Promise<void> {
    try {
      const response = await this.client.send(new ListBucketsCommand({})) as ListBucketsCommandOutput;
      console.log("Connected successfully:", response.Buckets);
    } catch (error) {
      console.log("Connection details:", {
        endpoint: this.client.config.endpoint,
        region: this.client.config.region,
        bucket: this.bucket
      });
      throw error;
    }
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.testConnection();
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error: any) {
      console.error('Bucket check error:', error);

      if (
        error.$metadata?.httpStatusCode === 301 ||
        error.$metadata?.httpStatusCode === 404 ||
        error.$metadata?.httpStatusCode === 403
      ) {
        console.log(`Bucket ${this.bucket} may not exist or be accessible. Attempting to create...`);
        
        try {
          const createParams = {
            Bucket: this.bucket,
            CreateBucketConfiguration: this.region !== 'auto' 
              ? { LocationConstraint: this.region as BucketLocationConstraint } 
              : undefined,
          };

          const createResponse = await this.client.send(new CreateBucketCommand(createParams));
          console.log(`Bucket ${this.bucket} created successfully.`, createResponse);
        } catch (createError) {
          console.error('Detailed bucket creation error:', createError);
          throw new Error(`Failed to create or access bucket: ${this.bucket}`);
        }
      } else {
        console.error('Unexpected error checking bucket:', error);
        throw error;
      }
    }
  }

  private generateImageKey(productId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '-');
    return `products/${productId}/images/${timestamp}-${sanitizedFileName}`;
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType?: string,
    contentLength?: number
  ): Promise<UploadResponse> {
    await this.ensureBucketExists();

    if (!file || file.length === 0) {
      throw new Error('Input file is missing or empty');
    }

    const processedBuffer = await ServerImageProcessor.processImage(file);
    console.log(processedBuffer, 'processedBuffer from utils.ts');
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: processedBuffer,
      ContentType: contentType || 'application/octet-stream',
      ContentLength: processedBuffer.length,
    });

    await this.client.send(command);
    const url = await this.getSignedUrl(key);
    return { url, key };
  }

  async uploadProductImages(
    productId: string,
    files: Array<{
      buffer: Buffer;
      fileName: string;
      contentType?: string;
      contentLength?: number;
    }>,
    options?: { makeFirstImageMain?: boolean }
  ): Promise<MultipleUploadResponse> {
    await this.ensureBucketExists();

    const uploadPromises = files.map(async (file, index) => {
      const key = this.generateImageKey(productId, file.fileName);
      const uploadResponse = await this.uploadFile(
        file.buffer,
        key,
        file.contentType,
        file.contentLength
      );

      return {
        key: uploadResponse.key,
        url: uploadResponse.url,
        isMain: options?.makeFirstImageMain ? index === 0 : false,
        uploadedAt: new Date(),
      };
    });

    const images = await Promise.all(uploadPromises);
    return { productId, images };
  }

  async addProductImages(
    image_key: string,
    files: Array<{
      buffer: Buffer;
      fileName: string;
      contentType?: string;
      contentLength?: number;
    }>,
    existingImages: ProductImage[]
  ): Promise<MultipleUploadResponse> {
    const hasExistingImage = existingImages && existingImages.length > 0;
    const newImagesResponse = await this.uploadProductImages(
      image_key, 
      files,
      { makeFirstImageMain: !hasExistingImage }
    );
    console.log(newImagesResponse, 'newImagesResponse from utils.ts');
    return {
      image_key,
      images: newImagesResponse.images
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw error;
    }
  }

  async getProductImageUrls(imageKeys: string[]): Promise<ProductImage[]> {
    const urlPromises = imageKeys.map(async (key) => {
      const url = await this.getSignedUrl(key);
      return { key, url, uploadedAt: new Date() };
    });
    return Promise.all(urlPromises);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
  }

  async deleteProductImages(imageKeys: string[]): Promise<void> {
    console.log(imageKeys, 'imageKeys');
    const deletePromises = imageKeys.map((key) => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  async uploadSingleProductImage(
    productId: string,
    file: {
      buffer: Buffer;
      fileName: string;
      contentType?: string;
      contentLength?: number;
    },
    options?: { isMain?: boolean }
  ): Promise<ProductImage> {
    await this.ensureBucketExists();
  
    const key = this.generateImageKey(productId, file.fileName);
    const uploadResponse = await this.uploadFile(
      file.buffer,
      key,
      file.contentType,
      file.contentLength
    );
  
    return {
      key: uploadResponse.key,
      url: uploadResponse.url,
      isMain: options?.isMain || false,
      uploadedAt: new Date(),
    };
  }
  
  async getSingleProductImageUrl(imageKey: string): Promise<ProductImage> {
    try {
      const url = await this.getSignedUrl(imageKey);
      return {
        key: imageKey,
        url,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to get single product image URL:', error);
      throw error;
    }
  }
  
  async deleteSingleProductImage(imageKey: string): Promise<void> {
    try {
      await this.deleteFile(imageKey);
    } catch (error) {
      console.error('Failed to delete single product image:', error);
      throw error;
    }
  }
  
  async replaceSingleProductImage(
    oldImageKey: string | null,
    productId: string,
    file: {
      buffer: Buffer;
      fileName: string;
      contentType?: string;
      contentLength?: number;
    },
    options?: { isMain?: boolean }
  ): Promise<ProductImage> {
    if (oldImageKey) {
      try {
        await this.deleteFile(oldImageKey);
      } catch (error) {
        console.error('Failed to delete old image:', error);
      }
    }
    return this.uploadSingleProductImage(productId, file, options);
  }

  async uploadAboutImages(
    aboutId: string,
    files: Array<{
      buffer: Buffer;
      fileName: string;
      contentType?: string;
      contentLength?: number;
    }>,
    options?: { makeFirstImageMain?: boolean }
  ): Promise<MultipleUploadResponse> {
    await this.ensureBucketExists();

    const uploadPromises = files.map(async (file, index) => {
      const key = this.generateImageKey(aboutId, file.fileName);
      const uploadResponse = await this.uploadFile(
        file.buffer,
        key,
        file.contentType,
        file.contentLength
      );

      return {
        key: uploadResponse.key,
        url: uploadResponse.url,
        isMain: options?.makeFirstImageMain ? index === 0 : false,
        uploadedAt: new Date(),
      };
    });

    const images = await Promise.all(uploadPromises);
    return { aboutId, images };
  }
}