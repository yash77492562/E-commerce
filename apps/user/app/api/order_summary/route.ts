import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/prisma_database/client';
import { getUserId } from '../../userId/userID';

// Define interfaces for type safety
interface CartProduct {
  id: string;
  quantity: number;
  price: number;
  discountLessValue?: number;
}

interface ShippingDetails {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  landMark: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
}

interface OrderRequestBody {
  cartProducts: CartProduct[];
  shippingDetails: ShippingDetails;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OrderRequestBody;
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ 
        message: 'Invalid request body' 
      }, { status: 400 });
    }

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ 
        message: 'User ID is required' 
      }, { status: 400 });
    }

    const {
      cartProducts,
      shippingDetails,
      subtotal,
      tax,
      shipping,
      total
    } = body;

    // Validate required fields
    if (!cartProducts?.length || !shippingDetails) {
      return NextResponse.json({ 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
        phone: shippingDetails.phone,
        country: shippingDetails.country,
        landMark: shippingDetails.landMark,
        state: shippingDetails.state,
        city: shippingDetails.city,
        address: shippingDetails.address,
        pinCode: shippingDetails.postalCode,
        subtotal,
        tax,
        shipping,
        total,
        transactionId: `ORDER-${Date.now()}`,
        transactionStatus: 'success',
        orderItems: {
          create: cartProducts.map((product: CartProduct) => ({
            productId: product.id,
            quantity: product.quantity,
            price: product.discountLessValue || product.price
          }))
        }
      },
      include: {
        orderItems: true
      }
    });

    return NextResponse.json({ 
      message: 'Order created successfully', 
      order 
    }, { status: 200 });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ 
      message: 'Failed to create order', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}