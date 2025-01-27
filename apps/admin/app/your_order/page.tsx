'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductImage {
  url: string;
  is_main: boolean;
}

interface Product {
  id: string;
  title: string;
  price: number;
  product_images: ProductImage[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: Product;
}

interface Order {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  order_status: string;
  total: string;
  orderItems: OrderItem[];
  transactionId: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/your_order');
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;
  if (orders.length === 0) return <div>No orders found.</div>;

  return (
    <div className="min-h-screen w-full  px-4 py-8 pt-28 sm:pt-32 md:pt-36">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="space-y-6 w-full h-screen overflow-y-auto hide-scrollbar">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="border rounded-lg p-4  shadow-md"
            >
              <div className="flex flex-col sm:flex-row justify-between p-4 border-b mb-4">
                <div>
                  <p className="font-semibold">Order ID: {order.id}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="font-bold text-lg">Total: ${order.total}</p>
                </div>
              </div>
              
              <div className="grid grid-flow-col auto-cols-[100%] xs:auto-cols-[85%] sm:auto-cols-[80%] md:auto-cols-[60%] lg:auto-cols-[40%] gap-4 border-b p-4 w-full overflow-x-auto hide-scrollbar">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border p-4 rounded-md min-w-[250px]"
                  >
                    {item.product.product_images.length > 0 && (
                      <div className="flex items-center">
                        <div className="mr-4">
                          <Image
                            loader={() => item.product.product_images[0]?.url || ''}
                            src={item.product.product_images[0]?.url || ''}
                            alt={item.product.title}
                            width={80}
                            height={80}
                            className="object-cover rounded"
                          />
                        </div>
                        <h3 className="font-semibold">{item.product.title}</h3>
                      </div>
                    )}
                    <div className="flex flex-col justify-center">
                      <p className="font-medium">${item.price}</p>
                      <p className="font-medium">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="p-4 flex flex-col sm:flex-row justify-between">
                  <p className="font-semibold">Transaction ID: {order.transactionId}</p>
                  <p className="font-medium mt-2 sm:mt-0">Status: {order.order_status}</p>
                </div>
              </div>
    
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-2">Shipping Details</h4>
                <div className="space-y-1">
                  <p className="font-medium">{order.name}</p>
                  <p className="font-medium">{order.phone}</p>
                  <p className="font-medium">{`${order.address}, ${order.city}, ${order.state} ${order.pinCode}`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}