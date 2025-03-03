'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search , ChevronRight } from 'lucide-react';
import {cn} from '@repo/ui/cn'

// Define types with subcategory support
type CategoryStructure = {
  name: string;
  subCategories?: string[];
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

// Type for ProductImage remains the same as in your original code
type ProductImage = {
  index: number;
  image_key: string;
  image_url: string;
  is_main?: boolean;
};
export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryStructure[]>([{ name: 'All' }]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

  // Extract unique categories and subcategories
  const extractCategoriesAndSubcategories = (products: Product[]): CategoryStructure[] => {
    const categoriesMap = new Map<string, Set<string>>();

    products.forEach(product => {
      if (product.category && product.category.trim() !== '') {
        if (!categoriesMap.has(product.category)) {
          categoriesMap.set(product.category, new Set());
        }

        if (product.subCategory && product.subCategory.trim() !== '') {
          categoriesMap.get(product.category)!.add(product.subCategory);
        }
      }
    });

    
  // Create the categories structure, starting with 'All'
  const categoriesStructure: CategoryStructure[] = [
    { name: 'All' },
    ...Array.from(categoriesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b)) // Sort main categories alphabetically
      .map(([category, subCategories]) => ({
        name: category,
        subCategories: Array.from(subCategories).sort((a, b) => a.localeCompare(b)) // Sort subcategories alphabetically
      }))
  ];

    return categoriesStructure;
  };

  // Wrap fetchProducts in useCallback
  const fetchProducts = useCallback(async (category?: string, subCategory?: string) => {
    try {
      setIsLoading(true);
      let url = '/api/shop';

      if (category && category.toLowerCase() !== 'all') {
        url = subCategory 
          ? `/api/shop/${category.toLowerCase()}/${subCategory.toLowerCase()}`
          : `/api/shop/${category.toLowerCase()}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        setCategories(extractCategoriesAndSubcategories(data.products));
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle category and subcategory navigation
  const handleCategoryChange = (category: string, subCategory?: string) => {
    if (category === 'All') {
      router.push('/shop');
    } else if (subCategory) {
      router.push(`/shop/${category.toLowerCase()}/${subCategory.toLowerCase()}`);
    } else {
      router.push(`/shop/${category.toLowerCase()}`);
    }
  };

  // Parse pathname and fetch products
  useEffect(() => {
    const pathParts = pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2 && pathParts[0] === 'shop') {
      const category = pathParts[1];
      const subCategory = pathParts.length > 2 ? pathParts[2] : null;

      setSelectedCategory(category?category:'');
      setSelectedSubCategory(subCategory?subCategory:'');
      fetchProducts(category, subCategory?subCategory:'');
    } else {
      setSelectedCategory('All');
      setSelectedSubCategory(null);
      fetchProducts();
    }
  }, [pathname, fetchProducts]);

  // Render categories and subcategories
 
  // Modified renderCategories function for horizontal layout
  const renderCategories = () => {
    return (
      <>
        {/* Large Screen Vertical Layout */}
        <div className="hidden md:block">
          {categories.map((category) => {
            if (category.name === 'All') {
              return (
                <div key="all" className="mb-4">
                  <div
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-300",
                      selectedCategory === 'All'
                        ? " text-foreground font-bold"
                        : ""
                    )}
                    onClick={() => handleCategoryChange('All')}
                  >
                    <span>All Products</span>
                  </div>
                </div>
              );
            }

            const hasSubcategories = category.subCategories && category.subCategories.length > 0;

            return (
              <div key={category.name} className="mb-4 group">
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-300",
                    selectedCategory === category.name && !selectedSubCategory
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "hover:bg-gray-100 text-foreground/80",
                    hasSubcategories ? "" : "cursor-pointer"
                  )}
                  onClick={() => !hasSubcategories && handleCategoryChange(category.name)}
                  style={{ cursor: hasSubcategories ? 'default' : 'pointer' }}
                >
                  <span className="font-semibold">{category.name}</span>
                </div>

                {hasSubcategories && (
                  <div className="pl-2 mt-1 space-y-1">
                    {category.subCategories?.map((subCategory) => (
                      <div
                        key={`${category.name}-${subCategory}`}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-300 cursor-pointer",
                          selectedCategory === category.name && selectedSubCategory === subCategory
                            ? "text-foreground  font-bold"
                            : "hover:bg-gray-100 text-foreground/80"
                        )}
                        onClick={() => handleCategoryChange(category.name, subCategory)}
                      >
                        <span className="pl-2">{subCategory}</span>
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
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )}
                  onClick={() => handleCategoryChange('All')}
                >
                  All Products
                </button>
                
                {categories.map((categoryItem) => {
                  if (categoryItem.name === 'All') return null;
                  const hasSubcategories = categoryItem.subCategories && 
                    categoryItem.subCategories.length > 0;

                  return (
                    <button
                      key={categoryItem.name}
                      className={cn(
                        "px-6 py-3 rounded-full transition-colors duration-300 whitespace-nowrap",
                        selectedCategory === categoryItem.name && !selectedSubCategory
                          ? "bg-blue-100 text-blue-600 font-semibold"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      )}
                      onClick={() => {
                        if (hasSubcategories) {
                          setActiveCategory(categoryItem.name);
                        } else {
                          handleCategoryChange(categoryItem.name);
                        }
                      }}
                    >
                      {categoryItem.name}
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
                  .find(cat => cat.name === activeCategory)
                  ?.subCategories
                  ?.map((subCategory) => (
                    <button
                      key={subCategory}
                      className={cn(
                        "px-4 py-3 rounded-lg text-center transition-colors duration-300",
                        selectedSubCategory === subCategory
                          ? "bg-green-100 text-green-600 font-semibold"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      )}
                      onClick={() => handleCategoryChange(activeCategory, subCategory)}
                    >
                      {subCategory}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Loading and error states
  if (isLoading) return <div className="container mx-auto px-4 py-8 text-center">Loading products...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;

  return (
    <div className="w-full ">
      <div className="bg-backgroundImage min-h-[500px] h-[70vh] max-h-[800px] text-white w-full bg-cover bg-center flex justify-center items-center">
        <div className="flex flex-col gap-4 justify-center items-center">
          <h1 className="font-semibold  text-4xl md:text-5xl">Welcome To</h1>
          <h1 className="font-semibold  text-4xl md:text-5xl">Our Gallery</h1>
          <div className="relative w-[98%] sm:w-[500px] mt-11 mx-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-[60px] pl-10 pr-4 text-black border bg-transparent focus:outline-none"
            />
            <Search className="absolute top-1/2 left-3 font-extrabold transform -translate-y-1/2 text-white" />
            
            {/* Search Results Dropdown */}
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
                          alt={product.title}
                          loading='lazy'
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
      
      <div className="w-full max-h-[800px] overflow-auto h-screen  md:grid md:grid-cols-[3fr_7fr] lg:grid-cols-[2fr_8fr]  pt-10 px-4">
        {/* Categories section */}
        <div className="mb-8 md:h-full md:overflow-y-auto hide-scrollbar">
          <h2 className="text-xl font-bold mb-4 ">Categories</h2>
          {renderCategories()}
        </div>

        {/* Products Grid */}
        <div className="grid  grid-cols-2 sm:grid-cols-3 h-full overflow-y-auto hide-scrollbar md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
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
                  
                  <div className="py-4 w-full flex flex-col justify-between">
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
                            <div className="hidden lg:block text-foreground/60 text-sm">
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