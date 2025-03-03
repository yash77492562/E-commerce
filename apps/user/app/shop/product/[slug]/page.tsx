'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductImageGallery from '../../../components/draganddrop';
import { toast } from 'sonner';
import { MoreLike } from '../../../MoreLike/moreLike';

type ProductImage = {
  index: number;
  id: string;
  image_url: string;
  image_key: string;
  is_main?: boolean;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discount: number | null;
  discountLessValue: number | null;
  discount_rate: number | null;
  tags: string[];
  uploaded_at: string;
  product_images: ProductImage[];
};

// Login prompt component
const LoginPrompt = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-background p-8 max-w-md w-full mx-4">
      <h2 className="text-xl text-foreground font-bold mb-4">Login Required</h2>
      <p className="text-gray-800 mb-6">
        To add items to your cart and proceed with purchase, please login first. 
        From the cart, you can review your items and proceed to payment.
      </p>
      <Link 
        href="/auth/login"
        className="w-full border bg-black text-white py-3 px-6 text-center block transition-colors"
      >
        Login To Continue
      </Link>
    </div>
  </div>
);

export default function ProductDetailPage() {
  const params = useParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    const slugValue = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    setSlug(slugValue || null);
  }, [params]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/shop/product/${slug}`);
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('An error occurred while fetching product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const checkUserLogin = async () => {
    try {
      const response = await fetch("/api/checkUserLogin");
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setPriceLoading(true);
    setQuantity(newQuantity);
    // Simulate price calculation delay
    setTimeout(() => {
      setPriceLoading(false);
    }, 500);
  };

  const handleAddToCart = async () => {
    if (!product) {
      alert("Product not available.");
      return;
    }  
    const isLoggedIn = await checkUserLogin()
    
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      setIsAddingToCart(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          productId: product.id,
          quantity: quantity
        }),
      });

      if (response.ok) {
        setIsAdded(true);
        toast.success('Added to cart successfully');
        // Trigger a custom event to update cart count
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } else {
        toast.error("Failed to add to cart. Please try again.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) {
      alert("Product not available.");
      return;
    }  
    const isLoggedIn = await checkUserLogin()
    
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      // First add to cart
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          productId: product.id,
          quantity: quantity
        }),
      });

      if (response.ok) {
        // Navigate to order summary page
        window.location.href = "/order_summary";
      } else {
        toast.error("Failed to proceed. Please try again.");
      }
    } catch (error) {
      console.error("Error during buy now:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-screen">
        <div className="animate-pulse text-gray-600 font-semibold">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-screen">
        <div className="text-red-600 font-semibold text-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-screen">
        <div className="text-gray-600 font-semibold text-xl">
          Product not found
        </div>
      </div>
    );
  }

  // Calculate total price based on quantity
  const regularPrice = product.price * quantity;
  const discountedPrice = product.discountLessValue ? product.discountLessValue * quantity : null;
  const finalPrice = discountedPrice || regularPrice;

  return (<div className='flex w-full justify-center items-center'>
    {showLoginPrompt && <LoginPrompt />}
    <div className="w-full md:container px-4 pt-24 sm:pt-28 md:pt-36 py-8 min-h-screen">
      <div className="flex items-center space-x-2 text-sm text-foreground mb-8">
        <Link href="/shop" className="hover:underline font-sans text-foreground font-bold tracking-tight transition-colors">
          Shop
        </Link>
        <span className="font-bold text-xl">{'/'}</span>
        <span className="font-sans text-foreground font-bold tracking-tight">{product.title}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="w-full h-[90vh] relative">
          {product.product_images && product.product_images.length > 0 ? (
            <ProductImageGallery product={product} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center p-6">
                <svg 
                  className="mx-auto h-24 w-24 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-500">
                  No product images available
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8 p-4">
          <h1 className="font-sans text-foreground font-bold tracking-tight">
            {product.title || 'Untitled Product'}
          </h1>

          <div className="space-y-4">
            
            <div className="flex items-center space-x-2">
              {priceLoading ? (
                <span className="text-xl text-foreground/75 animate-pulse">Calculating...</span>
              ) : (
                <>
                  {(product.discount_rate ?? 0) > 0 && (
                    <span className="text-xl text-foreground/75 line-through">
                      ${(regularPrice / 100).toFixed(2)}
                    </span>
                  )}
                  <div className="h-full flex items-center">
                    <span className="text-xl text-foreground">
                      ${(finalPrice / 100).toFixed(2)}
                    </span>
                  </div>
                  {(product.discount_rate ?? 0) > 0 && (
                    <div className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Sale 
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="prose prose-lg text-foreground/75 whitespace-pre-wrap max-w-none">
            {product.description || 'No description available'}
          </div>

          <div className="pt-2 mb-4">
            <label htmlFor="quantity" className="block text-sm font-medium text-foreground/75 mb-2">
              Quantity
            </label>
            <div className="flex items-center w-1/3 border border-black  overflow-hidden">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-2  font-bold text-lg"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full text-center bg-background"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-2  font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <button
              className={`w-full md:w-2/3 px-8 py-4 border border-black text-black transition-all duration-200 text-lg shadow-sm `}
              onClick={handleAddToCart}
              disabled={isAdded || isAddingToCart}
            >
              {isAddingToCart ? (
                <div className="flex items-center justify-center">
                  <svg 
                    className="animate-spin h-5 w-5 text-current mr-2" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding to Cart...
                </div>
              ) : isAdded ? (
                "✓ Added to Cart"
              ) : (
                "Add to Cart"
              )}
            </button>
            
            <button
              className={`w-full md:w-2/3 px-8 py-4 bg-black text-white transition-all duration-200 text-lg shadow-sm `}
              onClick={handleBuyNow}
              disabled={isAddingToCart}
            >
              Buy it now
            </button>
          </div>
        </div>
      </div>

      <MoreLike tags={product.tags} id={product.id}></MoreLike>
    </div>
    </div>
  );
}