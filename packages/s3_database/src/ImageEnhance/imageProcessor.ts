import sharp from 'sharp';

export class ServerImageProcessor {
  static async resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    try {
      const resizedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toBuffer();
      return resizedBuffer;
    } catch (error) {
      console.error('Image resizing error:', error);
      throw new Error('Failed to resize image');
    }
  }

  static async processImage(buffer: Buffer): Promise<Buffer> {
    if (!buffer || buffer.length === 0) {
      throw new Error('Input file is missing or empty');
    }

    // Ensure buffer is a Buffer instance
    if (!(buffer instanceof Buffer)) {
      buffer = Buffer.from(buffer);
    }

    console.log(buffer);
    console.log('Starting image processing with buffer length:', buffer.length);
    
    try {
      // Resize image before processing
      const resizedBuffer = await this.resizeImage(buffer, 1920, 1080);
      const image = sharp(resizedBuffer, {
        failOnError: false, // Don't fail on corrupt images
        pages: 1 // Only process first page of multi-page images
      });
      
      // Verify the sharp instance
      if (!image) {
        throw new Error('Failed to create Sharp instance');
      }
      
      try {
        // Add timeout to metadata call in case it hangs
        const metadata = await Promise.race([
          image.metadata(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Metadata timeout')), 5000)
          )
        ]) as sharp.Metadata;
        
        console.log('Image metadata:', {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          channels: metadata.channels,
          space: metadata.space
        });

        if (!metadata.width || !metadata.height) {
          throw new Error('Invalid image dimensions');
        }

        // Rest of the processing pipeline
        const stats = await image.stats();
        console.log('Image stats:', stats);
        
        if (!stats.channels || stats.channels.length < 3) {
          throw new Error('Invalid image format: requires RGB channels');
        }

        const avgColorValue = stats.channels.slice(0, 3)
          .reduce((sum, channel) => sum + (channel.mean || 0), 0) / 3;
        
        let pipeline = image;
        
        if (avgColorValue < 50) {
          pipeline = pipeline.modulate({
            brightness: 1.2,
            saturation: 1.1
          });
        }

        if (avgColorValue > 200 || avgColorValue < 50) {
          pipeline = pipeline.normalise();
        }

        pipeline = pipeline.sharpen({
          sigma: 1,
          m1: 0.1,
          m2: 0.1
        });

        // Try formats in sequence until one succeeds
        for (const format of ['jpeg', 'webp', 'png'] as const) {
          try {
            const options = format === 'jpeg' 
              ? { quality: 85, progressive: true }
              : format === 'webp'
                ? { quality: 85 }
                : { compressionLevel: 8 };
                
            console.log(`Attempting to convert to ${format}...`);
            return await (pipeline as any)[format](options).toBuffer();
          } catch (e) {
            console.error(`Failed to convert to ${format}:`, e);
            continue;
          }
        }
        
        throw new Error('Failed to convert image to any supported format');
        
      } catch (metadataError) {
        console.error('Metadata extraction failed:', metadataError);
        throw new Error(`Failed to extract image metadata: ${metadataError instanceof Error ? metadataError.message : String(metadataError)}`);
      }
      
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(
        `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Integration with existing ProductImageUpload component
export const enhancedHandleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  onFileSelect: (files: File[]) => void,
  onError?: (errors: string[]) => void
) => {
  const files = event.target.files ? Array.from(event.target.files) : [];
  const processedFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      // Validate file type and size before processing
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type: only images are allowed');
      }
      
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error('File too large: maximum size is 10MB');
      }

      const buffer = await file.arrayBuffer();
      const processedBuffer = await ServerImageProcessor.processImage(Buffer.from(buffer));
      const processedFile = new File([processedBuffer], file.name, { type: file.type });
      processedFiles.push(processedFile);
    } catch (error) {
      const errorMessage = `Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  if (processedFiles.length > 0) {
    onFileSelect(processedFiles);
  }

  if (errors.length > 0 && onError) {
    onError(errors);
  }

  return errors;
};