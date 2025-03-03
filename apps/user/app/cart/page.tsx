'use client'
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus } from 'lucide-react';
// Fix the import path
import useCartStore from '../../store/cartStore';

export default function ProductCard() {
  const { 
    cartProducts = [], 
    fetchCartProducts,
    removeFromCart, 
    updateQuantity, 
    calculateSubTotal 
  } = useCartStore();

  useEffect(()=>{
    fetchCartProducts();
  },[fetchCartProducts]);

  // Early return for loading state if needed
  const [isClient, setIsClient] = React.useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full pt-24 sm:pt-28 md:pt-36 lg:w-[80%] mx-auto">
      Loading...
    </div>;
  }

  const handleRemoveFromCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    await removeFromCart(productId);
    
    // Dispatch event to update NavBar cart count
    const event = new CustomEvent('cartItemRemoved');
    window.dispatchEvent(event);
  };


  return (
    <div className="w-full pt-24 sm:pt-28 md:pt-36 lg:w-[80%] mx-auto  min-h-screen overflow-y-auto hide-scrollbar sm:p-10 md:p-14 lg:p-20 space-y-4">
      <div className='sm:font-bold text-xl mb-4'>Shopping Bucket</div>
      
      {Array.isArray(cartProducts) && cartProducts.length > 0 ? (
        <>
          {cartProducts.map((product) => (
            <div 
              key={product?.id} 
              className="relative group"
            >
              <button
                onClick={(e) => product?.id && handleRemoveFromCart(product.id, e)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={24} />
              </button>

              <Link
                href={`/shop/product/${product?.slug || ''}`}
                className="flex flex-col  w-full sm:flex-row items-start sm:items-center border border-r-0 border-l-0 border-t-0 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {product?.product_images && product.product_images.length > 0 ? (
                  <div className="w-[150px] h-[200px] mr-4 sm:flex-shrink-0">
                    <Image
                      loader={() => product.product_images[0]?.image_url || ''}
                      src={product.product_images[0]?.image_url || ''}
                      alt={product.title || ''}
                      loading='lazy'
                      width={300}
                      height={500}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-[100px] h-[100px] bg-gray-200 mr-4 flex-shrink-0 flex items-center justify-center">
                    No Image
                  </div>
                )}
    
                {/* Content container */}
                <div className="flex-grow  w-full  h-full ">
                  {/* Mobile layout (below sm breakpoint) */}
                  <div className="flex  flex-col sm:flex-row sm:hidden  h-full w-full">
                    <div className="flex   flex-col gap-1 sm:gap-8 justify-between items-start w-full">
                      <h2 className="text-base w-full font-semibold mb-2 truncate flex-1 mr-2">{product.title}</h2>
                      <div className='border border-black '>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(product.id, product.quantity - 1);
                          }}
                          className="p-2  hover:bg-gray-100 rounded-l-full"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4  flex-grow text-center">{product.quantity}</span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(product.id, product.quantity + 1);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-r-full"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center  mt-2">
                      <div className="text-right">
                        {product.discount_rate !== null && product.discount ? (
                          <div className="flex flex-col">
                            {/* <span className="line-through text-gray-600">${(product.price/100).toFixed(2)}</span> */}
                            <span className=" font-foreground/75">${((product.discountLessValue || 0)/100).toFixed(2)}</span>
                          </div>
                        ) : (
                          <p>${(product.price/100).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout (sm and above) */}
                  <div className="hidden sm:flex flex-row gap-2 sm:gap-0 justify-between items-center w-full">
                    <div className="flex w-[150px] items-center">
                      <div className="mr-4 w-full">
                        <h2 className="text-lg font-semibold mb-2 truncate">{product.title}</h2>
                      </div>
                    </div>
                    
                    <div className="flex items-center border  w-[120px]">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(product.id, product.quantity - 1);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-l-full"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 flex-grow text-center">{product.quantity}</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(product.id, product.quantity + 1);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-r-full"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      {product.discount_rate !== null ? (
                        product.discount ? (
                          <div className='flex flex-col sm:block'>
                            <p className="text-gray-600">
                              {/* <span className="block md:inline mr-0 line-through md:mr-4">
                                ${(product.price/100).toFixed(2)}
                              </span> */}
                              <span className="block sm:inline font-semibold">
                                ${product.discountLessValue?.toFixed(2)}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <p>${(product.price/100).toFixed(2)}</p>
                        )
                      ) : (
                        <p>${(product.price/100).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {/* Subtotal and Checkout Section */}
          <div className="w-full flex justify-end mt-6">
            <div className="w-full sm:w-3/5 border p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Subtotal:</h3>
                <h3 className="text-xl font-semibold">${(calculateSubTotal()/100).toFixed(2)}</h3>
              </div>
              <Link 
                href="/order_summary" 
                className="w-full bg-gray-300 text-white py-3 hover:bg-gray-800 transition-colors text-center block"
              >
                Checkout
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-600">
          <p>Your cart is empty. Add items to get started!</p>
        </div>
      )}
    </div>
  );
}