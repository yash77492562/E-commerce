'use client'

import React, { useState, useCallback ,useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '../../store/cartStore';

type ShippingDetails = {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  landmark: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
};

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Order Summary', 'Shipping Details', 'Payment', 'Confirmation'];
  
  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <div className="flex md:flex-col min-w-max md:min-w-0 gap-3 md:space-y-2 px-2">
        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`whitespace-nowrap px-6 py-2 text-center ${
              currentStep > index 
                ? 'bg-green-500 text-white' 
                : currentStep === index 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

const ShippingDetailsStep = React.memo(({
  shippingDetails,
  onInputChange
}: {
  shippingDetails: ShippingDetails;
  onInputChange: (name:string,value:string) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.keys(shippingDetails) as Array<keyof ShippingDetails>).map((key) => (
        <input
          key={key}
          name={key}
          type="text"
          value={shippingDetails[key]}
          onChange={(e) => onInputChange(key, e.target.value)}  // Updated
          onBlur={(e) => onInputChange(key, e.target.value)}    // Updated
          placeholder={key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())}
          className={`border p-2 ${
            key === 'address' ? 'col-span-2 w-full' : ''
          }`}
          required
        />
      ))}
    </div>
  );
});

ShippingDetailsStep.displayName = 'ShippingDetailsStep';

export default function OrderSummaryPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    landmark: '',
    country: '',
    state: '',
    city: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');

  const { 
    cartProducts, 
    removeFromCart, 
    calculateSubTotal,
    clearCart,
    fetchCartProducts
  } = useCartStore();

  useEffect(() => {
    setIsClient(true);
    fetchCartProducts();
  }, [fetchCartProducts]);
  const TAX = 0;
  const SHIPPING = 0;

  const handleShippingInputChange = useCallback((name: string, value: string) => {
    setShippingDetails(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  }, []);
// Skip hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="w-full pt-24 sm:pt-28 md:pt-32 h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  const OrderSummaryStep = () => {
    const products = cartProducts || [];
    const subTotal = calculateSubTotal();
    const total = subTotal + TAX + SHIPPING;

    return (
      <div className="flex flex-col space-y-4">
        {products.length === 0 ? (
          <div className="text-center">
            <p>Your cart is empty.</p>
            <Link 
              href="/shop" 
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex justify-between border-b pb-4"
              >
                {product.product_images && product.product_images.length > 0 ? (
                  <div className='flex gap-3'>
                    <Image
                      loader={() => product.product_images[0]?.image_url || ''}
                      src={product.product_images?.[0]?.image_url ?? '/placeholder-image.jpg'}
                      alt={product.title}
                      loading='lazy'
                      width={100}
                      height={100}
                      className="object-cover mr-4"
                    />
                    <h3 className="text-lg font-semibold">{product.title}</h3>
                  </div>
                ) : (
                  <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center mr-4">
                    No Image
                  </div>
                )}
                
                <div className="flex-col h-full flex gap-2">
                  <p className='font-semibold'>
                    ${(product.discountLessValue || product.price).toFixed(2)}
                  </p>
                  <p className='font-semibold'>Qty: {product.quantity}</p>
                  <button 
                    onClick={() => removeFromCart(product.id)}
                    className="text-gray-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="mt-6 space-y-2">
              <p className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subTotal.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span>Tax:</span>
                <span>${TAX.toFixed(2)}</span>
              </p>
              <p className="flex font-semibold justify-between">
                <span>Shipping:</span>
                <span>${SHIPPING.toFixed(2)}</span>
              </p>
              <p className="flex justify-between font-bold text-xl">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  const PaymentStep = React.memo(() => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="creditCard"
              checked={paymentMethod === 'creditCard'}
              onChange={() => setPaymentMethod('creditCard')}
            />
            <span>Credit Card</span>
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={() => setPaymentMethod('paypal')}
            />
            <span>PayPal</span>
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="bankTransfer"
              checked={paymentMethod === 'bankTransfer'}
              onChange={() => setPaymentMethod('bankTransfer')}
            />
            <span>Bank Transfer</span>
          </label>
        </div>
      </div>
    );
  });

  PaymentStep.displayName = 'PaymentStep';

  const ConfirmationStep = React.memo(() => {
    const handlePlaceOrder = async () => {
      try {
        // Validate data before sending
        if (!cartProducts.length) {
          console.error('No products in cart');
          return;
        }
    
        const orderPayload = {
          cartProducts: cartProducts.map(product => ({
            id: product.id,
            quantity: product.quantity,
            price: product.discountLessValue || product.price
          })),
          shippingDetails: {
            firstName: shippingDetails.firstName,
            lastName: shippingDetails.lastName,
            address: shippingDetails.address,
            phone: shippingDetails.phone,
            landMark: shippingDetails.landmark,
            country: shippingDetails.country,
            state: shippingDetails.state,
            city: shippingDetails.city,
            postalCode: shippingDetails.postalCode
          },
          paymentMethod,
          subtotal: calculateSubTotal(),
          tax: TAX,
          shipping: SHIPPING,
          total: calculateSubTotal() + TAX + SHIPPING
        };
    
    
        const orderResponse = await fetch('/api/order_summary', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });
    
        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.message || 'Failed to create order');
        }
    
        const orderData = await orderResponse.json();
        
        // Continue with email notification only if order creation was successful
        if (orderData.order) {
          // Send email notification
          const emailResponse = await fetch('/api/send-order-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.order.id,
              transactionId: orderData.order.transactionId,
              customerName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
              orderDetails: {
                address: shippingDetails.address,
                phone: shippingDetails.phone
              },
              products: cartProducts.map(product => ({
                title: product.title,
                quantity: product.quantity,
                price: product.price,
                discountLessValue: product.discountLessValue,
                imageUrl: product.product_images?.[0]?.image_url || '',
                imageKey:product.product_images?.[0]?.image_key || ''
              })),
              totals: {
                subtotal: calculateSubTotal(),
                tax: TAX,
                shipping: SHIPPING,
                total: calculateSubTotal() + TAX + SHIPPING
              }
            })
          });
    
          if (emailResponse.ok) {
            clearCart();
          }
        }
      } catch (error) {
        console.error('Order placement error:', error);
        // Handle error appropriately (show error message to user)
      }
    };
  
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Order Placed Successfully!
        </h2>
        <p>Thank you for your purchase.</p>
        <Link 
          href="/shop" 
          className="mt-4 inline-block  text-customText px-4 py-2 rounded"
          onClick={handlePlaceOrder}
        >
          <h2 className="text-2xl font-bold   mb-4"> 
            Continue Shopping
          </h2>
        </Link>
      </div>
    );
  });

  ConfirmationStep.displayName = 'ConfirmationStep';

  

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 0: 
        return <OrderSummaryStep />;
      case 1: 
        return (
          <ShippingDetailsStep 
            shippingDetails={shippingDetails}
            onInputChange={handleShippingInputChange}
          />
        );
      case 2: 
        return <PaymentStep />;
      case 3: 
        return <ConfirmationStep />;
      default: 
        return null;
    }
  };

  
  return (
    <div className='w-full pt-24 sm:pt-28 md:pt-32 h-screen flex items-center justify-center'>
      <div className="w-full md:w-[90%] lg:w-[70%] h-full mx-auto px-4 gap-4 md:gap-0 pb-8 flex flex-col md:flex-row">
        <div className="w-full md:w-[30%] flex md:flex-col overflow-x-auto hide-scrollbar md:overscroll-x-none gap-6 justify-evenly h-[10%] md:h-full pr-4">
          <StepIndicator currentStep={currentStep} />
        </div>
        
        <div className="md:w-[70%] h-full md:h-auto bg-white overflow-y-auto hide-scrollbar rounded-lg p-6">
          {renderCurrentStep()}
          
          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Back
              </button>
            )}
            {currentStep < 3 && cartProducts?.length > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="ml-auto bg-blue-500 text-white px-4 py-2 rounded"
                disabled={currentStep === 1 && !Object.values(shippingDetails).every(val => val.trim() !== '')}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}