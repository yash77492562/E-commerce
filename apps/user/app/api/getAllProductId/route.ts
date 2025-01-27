import { NextResponse } from "next/server";
import { prisma } from "@repo/prisma_database/client";


export async function GET() {
  try {
    const productId = prisma.product.findMany({
        select:{
            product_images:{
                select:{
                    product_id:true
                }
            }
        }
    });
    // Validate product ID
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }


    // Return images
    return NextResponse.json(
      { 
        success: true, 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error retrieving product images', error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve product images" },
      { status: 500 }
    );
  }
}