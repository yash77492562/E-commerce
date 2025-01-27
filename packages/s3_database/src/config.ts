
// packages/s3-config/src/config.ts
import { S3Client } from '@aws-sdk/client-s3';
// import {AWS} from 'aws-sdk'
import { S3Config } from './types';

export const createS3Client = (config: S3Config): S3Client => {
  console.log(config,'config')
  const clientConfig: Record<string, any> = {
    region: config.region,
    endpoint:config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    }
  };

  // Ensure endpoint is always set for R2
  if (!config.endpoint) {
    throw new Error('Endpoint is required for Cloudflare R2');
  }

  return new S3Client(clientConfig);
};