import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ProductService } from '../../../config/cdn';
import { S3Config } from '@repo/s3_database/type';
import { getUserId } from '../../userId/userID';
import { prisma } from '@repo/prisma_database/client';
import { decrypt } from '@repo/encrypt/client';

// Define interfaces for type safety
interface OrderProduct {
  title: string;
  quantity: number;
  price: number;
  discountLessValue?: number;
  imageKey?: string;
}

interface OrderDetails {
  address: string;
  phone: string;
}

interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface EmailRequestBody {
  orderId: string;
  transactionId: string;
  customerName: string;
  orderDetails: OrderDetails;
  products: OrderProduct[];
  totals: OrderTotals;
}

const s3Config: S3Config = {
  region: process.env.S3_REGION as string,
  endpoint: process.env.S3_ENDPOINT as string,
  accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  bucket: process.env.S3_BUCKET as string,
};

const productService = new ProductService(s3Config);
const getUserEmail =async ()=>{
  const id = await getUserId();
  const email  = await prisma.user.findUnique({
    where:{id},
    select:{email:true}
  })
  if (!email?.email) {
    throw new Error('Email not found');
  }
  return decrypt(email.email)
}
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'yssh200@gmail.com',
    pass: 'vcezdfjjmzdrjunq'
  }
});

const generateProductsHTML = async (products: OrderProduct[]): Promise<string> => {
  const productsHTML = await Promise.all(products.map(async product => {
    // Get the first image from product.product_images array
    const imageKey = product.imageKey;
    
    if (!imageKey) {
      console.warn(`No image key found for product ${product.title}`);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <p>No image available</p>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <h4 style="margin: 0;">${product.title}</h4>
            <p style="margin: 5px 0;">Quantity: ${product.quantity}</p>
            <p style="margin: 5px 0;">Price: $${(product.discountLessValue || product.price).toFixed(2)}</p>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${((product.discountLessValue || product.price) * product.quantity).toFixed(2)}
          </td>
        </tr>
      `;
    }

    const imageUrl = await productService.getEmailProductImageUrl(imageKey);
    
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${imageUrl}" alt="${product.title}" style="width: 100px; height: 100px; object-fit: cover;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <h4 style="margin: 0;">${product.title}</h4>
          <p style="margin: 5px 0;">Quantity: ${product.quantity}</p>
          <p style="margin: 5px 0;">Price: $${(product.discountLessValue || product.price).toFixed(2)}</p>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${((product.discountLessValue || product.price) * product.quantity).toFixed(2)}
        </td>
      </tr>
    `;
  }));
  
  return productsHTML.join('');
};

export async function POST(request: Request) {
  try {
    // Check if request has body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Add robust body parsing
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Parse JSON with error handling
    let body: EmailRequestBody;
    try {
      body = JSON.parse(rawBody) as EmailRequestBody;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    const {
      orderId,
      transactionId,
      customerName,
      orderDetails,
      products,
      totals
    } = body;
    
    const productsHTMLContent = await generateProductsHTML(products);

    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Order Confirmation</h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0;">Order Information</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
          <p><strong>Phone:</strong> ${orderDetails.phone}</p>
        </div>

        <h3 style="margin: 20px 0 10px 0;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Details</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTMLContent}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
              <td style="padding: 10px; text-align: right;">$${totals.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right;"><strong>Tax:</strong></td>
              <td style="padding: 10px; text-align: right;">$${totals.tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
              <td style="padding: 10px; text-align: right;">$${totals.shipping.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-size: 1.2em;"><strong>Total:</strong></td>
              <td style="padding: 10px; text-align: right; font-size: 1.2em;"><strong>$${totals.total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
          <p>Thank you for your purchase! Keep your order ID and transaction ID for future reference.</p>
          <p>If you have any questions about your order, please contact our customer support.</p>
        </div>
      </div>
    `;

    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Order Received</h2>
        <p>A new order has been placed with the following details:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
          <p><strong>Phone:</strong> ${orderDetails.phone}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          ${productsHTMLContent}
        </table>

        <div style="margin-top: 20px;">
          <p><strong>Total Order Value:</strong> $${totals.total.toFixed(2)}</p>
        </div>
      </div>
    `;

    // Send customer email
    await transporter.sendMail({
      from: 'yssh200@gmail.com',
      to: 'yashyadavpro@gmail.com',
      subject: `Order Confirmation - Order #${orderId}`,
      html: customerEmailContent
    });

    // Send admin email
    await transporter.sendMail({
      from: 'yssh200@gmail.com',
      to: await getUserEmail(),
      subject: `New Order Received - Order #${orderId}`,
      html: adminEmailContent
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}