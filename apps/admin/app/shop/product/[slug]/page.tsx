'use client'
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X} from 'lucide-react';
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
  category: string | null;
  subCategory: string | null;
  uploaded_at: string;
  product_images: ProductImage[];
};


type SubCategoryResponse = {
  success: boolean;
  search_products: Array<{
    subCategory: string | null;
  }>;
  requiresConfirmation: boolean;
  message: string;
};

type UpdateData = {
  [key: string]: string | number | null | boolean | undefined;
  price?: number;
  discount?: number | null;
  discountLessValue?: number | null;
  discount_rate?: number;
  subCategory?: string | null;
  category?: string;
  updateDefaultSubCategory?: boolean;
};

export default function ProductDetailPage() {
  const params = useParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('');
  const [subCategories, setSubCategories] = useState<string[] >([]);

  useEffect(() => {
    const slugValue = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    setSlug(slugValue || null);
  }, [params]);

  // Wrap fetchSubCategories with useCallback
  const fetchSubCategories = useCallback(async () => {
    if (!product?.category) return;

    try {
      const response = await fetch('/api/subCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: product.category }),
      });

      const data: SubCategoryResponse = await response.json();
      if (data.success) {
        const uniqueSubCategories = Array.from(new Set(
          data.search_products
            .map(p => p.subCategory)
            .filter((sc): sc is string => sc !== null)
        ));
        setSubCategories(uniqueSubCategories);
      }
    } catch (error) {
      console.error('Error fetching subCategories:', error);
    }
  }, [product?.category]);

  // Update useEffect to include fetchSubCategories dependency
  useEffect(() => {
    if (product?.category) {
      fetchSubCategories();
    }
  }, [product?.category, fetchSubCategories]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/shop/product/${slug}`);
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
          setSelectedImage(data.product.product_images[0]?.image_url || null);
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

  const calculateDiscountDetails = (price: number, discountRate: number | null) => {
    const discountRateNum = discountRate ?? 0;
    
    if (!discountRateNum || discountRateNum <= 0 || isNaN(price)) {
      return { 
        price: price * 100, 
        discount: null, 
        discountLessValue: null, 
        discount_rate: 0 
      };
    }
    
    const discountAmount = Math.round((price * discountRateNum) / 100);
    return {
      price: price * 100,
      discount: discountAmount * 100,
      discountLessValue: (price - discountAmount) * 100,
      discount_rate: (discountRate || 0) * 100
    };
  };

  // Update handleFieldEdit to use UpdateData type
  const handleFieldEdit = async (field: string, value: string) => {
    if (!product) return;
  
    try {
      let updateData: UpdateData = { [field]: value };
  
      if (field === 'price') {
        const priceNum = Number(value);
        const discountRate = Number(product.discount_rate);
        const discountRateNum = discountRate ? discountRate : 0;
        if (discountRateNum > 0) {
          const discountDetails = calculateDiscountDetails(priceNum, discountRate / 100);
          updateData = discountDetails;
        } else {
          updateData = { price: priceNum * 100 };
        }
      } else if (field === 'discount_rate') {
        const discountRateNum = Number(value);
        const price = product.price / 100;
        if (discountRateNum > 0) {
          const discountDetails = calculateDiscountDetails(price, discountRateNum);
          updateData = discountDetails;
        } else {
          updateData = { 
            discount_rate: 0, 
            discount: null, 
            discountLessValue: null 
          };
        }
      } else if (field === 'subCategory') {
        if (!product.category) {
          toast.error('Please set a category first');
          return;
        }
  
        const response = await fetch('/api/subCategory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: product.category,
            productId: product.id
          }),
        });
  
        const data: SubCategoryResponse = await response.json();
        
        if (!data.success) {
          toast.error('Failed to check subcategory status');
          return;
        }
  
        if (data.requiresConfirmation && value) {
          if (!confirm(data.message)) {
            return;
          }
          updateData = {
            subCategory: value,
            category: product.category,
            updateDefaultSubCategory: true
          };
        } else {
          updateData = {
            subCategory: value || null,
            category: product.category
          };
        }
      }
  
      const response = await fetch(`/api/product_details_update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: product.id,
          ...updateData
        })
      });
  
      const result = await response.json();
  
      if (result.success) {
        setProduct(prevProduct => prevProduct ? { 
          ...prevProduct, 
          ...result.product 
        } : null);
        setEditingField(null);
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      } else {
        throw new Error(result.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error(err instanceof Error ? err.message : 'An error occurred while updating product details');
    }
  };

  const handleAddTag = async () => {
    if (!product || !newTag.trim()) return;

    try {
      const updatedTags = [...product.tags, newTag.trim()];
      
      const response = await fetch(`/api/product_details_update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: product.id,
          tags: updatedTags
        })
      });

      const result = await response.json();

      if (result.success) {
        setProduct(prevProduct => prevProduct ? { 
          ...prevProduct, 
          tags: result.product.tags 
        } : null);
        setNewTag('');
        toast.success('Tag added successfully');
      } else {
        throw new Error(result.message || 'Failed to add tag');
      }
    } catch (err) {
      console.error('Error adding tag:', err);
      toast.error('An error occurred while adding tag');
    }
  };

  const handleDeleteTag = async (tagToRemove: string) => {
    if (!product) return;

    try {
      const updatedTags = product.tags.filter(tag => tag !== tagToRemove);
      
      const response = await fetch(`/api/product_details_update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: product.id,
          tags: updatedTags
        })
      });

      const result = await response.json();

      if (result.success) {
        setProduct(prevProduct => prevProduct ? { 
          ...prevProduct, 
          tags: result.product.tags 
        } : null);
        toast.success('Tag deleted successfully');
      } else {
        throw new Error(result.message || 'Failed to delete tag');
      }
    } catch (err) {
      console.error('Error deleting tag:', err);
      toast.error('An error occurred while deleting tag');
    }
  };

  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-gray-50 min-h-screen">
        <div className="animate-pulse text-gray-600 font-semibold">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center  pt-24 sm:pt-28 md:pt-36  min-h-screen">
        <div className="text-red-600 font-bold text-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center  pt-24 sm:pt-28 md:pt-36  min-h-screen">
        <div className="text-gray-600 font-semibold text-xl">
          No product found
        </div>
      </div>
    );
  }

  
  return (
    <div className="container mx-auto px-4 py-8  pt-24 sm:pt-28 md:pt-36  min-h-screen">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/shop" className="hover:text-blue-600 text-xl font-bold transition-colors">
          Shop
        </Link>
        <span className="text-gray-600 text-xl font-bold">{'>'}</span>
        <span className="font-medium text-gray-800">{product.title}</span>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="w-full  h-[90vh] relative">
          <ProductImageGallery
            product={product}
            onImagesUpdated={(updatedImages) => {
              setProduct((prevProduct) => {
                if (prevProduct) {
                  return {
                    ...prevProduct,
                    product_images: updatedImages,
                  };
                }
                return null;
              });
            }}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Title */}
          <h1
            className="text-2xl lg:text-3xl font-bold text-gray-900 hover:bg-gray-100 rounded-md p-2 cursor-pointer transition-colors group"
            onClick={() => {
              setEditingField('title');
              setEditValue(product.title);
            }}
          >
            {product.title || 'Untitled Product'}
            <span className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-base">
              (Click to edit)
            </span>
          </h1>

          {/* Price Section - Reorganized for better layout */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-2 lg:space-y-0">
            {product.discount_rate === 0 || product.discount_rate === null ? (
              <>
                <span
                  className="text-2xl font-semibold text-gray-900 hover:text-gray-700 cursor-pointer transition-colors"
                  onClick={() => {
                    setEditingField('price');
                    setEditValue((product.price / 100).toString());
                  }}
                >
                  ${(product.price / 100).toFixed(2)}
                </span>
                <span
                  className="text-sm bg-gray-500 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-gray-600 transition-colors w-fit"
                  onClick={() => {
                    setEditingField('discount_rate');
                    setEditValue('0');
                  }}
                >
                  0% OFF
                </span>
              </>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                <div className="flex items-center space-x-4">
                  <span
                    className="text-xl lg:text-2xl font-semibold line-through text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                    onClick={() => {
                      setEditingField('price');
                      setEditValue((product.price / 100).toString());
                    }}
                  >
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  <span className="text-xl lg:text-2xl font-bold text-green-600">
                    ${(product.discountLessValue! / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-green-600">
                    Save ${product.discount !== null ? (product.discount / 100).toFixed(2) : ''}
                  </span>
                  <span
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-green-600 transition-colors"
                    onClick={() => {
                      setEditingField('discount_rate');
                      setEditValue(
                        product.discount_rate !== null && product.discount_rate !== undefined
                          ? (product.discount_rate / 100).toString()
                          : ''
                      );
                    }}
                  >
                    {product.discount_rate / 100}% OFF
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div
            className="text-gray-700 whitespace-pre-wrap rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => {
              setEditingField('description');
              setEditValue(product.description);
            }}
          >
            <h2 className="font-semibold mb-2 text-gray-900">Description</h2>
            {product.description || 'No description available'}
          </div>

          {/* Category and SubCategory Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                setEditingField('category');
                setEditValue(product.category || '');
              }}
            >
              <span className="font-bold block mb-1">Category</span>
              {product.category || 'Not assigned'}
            </div>

            {product.category && (
              <div
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setEditingField('subCategory');
                  setEditValue(product.subCategory || '');
                  fetchSubCategories();
                }}
              >
                <span className="font-bold block mb-1">SubCategory</span>
                {product.subCategory || 'Add subcategory'}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-grow border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button 
                onClick={handleAddTag}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors flex items-center"
                  onClick={() => handleDeleteTag(tag)}
                >
                  {tag}
                  <X className="inline-block ml-1 text-red-500 hover:text-red-700" size={16} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editing Mode for Fields */}
      {/* Editing Mode for Fields */}
{editingField && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    {editingField === 'subCategory' ? (
      <div className="bg-white p-6 rounded-lg shadow-2xl w-[400px] max-h-[80vh] overflow-y-auto border-t-4 border-blue-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Edit SubCategory</h3>
          <button 
            onClick={() => setEditingField(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {product.subCategory && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Current SubCategory: <span className="font-semibold">{product.subCategory}</span>
            </p>
          </div>
        )}

        {subCategories?.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing SubCategories
            </label>
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a subcategory</option>
              {subCategories.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {subCategories?.length > 0 ? 'Or add new subcategory' : 'Add subcategory'}
          </label>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Type new subcategory"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-700">
            {!product.category ? 
              'Please set a category first before adding a subcategory' : 
              subCategories?.length > 0 ? 
                'Note: When subcategories exist, they cannot be removed' : 
                'Adding a subcategory may affect other products in this category'
            }
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              if (!product.category) return;
              handleFieldEdit('subCategory', editValue);
            }}
            className="flex-1 bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            disabled={!product.category}
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingField(null)}
            className="flex-1 bg-gray-500 text-white px-5 py-3 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : editingField === 'description' ? (
      <div className="bg-white p-6 rounded-lg shadow-2xl w-[400px] border-t-4 border-blue-600">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Description</h3>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Edit description"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={6}
        />
        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => {
              handleFieldEdit('description', editValue);
              setEditingField(null);
            }}
            className="flex-1 bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingField(null)}
            className="flex-1 bg-red-500 text-white px-5 py-3 rounded-md hover:bg-red-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div className="bg-white p-6 rounded-lg shadow-2xl w-[400px] border-t-4 border-blue-600">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit {editingField}</h3>
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => {
              handleFieldEdit(editingField, editValue);
              setEditingField(null);
            }}
            className="flex-1 bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingField(null)}
            className="flex-1 bg-red-500 text-white px-5 py-3 rounded-md hover:bg-red-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
)}

      <MoreLike tags={product.tags} id={product.id}></MoreLike>
    </div>
  );
}
