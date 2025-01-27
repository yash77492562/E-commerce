import { S3Client } from "@aws-sdk/client-s3";

export interface S3Config {
  endpoint?:string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}


export interface ProductImage {
  index?:number;
  id?:string;
  key: string;
  url: string;
  isMain?: boolean;
  uploadedAt: Date;
}
export interface HomeImage {
  id?:string;
  key: string;
  url: string;
  isMain?: boolean;
  uploadedAt: Date;
}

export interface UploadResponse {
  url: string;
  key: string;
}

export interface MultipleUploadResponse {
  productId?: string;
  aboutId?:string
  image_key?:string;
  images: ProductImage[];
}
export interface SingleUploadResponse {
  Home_id?: string;
  image_key?:string;
  images: HomeImage;
}

export type { S3Client };