'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import useCartStore from '../../store/cartStore'
import Image from 'next/image'
import { Trash2, Plus, Minus } from 'lucide-react'


// Define the component props type
type CartComponentProps = Record<string, never>

// Add proper typing for the dynamic component
const CartComponent = dynamic<CartComponentProps>(
  () =>
    Promise.resolve(() => {
      const { 
        cartProducts, 
        fetchCartProducts, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        calculateSubTotal,
        loading,
        error 
      } = useCartStore()
      
      useEffect(() => {
        fetchCartProducts()
      }, [fetchCartProducts])

      if (loading) return <div>Loading...</div>
      if (error) return <div>Error: {error}</div>
      if (cartProducts.length === 0) return <div>Your cart is empty</div>

      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
          
          <div className="bg-white rounded-lg shadow-md">
            {cartProducts.map((item) => (
              <div key={item.id} className="flex items-center p-4 border-b">
                <div className="flex-shrink-0 w-24 h-24 relative">
                  {item.product_images[0] && (
                    <Image
                      src={item.product_images[0].image_url}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                    />
                  )}
                </div>
                
                <div className="flex-grow ml-4">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <div className="text-gray-600">
                    Price: ${item.discountLessValue ?? item.price}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus size={20} />
                  </button>
                  
                  <span className="w-8 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            
            <div className="p-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Subtotal:</span>
                <span className="text-xl">${calculateSubTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
                
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }),
  { ssr: false }
)

export default function ZustandPage() {
  return <CartComponent />
}