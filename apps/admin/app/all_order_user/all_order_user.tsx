// 'use client'
// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { toast } from 'sonner';

// interface ProductImage {
//   url: string;
//   is_main: boolean;
// }

// interface Product {
//   id: string;
//   title: string;
//   price: number;
//   product_images: ProductImage[];
// }

// interface OrderItem {
//   id: string;
//   quantity: number;
//   price: string;
//   product: Product;
// }

// interface Order {
//   id: string;
//   name: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   pinCode: string;
//   order_status: string;
//   total: string;
//   orderItems: OrderItem[];
//   transactionId: string;
// }

// interface OrdersPageProps {
//   initialPhone?: string;
// }

// export default function OrdersPage({ initialPhone }: OrdersPageProps) {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showAllOrders, setShowAllOrders] = useState(false);

//   useEffect(() => {
//     async function fetchOrders() {
//       try {
//         const url = initialPhone 
//           ? `/api/your_orders?phone=${initialPhone}` 
//           : '/api/your_orders';
        
//         const response = await fetch(url);
//         const data = await response.json();

//         if (data.success) {
//           setOrders(data.orders);

//           // Show toast notification for multiple orders
//           if (data.totalOrderCount > 1) {
//             toast.info(`Found ${data.totalOrderCount} orders for this phone number`, {
//               description: 'Click to view all orders'
//             });
//           }
//         } else {
//           setError(data.message);
//         }
//       } catch (err) {
//         setError('Failed to fetch orders');
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchOrders();
//   }, [initialPhone]);

//   if (loading) return <div>Loading orders...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (orders.length === 0) return <div>No orders found.</div>;

//   // If multiple orders, show the most recent order by default
//   const ordersToDisplay = showAllOrders ? orders : [orders[0]];

//   return (
//     <div className="container h-screen  flex justify-center mx-auto px-4 py-8 pt-28 sm:pt-32 md:pt-36 ">
//       <div className='border'>
//         <h1 className="text-2xl font-bold mb-6">
//           {initialPhone ? `Orders for ${initialPhone}` : 'Your Orders'}
//         </h1>

//         {orders.length > 1 && !showAllOrders && (
//           <div className="p-4 bg-blue-100 text-blue-800 mb-4">
//             <p>
//               {`${orders.length - 1} more order${orders.length > 2 ? 's' : ''} found for this phone number.`}
//               <button 
//                 onClick={() => setShowAllOrders(true)} 
//                 className="ml-2 underline"
//               >
//                 View All Orders
//               </button>
//             </p>
//           </div>
//         )}

//         <div className='w-full h-[90%] overflow-y-auto hide-scrollbar'>
//           {ordersToDisplay.map((order) => (
//             <div 
//               key={order!.id} 
//               className="border rounded-lg p-6 mb-6  shadow-md"
//             >
//               <div className="flex justify-between p-4 border-b mb-4">
//                 <div>
//                   <p className="font-semibold">Order ID: {order!.id}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-bold text-lg">Total: ${order!.total}</p>
//                 </div>
//               </div>
//               <div className="grid grid-flow-col auto-cols-[40%] gap-4 border-b p-4 w-full overflow-x-auto hide-scrollbar">
//                 {order!.orderItems.map((item) => (
//                   <div
//                     key={item.id}
//                     className="flex justify-between border p-4 rounded-md"
//                   >
//                     {item.product.product_images.length > 0 && (
//                       <div className='flex'>
//                         <div className="mr-4">
//                           <Image
//                             loader={() => item.product.product_images[0]?.url || ''}
//                             src={item.product.product_images[0]?.url || ''}
//                             alt={item.product.title}
//                             width={100}
//                             height={100}
//                             className="object-cover rounded"
//                           />
//                         </div>
//                         <h3 className="font-semibold">{item.product.title}</h3>
//                       </div>
//                     )}
//                     <div>
//                       <p className='font-medium'>${item.price}</p>
//                       <p className='font-medium'>Qty: {item.quantity}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div>
//                 <div className='p-4 flex justify-between'>
//                   <p className="font-semibold">Transaction ID: {order!.transactionId}</p>
//                   <p className='font-medium'>Status: {order!.order_status}</p>
//                 </div>
//               </div>
    
//               <div className="mt-6 border-t pt-4">
//                 <h4 className="font-semibold mb-2">Shipping Details</h4>
//                 <p className='font-medium pl-4'>{order!.name}</p>
//                 <p className='font-medium pl-4'>{order!.phone}</p>
//                 <p className='font-medium pl-4'>{`${order!.address}, ${order!.city}, ${order!.state} ${order!.pinCode}`}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }