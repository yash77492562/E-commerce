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
  price: number;
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/your_order');
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
          setFilteredOrders(data.orders);
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

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.order_status.toLowerCase() === statusFilter.toLowerCase()));
    }
  }, [statusFilter, orders]);

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setIsDropdownOpen(false);
  };

  if (loading) return <div className='pt-24 sm:pt-28 md:pt-36'>Loading orders...</div>;
  if (error) return <div className='pt-24 sm:pt-28 md:pt-36'>Error: {error}</div>;
  if (orders.length === 0) return <div className='pt-24 text-center sm:pt-28 md:pt-36'>No orders found.</div>;

  // Detailed order view
  if (selectedOrder) {
    return (
      <div className="min-h-screen w-full px-4 py-8 pt-24 sm:pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium">Order Details</h1>
            <button
              onClick={closeOrderDetails}
              className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="border rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Order ID: {selectedOrder.id}</p>
                  <p className="text-foreground/75">Status: {selectedOrder.order_status}</p>
                </div>
                <p className="text-lg font-medium">Total: ${(parseFloat(selectedOrder.total)/100).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-4">Items</h2>
              <div className="space-y-4">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="flex w-full border p-4 rounded-md">
                    <div className="w-24 h-28 flex-shrink-0 border mr-5">
                      {item.product.product_images.length > 0 && (
                        <Image
                          loader={() => item.product.product_images[0]?.url || ''}
                          src={item.product.product_images[0]?.url || ''}
                          alt={item.product.title}
                          loading='lazy'
                          width={96}
                          height={112}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-grow">
                      <h3 className="text-foreground text-lg">{item.product.title}</h3>
                      <div className="flex justify-between mt-3">
                        <p className="font-medium">Quantity: {item.quantity}</p>
                        <p className="font-medium">${(parseFloat(item.price.toString())/100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-3">Transaction Details</h2>
              <p>Transaction ID: {selectedOrder.transactionId}</p>
            </div>
            
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Shipping Details</h2>
              <div className="space-y-2 text-foreground/75">
                <p className="font-medium">{selectedOrder.name}</p>
                <p>{selectedOrder.phone}</p>
                <p>{`${selectedOrder.address}, ${selectedOrder.city}, ${selectedOrder.state} ${selectedOrder.pinCode}`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order listing view
  return (
    <div className="h-screen max-h-[800px] w-full px-4 py-8 pt-24 sm:pt-28 md:pt-36">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl ">Your Orders</h1>
          <div className="mt-4 sm:mt-0 border  relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 bg-secondary text-foreground/75 rounded-md flex items-center"
            >
              Filter by : {statusFilter === 'all' ? 'All Orders' : statusFilter}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background z-10 ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      statusFilter === 'all' ? 'bg-primary/10 text-primary' : 'text-foreground/75'
                    }`}
                  >
                    All Orders
                  </button>
                  <button
                    onClick={() => handleFilterChange('processing')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      statusFilter === 'processing' ? 'bg-primary/10 text-primary' : 'text-foreground/75'
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => handleFilterChange('out_for_delivery')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      statusFilter === 'out for delivery' ? 'bg-primary/10 text-primary' : 'text-foreground/75'
                    }`}
                  >
                    Out for Delivery
                  </button>
                  <button
                    onClick={() => handleFilterChange('delivered')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      statusFilter === 'delivered' ? 'bg-primary/10 text-primary' : 'text-foreground/75'
                    }`}
                  >
                    Delivered
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6 w-full  h-screen overflow-y-auto hide-scrollbar">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => selectOrder(order)}
              className="  overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Order Items - Minimal View */}
              <div className="grid grid-cols-1 gap-4 p-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row w-full border p-3 ">
                    <div className="w-20 h-24 flex-shrink-0 border mr-4">
                      {item.product.product_images.length > 0 && (
                        <Image
                          loader={() => item.product.product_images[0]?.url || ''}
                          src={item.product.product_images[0]?.url || ''}
                          alt={item.product.title}
                          loading='lazy'
                          width={80}
                          height={100}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-grow">
                      <h3 className="text-foreground truncate">{item.product.title}</h3>
                      <div className="flex justify-between mt-2">
                        <p className="text-foreground/75">Qty: {item.quantity}</p>
                        <p className="text-foreground/75">${(parseFloat(item.price.toString())/100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}