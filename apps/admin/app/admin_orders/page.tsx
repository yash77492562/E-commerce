'use client'
import React, { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import Image from 'next/image';

// Types matching the Prisma schema
interface ProductImage {
  url: string;
  is_main: boolean;
}

interface Product {
  id: string;
  title: string;
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
  order_status: 'processing' | 'out_for_delivery' | 'delivered';
  track_change_at: string;
  total: string;
  orderItems: OrderItem[];
  transactionId: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<{
    new: Order[];
    processing: Order[];
    outForDelivery: Order[];
    delivered: Order[];
  }>({
    new: [],
    processing: [],
    outForDelivery: [],
    delivered: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'processing' | 'outForDelivery' | 'delivered'>('new');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const response = await fetch('/api/admin_orders');
      const data = await response.json();
  
      if (data.success) {
        // Define the type for categorizedOrders explicitly
        const categorizedOrders: {
          new: Order[];
          processing: Order[];
          outForDelivery: Order[];
          delivered: Order[];
        } = {
          new: [],
          processing: [],
          outForDelivery: [],
          delivered: [],
        };
  
        data.orders.forEach((order: Order) => {
          // Check if order is from today
          const isNewToday = isToday(new Date(order.track_change_at));
  
          switch (order.order_status) {
            case 'processing':
              categorizedOrders.processing.push(order);
              break;
            case 'out_for_delivery':
              categorizedOrders.outForDelivery.push(order);
              break;
            case 'delivered':
              categorizedOrders.delivered.push(order);
              break;
          }
  
          // Add to new orders if status changed today
          if (isNewToday) {
            categorizedOrders.new.push(order);
          }
        });
  
        setOrders(categorizedOrders);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  

  async function updateOrderStatus(orderId: string, newStatus: Order['order_status']) {
    try {
      const response = await fetch('/api/admin_orders/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId, 
          newStatus 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refetch orders to get updated list
        await fetchOrders();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    }
  }

  function renderOrderCard(order: Order) {
    return (
      <div 
        key={order.id} 
        className="border rounded-lg p-4 mb-6 "
      >
        {/* Order ID and Date */}
        <div className="p-4 border-b">
          <p className="font-semibold">Order ID: {order.id}</p>
          <p className="text-sm text-gray-600">
            {format(new Date(order.track_change_at), 'PPp')}
          </p>
        </div>

        {/* Total Price */}
        <div className="p-4 border-b">
          <p className="font-bold text-lg">Total: ${Number(order.total)/100}</p>
        </div>

        {/* Order Items - Scrollable for all screen sizes */}
        <div className="grid grid-flow-col auto-cols-[100%] xs:auto-cols-[85%] sm:auto-cols-[80%] md:auto-cols-[60%] lg:auto-cols-[40%] gap-4 border-b p-4 w-full overflow-x-auto hide-scrollbar">
          {order.orderItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border p-4 rounded-md min-w-[250px]"
            >
              {item.product.product_images.length > 0 && (
                <div className="flex items-center">
                  <div className="mr-4 relative w-20 h-20">
                    <Image
                      loader={() => item.product.product_images[0]?.url || ''}
                      src={item.product.product_images[0]?.url || ''}
                      alt={item.product.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <h3 className="font-semibold">{item.product.title}</h3>
                </div>
              )}
              <div className="flex flex-col justify-center">
                <p className="font-medium">${Number(item.price)/100}</p>
                <p className="font-medium">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction ID and Status */}
        <div className="p-4 border-b space-y-2">
          <p className="font-semibold">Transaction ID: {order.transactionId}</p>
          <p className="font-medium">Status: {order.order_status}</p>
        </div>

        {/* Shipping Details */}
        <div className="p-4 border-b">
          <h4 className="font-semibold mb-2">Shipping Details</h4>
          <div className="space-y-1">
            <p className="font-medium">{order.name}</p>
            <p className="font-medium">{order.phone}</p>
            <p className="font-medium">
              {`${order.address}, ${order.city}, ${order.state} ${order.pinCode}`}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-4">
          {activeTab === 'processing' && (
            <button 
              onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Mark Out for Delivery
            </button>
          )}
          
          {activeTab === 'outForDelivery' && (
            <button 
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Mark as Delivered
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-ibisWhite pt-24 sm:pt-28 md:pt-36  w-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['new', 'processing', 'outForDelivery', 'delivered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded flex items-center ${
                activeTab === tab 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <span>
                {tab === 'new' ? 'New' : 
                 tab === 'processing' ? 'Processing' : 
                 tab === 'outForDelivery' ? 'Out for Delivery' : 
                 'Delivered'}
              </span>
              <span className="ml-2  text-black rounded-full px-2 text-sm">
                {orders[tab].length}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4 w-full h-screen overflow-y-auto hide-scrollbar">
          {orders[activeTab].length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No {activeTab} orders
            </div>
          ) : (
            orders[activeTab].map(renderOrderCard)
          )}
        </div>
      </div>
    </div>
  );
}