import { S3Service } from '@repo/s3_database/client';
import { prisma } from '@repo/prisma_database/client';
import { S3Config } from '@repo/s3_database/type';
import { generateUniqueSlug } from '../utils/slug';

export async function deleteHomeImage(
  s3Config: S3Config, 
  imageId: string
) {
  // Initialize S3 Service
  const s3Service = new S3Service(s3Config);
  try {
    // Find the image in the database
    const homeImage = await prisma.homeImage.findUnique({
      where: { id: imageId }
    });

    if (!homeImage) {
      throw new Error('Image not found');
    }

    // Delete the image from S3
    await s3Service.deleteSingleProductImage(homeImage.image_key);

    // Delete the image record from Prisma
    const image = await prisma.homeImage.update({
      where: { id: imageId },
      data:{
        image_key:'',
        image_url:''
      },
      select:{
        id:true
      }
    });
    // Close Prisma client
    await prisma.$disconnect();

    return image;
  } catch (error) {
    console.error('Error deleting home image:', error);
    
    // Ensure a meaningful error is thrown
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unknown error during home image deletion'
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function uploadSingleHomeImage(
  s3Config: S3Config, 
  data:{
    title:string,
    first_para:string,
    second_para:string,
    third_para:string
  },
  file: {
    buffer: Buffer;
    fileName: string;
    contentType?: string;
    contentLength?: number;
  }
) {
  // Initialize S3 Service
  const s3Service = new S3Service(s3Config);

  try {
    // Upload image to S3
    const uploadedImage = await s3Service.uploadSingleProductImage(
      'home', // Using a static ID for home images
      file,
      { isMain: true } // Set as main image by default
    );


    // Create a new Home entry with the uploaded image
    const home = await prisma.home.create({
      data: {
        title:data.title , 
        slug: await generateUniqueSlug(data.title) ,
        first_para: data.first_para ||'',
        second_para:data.second_para || "",
        third_para:data.third_para || '',
        home_images: {
          create: {
            image_key: uploadedImage.key,
            image_url: uploadedImage.url,
            is_main: true
          }
        }
      },
      include: {
        home_images: true
      }
    });

    // Close Prisma client
    await prisma.$disconnect();
    return home;
  }  catch (error) {
    console.error('Error uploading home image:', error);
    
    // Ensure a meaningful error is thrown
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unknown error during home image upload'
    );
  } finally {
    await prisma.$disconnect();
  }
}


export async function changeuploadSingleHomeImage(
  s3Config: S3Config, 
  id:string,
  file: {
    buffer: Buffer;
    fileName: string;
    contentType?: string;
    contentLength?: number;
  }
) {
  // Initialize S3 Service
  const s3Service = new S3Service(s3Config);

  try {
    // Upload image to S3
    const uploadedImage = await s3Service.uploadSingleProductImage(
      'home', // Using a static ID for home images
      file,
      { isMain: true } // Set as main image by default
    );


    // Create a new Home entry with the uploaded image
    const home = await prisma.homeImage.update({
      where:{
        id
      },
      data: {
        image_key: uploadedImage.key,
        image_url: uploadedImage.url
      }
    });

    // Close Prisma client
    await prisma.$disconnect();
    return home;
  }  catch (error) {
    console.error('Error uploading home image:', error);
    
    // Ensure a meaningful error is thrown
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unknown error during home image upload'
    );
  } finally {
    await prisma.$disconnect();
  }
}


export async function uploadAboutContent(
  s3Config: S3Config, 
  data: {
    heading: string;
    first_para: string;
    second_para: string;
    third_para: string;
    four_para: string;
  },
  files: Array<{
    buffer: Buffer;
    fileName: string;
    contentType?: string;
    contentLength?: number;
  }>
) {
  // Initialize S3 Service
  const s3Service = new S3Service(s3Config);

  try {
    // Validate that exactly 3 images are uploaded
    if (files.length !== 3) {
      throw new Error('Exactly 3 images must be uploaded');
    }

    // Upload images to S3 with specific positions
    const uploadPromises = files.map(async (file, index) => {
      const uploadedImage = await s3Service.uploadSingleProductImage(
        'about', // Using a static ID for about images
        file,
        { 
          isMain: index === 0 // First image is main 
        }
      );
      
      // Define positions based on index
      const positions = ['middle', 'right-corner', 'big-one'];
      
      return {
        image_key: uploadedImage.key,
        image_url: uploadedImage.url,
        position: positions[index],
        is_main: index === 0
      };
    });

    // Wait for all image uploads
    const uploadedImages = await Promise.all(uploadPromises);

    // Create a new About entry with the uploaded images
    const about = await prisma.about.create({
      data: {
        heading: data.heading,
        first_para: data.first_para || '',
        second_para: data.second_para || '',
        third_para: data.third_para || '',
        four_para: data.four_para || '',
        about_images: {
          create: uploadedImages.map(img => ({
            image_key: img.image_key,
            image_url: img.image_url,
            position: img.position || '',
            is_main: img.is_main
          }))
        }
      },
      include: {
        about_images: true
      }
    });

    // Close Prisma client
    await prisma.$disconnect();
    
    return about;
  } catch (error) {
    console.error('Error uploading about content:', error);
    
    // Ensure a meaningful error is thrown
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unknown error during about content upload'
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteAboutImage(
  s3Config: S3Config, 
  imageId: string
) {
  // Initialize S3 Service
  const s3Service = new S3Service(s3Config);
  try {
    // Find the image in the database
    const aboutImage = await prisma.aboutImage.findUnique({
      where: { id: imageId }
    });

    if (!aboutImage) {
      throw new Error('Image not found');
    }

    // Delete the image from S3
    await s3Service.deleteSingleProductImage(aboutImage.image_key);

    // Delete the image record from Prisma
    const image = await prisma.aboutImage.update({
      where: { id: imageId },
      data:{
        image_key:'',
        image_url:''
      },
      select:{
        id:true
      }
    });
    // Close Prisma client
    await prisma.$disconnect();

    return image;
  } catch (error) {
    console.error('Error deleting home image:', error);
    
    // Ensure a meaningful error is thrown
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unknown error during home image deletion'
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function changeuploadSingleAboutImage(
  s3Config: S3Config, 
  id:string,
  file: {
    buffer: Buffer;
    fileName: string;
    contentType?: string;
    contentLength?: number;
  }
) {
  // Initialize S3 Service
  const s3Service = new S3Service(s3Config);

  try {
    // Upload image to S3
    const uploadedImage = await s3Service.uploadSingleProductImage(
      'about', // Using a static ID for home images
      file,
      { isMain: true } // Set as main image by default
    );


    // Create a new Home entry with the uploaded image
    const about = await prisma.aboutImage.update({
      where:{
        id
      },
      data: {
        image_key: uploadedImage.key,
        image_url: uploadedImage.url
      }
    });

    // Close Prisma client
    await prisma.$disconnect();
    return about;
  }  catch (error) {
    console.error('Error uploading home image:', error);
    
    // Ensure a meaningful error is thrown
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Unknown error during home image upload'
    );
  } finally {
    await prisma.$disconnect();
  }
}