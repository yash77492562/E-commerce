// ImageProcessor.ts
import imageCompression from 'browser-image-compression';

// Client-side image processing
export class ClientImageProcessor {
  static async processImage(file: File): Promise<{ 
    processedFile: File; 
    quality: number;
    dimensions: { width: number; height: number };
  }> {
    // Check initial image quality
    const initialQuality = await this.assessImageQuality(file);
    
    // Get image dimensions
    const dimensions = await this.getImageDimensions(file);
    
    // Compression options based on quality assessment
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: initialQuality < 0.7 ? 0.9 : 0.8, // Higher quality for low-quality images
      preserveExif: true,
    };

    // Quality thresholds
    if (dimensions.width < 800 || dimensions.height < 800) {
      throw new Error('Image dimensions too small. Minimum 800x800px required.');
    }

    if (initialQuality < 0.4) {
      throw new Error('Image quality too low for e-commerce use.');
    }

    const compressedFile = await imageCompression(file, options);
    
    // Verify quality wasn't degraded too much
    const finalQuality = await this.assessImageQuality(compressedFile);
    if (finalQuality < initialQuality * 0.9) {
      // If quality loss is too high, use original file
      return {
        processedFile: file,
        quality: initialQuality,
        dimensions
      };
    }

    return {
      processedFile: compressedFile,
      quality: finalQuality,
      dimensions
    };
  }

  private static async assessImageQuality(file: File): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(0);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Analyze image characteristics
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate quality metrics
        let contrast = 0;
        const sharpness = 0;
        const noise = 0;

        // Simple contrast calculation
        let min = 255;
        let max = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
          min = Math.min(min, brightness);
          max = Math.max(max, brightness);
        }
        contrast = (max - min) / 255;

        // Normalize and combine metrics
        const quality = Math.min(1, (contrast * 0.7 + sharpness * 0.2 + (1 - noise) * 0.1));
        resolve(quality);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }
}

// Integration with existing ProductImageUpload component
export const enhancedHandleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  onFileSelect: (files: File[]) => void
) => {
  const fileList = event.target.files ? Array.from(event.target.files) : [];
  const processedFiles: File[] = [];
  const errors: string[] = [];

  for (const file of fileList) {
    try {
      const { processedFile } = await ClientImageProcessor.processImage(file);
      processedFiles.push(processedFile);
    } catch (error) {
      errors.push(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (processedFiles.length > 0) {
    onFileSelect(processedFiles);
  }

  return errors;
};