// config/cdn.ts
import { S3Config, ProductImage } from '@repo/s3_database/type';
import { S3Service } from '@repo/s3_database/client';

interface CdnConfig {
  cdnUrl: string;
  region: string;
  bucket: string;
}

export const getCdnConfig = (): CdnConfig => {
  const cdnUrl = process.env.NODE_ENV === 'production'
    ? process.env.CLOUDFLARE_CDN_URL || 'https://your-cdn.yourdomain.com'
    : process.env.MINIO_ENDPOINT || 'http://localhost:9000';

  return {
    cdnUrl,
    region: process.env.S3_REGION || 'auto',
    bucket: process.env.S3_BUCKET || 'your-bucket'
  };
};

export class EnhancedS3Service extends S3Service {
  private cdnConfig: CdnConfig;

  constructor(s3Config: S3Config) {
    super(s3Config);
    this.cdnConfig = getCdnConfig();
  }

  // Generate a CDN URL for a given key
  public async getCdnUrl(key: string): Promise<string> {
    if (process.env.NODE_ENV === 'production') {
      // For R2/Cloudflare in production
      return `${this.cdnConfig.cdnUrl}/${key}`;
    } else {
      // For development, we'll use signed URLs instead of direct MinIO URLs
      return await this.getSignedUrl(key);
    }
  }

  // Get signed URL for email images
  public async getEmailImageUrl(key: string): Promise<string> {
    if (process.env.NODE_ENV === 'production') {
      return this.getCdnUrl(key);
    }
    // Always use signed URLs in development
    return this.getSignedUrl(key);
  }

  // Override the original getProductImageUrls to support CDN
  async getProductImageUrls(imageKeys: string[]): Promise<ProductImage[]> {
    if (process.env.NODE_ENV === 'production') {
      // Use CDN URLs in production
      const promises = await Promise.all(imageKeys.map(async key => ({
        key,
        url: await this.getCdnUrl(key),
        uploadedAt: new Date()
      })));
      return promises;
    }
    // Use signed URLs in development
    return super.getProductImageUrls(imageKeys);
  }
}
  
  // Updated product service
  export class ProductService {
    private s3Service: EnhancedS3Service;
  
    constructor(s3Config: S3Config) {
      this.s3Service = new EnhancedS3Service(s3Config);
    }
  
    async getEmailProductImageUrl(imageKey: string): Promise<string> {
        console.log(imageKey , 'imageKey')
      return this.s3Service.getEmailImageUrl(imageKey);
    }
  }