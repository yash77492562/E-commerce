'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search,ChevronRight } from 'lucide-react';
import { cn } from '@repo/ui/cn';

type ProductImage = {
  index: number;
  image_key: string;
  image_url: string;
  is_main?: boolean;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discount: number | null;
  discount_rate: number | null;
  discountLessValue: number | null;
  tags: string[];
  category: string | null;
  subCategory: string | null;
  uploaded_at: string;
  product_images: ProductImage[];
};

// Define types with subcategory support
type CategoryStructure = {
  category: string;
  subCategory: string | null;
};

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryStructure[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const router = useRouter();


  // Debounce search query and perform search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
  
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim() === '') {
        setSearchResults([]);
        return;
      }
  
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: debouncedQuery.trim() }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          setSearchResults(data.search_products);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };
  
    performSearch();
  }, [debouncedQuery]);

  const fetchProducts = async (category: string) => {
    try {
      setIsLoading(true);
      const url = `/api/shop/${category}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);      
  
        // Create a normalized categories list with unique categories
        const uniqueCategories: CategoryStructure[] = [
          { category: 'All', subCategory: null },
          ...data.category
        ];
    
        setCategories(uniqueCategories);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching products');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category and subcategory navigation
  const handleCategoryChange = (category: string, subCategory?: string | null) => {
    if (category === 'All') {
      router.push('/shop');
    } else if (subCategory) {
      router.push(`/shop/${category.toLowerCase()}/${subCategory.toLowerCase()}`);
    } else {
      router.push(`/shop/${category.toLowerCase()}`);
    }
  };

  // Render categories and subcategories
  const renderCategories = () => {
    const uniqueCategories = Array.from(new Set(categories.map(cat => cat.category)))
      .sort((a, b) => a.localeCompare(b));

    return (
      <>
        {/* Large Screen Vertical Layout */}
        <div className="hidden md:block">
          {uniqueCategories.map((category) => {
            const categorySubcategories = categories.filter(
              cat => cat.category === category && cat.subCategory !== null
            ).sort((a, b) => (a.subCategory || '').localeCompare(b.subCategory || ''));

            const hasSubcategories = categorySubcategories.length > 0;

            if (category === 'All') {
              return (
                <div key="all" className="mb-4">
                  <Link
                    href="/shop"
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-300",
                      selectedCategory === 'All'
                        ? "bg-blue-500 text-white font-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <span>All Products</span>
                  </Link>
                </div>
              );
            }

            return (
              <div key={category} className="mb-4 group">
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-300",
                    selectedCategory === category.toLowerCase() && !selectedSubCategory
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                  onClick={() => !hasSubcategories && handleCategoryChange(category)}
                >
                  <span className="font-semibold">{category}</span>
                </div>

                {hasSubcategories && (
                  <div className="pl-2 mt-1 space-y-1">
                    {categorySubcategories.map((subCat) => (
                      <div
                        key={`${category}-${subCat.subCategory}`}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-300 cursor-pointer",
                          selectedSubCategory === subCat.subCategory?.toLowerCase()
                            ? "text-green-500 bg-blue-100 font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                        onClick={() => handleCategoryChange(category, subCat.subCategory)}
                      >
                        <span className="pl-2">{subCat.subCategory}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Small Screen Horizontal Layout */}
        <div className="md:hidden">
          {!activeCategory ? (
            <div className="w-full overflow-x-auto hide-scrollbar">
              <div className="flex gap-4 pb-4 min-w-max">
                <button
                  className={cn(
                    "px-6 py-3 rounded-full transition-colors duration-300 whitespace-nowrap",
                    selectedCategory === 'All'
                      ? " text-foreground"
                      : "hover:bg-gray-100 text-font-foreground/80"
                  )}
                  onClick={() => handleCategoryChange('All')}
                >
                  All Products
                </button>
                
                {uniqueCategories.map((category) => {
                  if (category === 'All') return null;
                  const hasSubcategories = categories.some(
                    cat => cat.category === category && cat.subCategory !== null
                  );

                  return (
                    <button
                      key={category}
                      className={cn(
                        "px-6 py-3 rounded-full transition-colors duration-300 whitespace-nowrap",
                        selectedCategory === category.toLowerCase() && !selectedSubCategory
                        ? " text-foreground"
                        : "hover:bg-gray-100 text-font-foreground/80"
                      )}
                      onClick={() => {
                        if (hasSubcategories) {
                          setActiveCategory(category);
                        } else {
                          handleCategoryChange(category);
                        }
                      }}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <ChevronRight className="rotate-180 w-5 h-5" />
                  <span>Back to Categories</span>
                </button>
                <h3 className="font-semibold text-lg">{activeCategory}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {categories
                  .filter(cat => cat.category === activeCategory && cat.subCategory !== null)
                  .map((subCat) => (
                    <button
                      key={subCat.subCategory}
                      className={cn(
                        "px-4 py-3 rounded-lg text-center transition-colors duration-300",
                        selectedSubCategory === subCat.subCategory?.toUpperCase()
                        ? " text-foreground"
                        : "hover:bg-gray-100 text-font-foreground/80"
                      )}
                      onClick={() => handleCategoryChange(activeCategory, subCat.subCategory)}
                    >
                      {subCat.subCategory}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  useEffect(() => {
    const categoryFromUrl = decodeURIComponent(params.category as string)

    setSelectedCategory(categoryFromUrl || 'All');
    
    if (categoryFromUrl) {
      fetchProducts(categoryFromUrl);
    } else {
      fetchProducts('All');
    }
  }, [params.category]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full  overflow-y-auto hide-scrollbar">
      <div className="bg-marvel h-[70vh] text-white w-full bg-cover bg-center flex justify-center items-center">
        <div className="flex flex-col gap-4 justify-center items-center">
          <h1 className="font-semibold text-4xl md:text-5xl">Welcome To</h1>
          <h1 className="font-semibold text-4xl md:text-5xl">Our Gallery</h1>
          <div className="relative w-[500px] mt-10 mx-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-[60px] pl-10 pr-4 text-white border bg-transparent focus:outline-none"
            />
            <Search className="absolute top-1/2 left-3 font-extrabold transform -translate-y-1/2 text-white" />
            
            {searchResults.length > 0 && debouncedQuery.trim() !== '' && (
              <div className="absolute top-full left-0 w-full max-h-[400px] overflow-y-auto bg-white text-black shadow-lg z-50 hide-scrollbar">
                {searchResults.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/shop/product/${product.slug}`}
                    className="flex p-2 hover:bg-gray-100 items-center"
                  >
                    <div className="w-[50px] h-[50px] mr-4 flex-shrink-0">
                      {product.product_images && product.product_images.length > 0 ? (
                        <Image
                          loader={() => product.product_images[0]?.image_url || ''}
                          src={product.product_images[0]?.image_url || ''}
                          loading='lazy'
                          alt={product.title}
                          width={50}
                          height={50}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="w-full h-screen md:grid md:grid-cols-[3fr_7fr] lg:grid-cols-[2fr_8fr] min-h-screen pt-10 px-4">
        {/* Categories section */}
        <div className="mb-8 md:h-full md:overflow-y-auto hide-scrollbar">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Categories</h2>
          {renderCategories()}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 h-full overflow-y-auto hide-scrollbar md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
          {products.map((product: Product) => (
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
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300 absolute top-0 left-0"
                      />
                    </div>
                  ) : (
                    <div className="w-full pt-[100%] relative bg-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                        No Image
                      </div>
                    </div>
                  )}
                  
                  <div className="py-4 flex flex-col justify-between">
                    <div className=' flex flex-col gap-2'>
                      <h2 className="font-sans text-foreground font-medium tracking-tight">{product.title}</h2>
                      <div className="flex justify-between  items-start">
                        <div className="text-gray-600 ">
                          {product.discount_rate !== null && product.discount_rate > 0 ? (
                            <>
                              <div className="line-through text-sm pb-1">${(product.price / 100).toFixed(2)}</div>
                              <div className="text-base font-medium">${(product.discountLessValue ? (product.discountLessValue / 100).toFixed(2) : "0.00")}</div>
                            </>
                          ) : (
                            <div className="text-base font-medium pb-1">${(product.price / 100).toFixed(2)}</div>
                          )}
                        </div>
                        
                        {product.discount_rate !== null && product.discount_rate > 0 && (
                          <div className="text-right">
                            <div className="text-foreground/60 pb-1 text-sm font-medium">
                              {(product.discount_rate / 100)}% off
                            </div>
                            <div className="text-foreground/60 text-sm">
                              Save ${(product.discount ? product.discount / 100 : 0 / 100).toFixed(2)}
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

        {products.length === 0 && (
          <div className="text-center text-gray-500 py-12">No products available at the moment</div>
        )}
      </div>
      </div>
  );
}
