import nodemailer from 'nodemailer';

// Enhanced interface for order details
interface OrderNotificationParams {
  orderId: string;
  transactionId: string;
  customerName: string;
  orderDetails: {
    address: string;
    phone: string;
  };
  products: Array<{
    title: string;
    quantity: number;
    price: number;
    imageUrl: string;
    discountLessValue?: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
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

class NotificationService {
  private static generateProductsHTML(products: OrderNotificationParams['products']) {
    return products.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${product.imageUrl}" alt="${product.title}" style="width: 100px; height: 100px; object-fit: cover;">
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
    `).join('');
  }

  static async sendUserEmail(params: OrderNotificationParams) {
    const { orderId, transactionId, customerName, orderDetails, products, totals } = params;

    const mailOptions = {
      from: 'yssh200@gmail.com',
      to: 'yashyadavpro@gmail.com',
      subject: `Order Confirmation - Order #${orderId}`,
      html: `
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
              ${this.generateProductsHTML(products)}
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

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('User email sending failed:', error);
      return false;
    }
  }

  static async sendAdminEmail(params: OrderNotificationParams) {
    const { orderId, transactionId, customerName, orderDetails, products, totals } = params;

    const mailOptions = {
      from: 'yssh200@gmail.com',
      to: 'admin@yourdomain.com', // Replace with actual admin email
      subject: `New Order Received - Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Order Received</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin: 0 0 10px 0;">Customer Information</h3>
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
              ${NotificationService.generateProductsHTML(products)}
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
            <p>A new order has been received and requires your attention.</p>
            <p>Please process this order according to standard procedures.</p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated notification for administrators.</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Admin email sending failed:', error);
      return false;
    }
  }

  static async sendOrderNotifications(params: OrderNotificationParams) {
    try {
      const userEmailResult = await this.sendUserEmail(params);
      const adminEmailResult = await this.sendAdminEmail(params);

      return {
        userEmailSent: userEmailResult,
        adminEmailSent: adminEmailResult
      };
    } catch (error) {
      console.error('Notification sending failed:', error);
      return {
        userEmailSent: false,
        adminEmailSent: false
      };
    }
  }
}

export default NotificationService;