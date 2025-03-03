'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@repo/ui/input';
import { Button } from '@repo/ui/button';
import { Select } from '@repo/ui/select';
import { toast } from 'sonner';
import Image from 'next/image';

// Types and interfaces remain the same
type SearchType = 'phone_no' | 'order_id' | 'transaction_id' | 'phone' | 'email';

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

const ORDER_SEARCH_OPTIONS: { value: SearchType; label: string; }[] = [
  { value: 'phone_no', label: 'Phone Number' },
  { value: 'order_id', label: 'Order ID' },
  { value: 'transaction_id', label: 'Transaction ID' }
];

const USER_SEARCH_OPTIONS: { value: SearchType; label: string; }[] = [
  { value: 'phone', label: 'Phone Number' },
  { value: 'email', label: 'Email' }
];

export default function OrderQueryPage() {
  // Initialize state with null/empty values
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'user'>('orders');
  const [searchType, setSearchType] = useState<SearchType>('phone_no');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAutocompleteSuggestions = useCallback(async (query: string, type: SearchType) => {
    if (!query.trim() || !['order_id', 'transaction_id'].includes(type)) {
      setAutocompleteOptions([]);
      return;
    }

    try {
      const response = await fetch(`/api/query_orders/order?query=${query}&type=${type}`);
      const data = await response.json();
      
      if (data.success && data.results?.length > 0) {
        setAutocompleteOptions(data.results);
      } else {
        setAutocompleteOptions([]);
      }
    } catch (error) {
      console.error('Autocomplete fetch error:', error);
      setAutocompleteOptions([]);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'orders' && searchQuery.length >= 2) {
        fetchAutocompleteSuggestions(searchQuery, searchType);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType, activeTab, fetchAutocompleteSuggestions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'orders') {
        await handleOrderSearch();
      } else {
        await handleUserSearch();
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSearch = async () => {
    const response = await fetch('/api/query_orders/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchType, searchQuery })
    });

    const data = await response.json();

    if (data.success) {
      if (searchType === 'phone_no') {
        setOrders(data.orders);
        setLatestOrder(data.latestOrder);
        setTotalOrderCount(data.totalOrderCount);
        setShowAllOrders(false);
        toast.success(`Found ${data.totalOrderCount} orders`);
      } else {
        setOrders([data.order]);
        setLatestOrder(data.order);
        toast.success('Order found successfully');
      }
    } else {
      resetSearch();
      toast.error(data.message || 'No order found');
    }
  };

  const handleUserSearch = async () => {
    const validationResponse = await fetch('/api/query_orders/user/check_user_validation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: searchType, value: searchQuery })
    });

    const validationData = await validationResponse.json();

    if (validationData.success && validationData.data?.userId) {
      const ordersResponse = await fetch('/api/query_orders/user/getting_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: validationData.data.userId })
      });

      const ordersData = await ordersResponse.json();

      if (ordersData.success) {
        setOrders(ordersData.orders);
        setLatestOrder(ordersData.orders[0] || null);
        toast.success('Orders found successfully');
      } else {
        resetSearch();
        toast.error('No orders found for this user');
      }
    } else {
      resetSearch();
      toast.error(validationData.message || 'User validation failed');
    }
  };

  const resetSearch = () => {
    setOrders([]);
    setLatestOrder(null);
    setTotalOrderCount(0);
    setShowAllOrders(false);
    setSearchQuery('');
    setAutocompleteOptions([]);
  };

  const handleTabChange = (tab: 'orders' | 'user') => {
    setActiveTab(tab);
    setSearchType(tab === 'orders' ? 'phone_no' : 'phone');
    resetSearch();
  };

  // Only render content after mounting
  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-ibisWhite pt-24 sm:pt-28 md:pt-36">
      <div className="flex mb-6">
        <Button 
          variant={activeTab === 'orders' ? 'default' : 'outline'}
          onClick={() => handleTabChange('orders')}
          className="mr-4"
        >
          Orders
        </Button>
        <Button 
          variant={activeTab === 'user' ? 'default' : 'outline'}
          onClick={() => handleTabChange('user')}
        >
          User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <Select<SearchType>
          value={searchType}
          onValueChange={setSearchType}
          options={activeTab === 'orders' ? ORDER_SEARCH_OPTIONS : USER_SEARCH_OPTIONS}
        />
        <div className="flex-grow relative w-full sm:w-auto">
          <Input 
            type="text"
            name="search"
            placeholder={`Enter ${searchType.replace('_', ' ')}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {autocompleteOptions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1">
              {autocompleteOptions.map((option) => (
                <div 
                  key={option}
                  onClick={() => {
                    setSearchQuery(option);
                    setAutocompleteOptions([]);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button 
            onClick={handleSearch}
            className="flex-1 sm:flex-none"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          <Button 
            onClick={resetSearch} 
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {orders.length > 0 && (
        <div className="min-h-screen w-full">
          <div className="space-y-6">
          {(showAllOrders ? orders : [latestOrder]).filter((order): order is Order => order !== null).map((order) => (
              <div key={order.id} className="border rounded-lg p-4 shadow-md">
                {/* Order header */}
                <div className="flex flex-col sm:flex-row justify-between p-4 border-b mb-4">
                  <p className="font-semibold">Order ID: {order.id}</p>
                  <p className="font-bold text-lg mt-2 sm:mt-0">Total: ${Number(order.total)/100}</p>
                </div>

                {/* Order items */}
                <div className="grid grid-flow-col auto-cols-[100%] xs:auto-cols-[85%] sm:auto-cols-[80%] md:auto-cols-[60%] lg:auto-cols-[40%] gap-4 border-b p-4 w-full overflow-x-auto hide-scrollbar">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between border p-4 rounded-md min-w-[250px]">
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
                        <p className="font-medium">${Number(item.price)/100}</p>
                        <p className="font-medium">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transaction info */}
                <div className="p-4 flex flex-col sm:flex-row justify-between">
                  <p className="font-semibold">Transaction ID: {order.transactionId}</p>
                  <p className="font-medium mt-2 sm:mt-0">Status: {order.order_status}</p>
                </div>

                {/* Shipping details */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold mb-2">Shipping Details</h4>
                  <div className="space-y-1">
                    <p className="font-medium">{order.name}</p>
                    <p className="font-medium">{order.phone}</p>
                    <p className="font-medium">
                      {`${order.address}, ${order.city}, ${order.state} ${order.pinCode}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View all orders button */}
          {!showAllOrders && totalOrderCount > 1 && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => setShowAllOrders(true)} 
                variant="outline"
              >
                View All {totalOrderCount} Orders
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}