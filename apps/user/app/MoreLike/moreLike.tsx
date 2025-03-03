'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  category: string | null;
  uploaded_at: string;
  product_images: ProductImage[];
};

type MoreLikeProps = {
  tags: string[];
  id: string;
};

export const MoreLike: React.FC<MoreLikeProps> = ({ tags, id }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (!tags || tags.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/moreLikes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tags, id }),
        });

        const data = await response.json();

        if (data.success) {
          setRecommendedProducts(data.recommended_products);
        } else {
          setError('Failed to fetch recommended products');
        }
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        setError('An error occurred while fetching recommended products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [tags, id]);

  if (isLoading) {
    return <div className="text-center py-4">Loading recommended products...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 w-full overflow-x-auto hide-scrollbar">
      <h2 className="text-2xl font-semibold mb-4">More Like This</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 h-full overflow-y-auto hide-scrollbar gap-4 auto-rows-auto">
        {recommendedProducts.map((product) => (
          <div key={product.id} className="relative h-full">
            <Link href={`/shop/product/${product.slug}`} className="group h-full">
              <div className="overflow-hidden h-full flex flex-col">
                {product.product_images && product.product_images.length > 0 ? (
                  <div className="relative w-full pt-[100%]">
                    <Image
                      loader={() => product.product_images[0]?.image_url || ''}
                      src={product.product_images[0]?.image_url || ''}
                      alt={product.title}
                      loading='lazy'
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300 absolute top-0 left-0"
                    />
                  </div>
                ) : (
                  <div className="w-full pt-[100%] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      No Image
                    </div>
                  </div>
                )}

                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 truncate">{product.title}</h2>
                    <div className="flex justify-between items-start">
                      <div className="text-gray-600">
                        {product.discount_rate !== null && product.discount_rate > 0 ? (
                          <>
                            <div className="line-through text-sm">${(product.price / 100).toFixed(2)}</div>
                            <div className="text-base font-medium">
                              ${(product.discountLessValue ? (product.discountLessValue / 100).toFixed(2) : "0.00")}
                            </div>
                          </>
                        ) : (
                          <div className="text-base font-medium">${(product.price / 100).toFixed(2)}</div>
                        )}
                      </div>

                      {product.discount_rate !== null && product.discount_rate > 0 && (
                        <div className="text-right">
                          <div className="text-green-600 text-sm font-medium">
                            {(product.discount_rate / 100)}% off
                          </div>
                          <div className="text-blue-600 text-sm">
                            Save ${(product.discount ? (product.discount / 100).toFixed(2) : "0.00")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};