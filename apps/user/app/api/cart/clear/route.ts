import {  NextResponse } from "next/server";
import { getUserId } from "../../../userId/userID";
import { prisma } from "@repo/prisma_database/client";

export async function DELETE() {
  try { 
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const deletedCartItems = await prisma.cart.deleteMany({
      where: {
        userId: userId
      }
    });

    await prisma.$disconnect();

    if (deletedCartItems.count === 0) {
      return NextResponse.json(
        { success: false, message: "No cart items found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Cart cleared successfully" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error clearing cart', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to clear cart" 
      },
      { status: 500 }
    );
  }
}