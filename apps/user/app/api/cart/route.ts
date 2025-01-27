import { NextRequest, NextResponse } from "next/server";
import { cart } from "../../database_create/cart/cart";
import { getUserId } from "../../userId/userID";
import { prisma } from "@repo/prisma_database/client";
import { ProductService } from "../../../src/lib/s3";
import { S3Config } from '@repo/s3_database/type';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const card = await cart(productId);
    
    return NextResponse.json(
      { 
        success: true, 
        card_Add: card
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to add product to cart" 
      },
      { status: 500 }
    );
  }
}

export async function GET(){
  try {
    const userId = await getUserId()
    if(!userId){
      return NextResponse.json(
        { success: false, message: "Failed to retrieve cart products. Please log in." },
        { status: 401 }
      );
    }

    const s3Config: S3Config = {
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    };

    const productService = new ProductService(s3Config);

    const cartProducts = await productService.getAllProductsWithFirstImage(undefined, undefined, userId);

    return NextResponse.json(
      { 
        success: true,
        cartProducts: cartProducts
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error retrieving cart products', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to retrieve cart products" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;
    
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const deletedCartItem = await prisma.cart.deleteMany({
      where: {
        userId: userId,
        productId: productId
      }
    });

    await prisma.$disconnect();

    if (deletedCartItem.count === 0) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Cart item deleted successfully" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting cart item', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to delete cart item" 
      },
      { status: 500 }
    );
  }
}