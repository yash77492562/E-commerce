'use client';
import React, { useState,useEffect, useCallback } from 'react';
import ProductImageUpload from './ProductImageUpload';
import { useProductUpload } from '../../../src/hooks/useProductUpload';
import { S3Config as OriginalS3Config } from '@repo/s3_database/type';
import { X } from 'lucide-react';
import {toast} from 'sonner';
// Extend the imported type
interface ExtendedS3Config extends OriginalS3Config {
  s3ForcePathStyle?: boolean; // Optional property
}

// Function to calculate discount details
const calculateDiscountDetails = (price: number, discountRate: number) => {
  // Ensure price and discountRate are numbers
  const priceNum = Number(price);
  const discountRateNum = Number(discountRate);

  // Calculate discount amount
  const discountAmount = Math.round((priceNum * discountRateNum) / 100);

  // Calculate discounted price
  const discountLessValue = priceNum - discountAmount;

  return {
    price: priceNum * 100,
    discount: discountAmount * 100,
    discountLessValue: discountLessValue *100,
    discount_rate: discountRateNum * 100
  };
};


interface SubCategoryResponse {
  success: boolean;
  search_products: Array<{
    id: string;
    subCategory: string | null;
  }>;
  canSetNull: boolean;
  requiresConfirmation: boolean;
  message: string;
  statistics: {
    totalProducts: number;
    uniqueSubCategories: string[];
    hasSubCategories: boolean;
    productsWithNullSubCategory: number;
  };
}

// Type for API error
type APIError = {
  message: string;
  status?: number;
};

const ProductCreateForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [isAddingNewSubCategory, setIsAddingNewSubCategory] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [discountRate, setDiscountRate] = useState('');
  const [calculatedDiscount, setCalculatedDiscount] = useState({
    discount: 0,
    discountLessValue: 0
  });
  const [debouncedCategory, setDebouncedCategory] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subCategoryStats, setSubCategoryStats] = useState<SubCategoryResponse['statistics'] | null>(null);
  const [showSubCategoryConfirmation, setShowSubCategoryConfirmation] = useState(false);
  const [subCategoryConfirmationMessage, setSubCategoryConfirmationMessage] = useState('');
  const [pendingSubCategoryChange, setPendingSubCategoryChange] = useState(false);
  const [subCategoryRequired, setSubCategoryRequired] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchProducts, setSearchProducts] = useState<Array<{ id: string; subCategory: string | null }>>([]);  


  // Load S3 configuration from environment variables
  const s3Config: ExtendedS3Config = {
    region: process.env.NEXT_PUBLIC_S3_REGION || process.env.S3_REGION as string,
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY as string,
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET as string,
    endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT || process.env.S3_ENDPOINT as string,
    s3ForcePathStyle: true, // MinIO compatibility
  };
  
  const { 
    images, 
    errors, 
    handleFileSelect, 
    removeImage, 
    submitProduct,
    clearImages 
  } = useProductUpload(s3Config);

  // Update useEffect for category change


  // Fetch subcategories when category changes
  const fetchSubCategories = useCallback(async () => {
    if (!category) return;

    try {
      const response = await fetch('/api/subCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      const data: SubCategoryResponse = await response.json();
      
      if (data.success) {
        const uniqueSubCategories = Array.from(new Set(
          data.search_products
            .map(p => p.subCategory)
            .filter((sc): sc is string => sc !== null && sc !== 'default')
        ));
        
      setSearchProducts(data.search_products);
      setSubCategories(uniqueSubCategories);
      setSubCategoryStats(data.statistics);
      setSubCategoryRequired(data.statistics.hasSubCategories);


        if (data.requiresConfirmation && 
            data.statistics.totalProducts > 1 && 
            data.statistics.hasSubCategories) {
          setSubCategoryConfirmationMessage(data.message);
          setShowSubCategoryConfirmation(true);
          setPendingSubCategoryChange(true);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch subcategories');
      setSubCategories([]);
      setSubCategoryStats(null);
    }
  }, [category]);

  useEffect(() => {
    if (category) {
      fetchSubCategories();
    } else {
      setSubCategory('');
      setSubCategories([]);
      setIsAddingNewSubCategory(false);
      setSubCategoryStats(null);
    }
  }, [category, fetchSubCategories]);

  const handleSubCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'new') {
      setIsAddingNewSubCategory(true);
      setNewSubCategory('');
      setSubCategory(null);
    } else if (subCategoryStats?.hasSubCategories && !value) {
      // Don't allow empty value if category has existing subCategories
      toast.error('A subcategory is required for this category');
      return;
    } else {
      setIsAddingNewSubCategory(false);
      setSubCategory(value || null);
    }
  };

  const handleNewSubCategorySubmit = async () => {
    if (!category) {
      toast.error('Please select a category first');
      return;
    }

    if (!newSubCategory.trim()) {
      toast.error('Please enter a subcategory name');
      return;
    }

    try {
      const response = await fetch('/api/subCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          subCategory: newSubCategory
        }),
      });

      const data: SubCategoryResponse = await response.json();

      if (data.success) {
        if (data.requiresConfirmation) {
          setSubCategoryConfirmationMessage(data.message);
          setShowSubCategoryConfirmation(true);
        } else {
          setSubCategory(newSubCategory);
          setIsAddingNewSubCategory(false);
          // Update subcategories list
          setSubCategories([...subCategories, newSubCategory]);
        }
      }
    } catch (error) {
      toast.error('Failed to process subcategory');
    }
  };

  const handleSubCategoryConfirmation = async (confirmed: boolean) => {
    if (confirmed) {
      setSubCategory(newSubCategory || 'default');
      setPendingSubCategoryChange(true);
      
      try {
        await fetch('/api/updateSubCategories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category,
            newSubCategory: subCategory,
          }),
        });
      } catch (error) {
        toast.error('Failed to update subcategories');
      }
    } else {
      setNewSubCategory('');
      setSubCategory('default');
    }
    setShowSubCategoryConfirmation(false);
    setIsAddingNewSubCategory(false);
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    
    if (newCategory) {
      try {
        const response = await fetch('/api/subCategory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: newCategory }),
        });

        const data: SubCategoryResponse = await response.json();
        
        if (data.success) {
          setSubCategoryStats(data.statistics);
          
          if (!data.statistics.hasSubCategories && data.statistics.totalProducts > 1) {
            toast.info('Adding a subcategory will set other products in this category to default');
          }
        }
      } catch (error) {
        console.error('Error fetching category info:', error);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategory(category);
    }, 2000);
    return () => clearTimeout(timer);
  }, [category]);
  
  // Modified category suggestion fetch
  useEffect(() => {
    if (debouncedCategory.trim()) {
      fetch('/api/categorysuggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchTerm: debouncedCategory.toLowerCase() // Convert to lowercase for better matching
        })
      })
      .then(res => res.json())
      .then(data => {
        // Filter suggestions that include the search term
        const filteredSuggestions = data.suggestions.filter((suggestion: string) =>
          suggestion.toLowerCase().includes(debouncedCategory.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      })
      .catch(console.error);
    } else {
      setSuggestions([]); // Clear suggestions if input is empty
    }
  }, [debouncedCategory]);

  useEffect(() => {
    if (category) {
      fetchSubCategories();
    } else {
      setSubCategory('');
      setSubCategories([]);
      setIsAddingNewSubCategory(false);
    }
  }, [category,fetchSubCategories]);

  const handleDiscountRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = e.target.value;
    setDiscountRate(rate);

    // Calculate discount details only if price and discount rate are valid
    if (price && rate) {
      const discountDetails = calculateDiscountDetails(
        parseFloat(price), 
        parseFloat(rate)
      );
      
      setCalculatedDiscount({
        discount: discountDetails.discount,
        discountLessValue: discountDetails.discountLessValue
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
  
    // Validate subcategory if required
    if (subCategoryRequired && !subCategory) {
      setFormError('SubCategory is required for this category');
      toast.error('SubCategory is required for this category');
      return;
    }

    try {
      // Update subcategories if needed - moved from confirmation to form submission
      if (pendingSubCategoryChange && searchProducts.length > 0) {
        try {
          const updateResponse = await fetch('/api/updateSubCategories', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category,
              newSubCategory: subCategory,
              searchProducts
            }),
          });
    
          if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Failed to update subcategories');
          }
        } catch (error) {
          toast.error('Failed to update subcategories');
          return; // Prevent form submission if subcategory update fails
        }
      }

      await submitProduct({
        title,
        description,
        price: parseFloat(price) * 100,
        category,
        subCategory: subCategory || undefined,
        tags,
        discount_rate: discountRate ? parseFloat(discountRate) * 100 : undefined,
        discount: calculatedDiscount.discount,
        discountLessValue: calculatedDiscount.discountLessValue
      });
      
      toast.success('Product created successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setSubCategory('');
      setDiscountRate('');
      setCalculatedDiscount({ discount: 0, discountLessValue: 0 });
      setTags([]);
      clearImages();
    } catch (error: unknown) {
      if ((error as APIError).message?.includes('Failed to fetch')) {
        toast.error('Network error: Could not connect to the server. Please try again.');
      } else {
        toast.error('Product creation failed. Please try again.');
      }
      clearImages();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 p-4">
      <div className=" shadow-xl rounded-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-3xl font-bold text-center">Create New Product</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-semibold text-gray-700">
                Product Name
              </label>
              <input 
                id="title"
                type="text"
                className='w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                placeholder="Enter product name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-semibold text-gray-700">
              Product Description
            </label>
            <textarea
              id="description"
              className='w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required 
              placeholder="Describe your product in detail"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block mb-2 text-sm font-semibold text-gray-700">
                Original Price ($)
              </label>
              <input 
                id="price"
                type="number"
                className='w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
                min="0"
                step="0.01"
                placeholder="Enter product price"
              />
            </div>

            <div>
              <label htmlFor="discountRate" className="block mb-2 text-sm font-semibold text-gray-700">
                Discount Rate (%)
              </label>
              <input 
                id="discountRate"
                type="number"
                className='w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                value={discountRate}
                onChange={handleDiscountRateChange}
                min="0"
                max="100"
                placeholder="Enter discount percentage (0-100)"
              />
            </div>
          </div>

          {discountRate && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Discount Amount
                </label>
                <input 
                  type="text"
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 cursor-not-allowed'
                  value={`$${(calculatedDiscount.discount / 100).toFixed(2)}`}
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Discounted Price
                </label>
                <input 
                  type="text"
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-green-100 text-green-800 cursor-not-allowed'
                  value={`$${(calculatedDiscount.discountLessValue / 100).toFixed(2)}`}
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Category and SubCategory Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block mb-2 text-sm font-semibold text-gray-700">
            Product Category
          </label>
          <input 
            list='categories'
            id="category"
            type="text"
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={category}
            onChange={handleCategoryChange}
            required
            placeholder="Enter product category"
            autoComplete='off'
          />
          <datalist id="categories">
            {suggestions.map(suggestion => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        {/* SubCategory Section */}
        <div>
        <label htmlFor="subCategory" className="block mb-2 text-sm font-semibold text-gray-700">
          Product SubCategory
        </label>
        {isAddingNewSubCategory ? (
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              placeholder="Enter new subcategory"
            />
            <button
              type="button"
              onClick={handleNewSubCategorySubmit}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingNewSubCategory(false);
                setNewSubCategory('');
                setSubCategory('');
              }}
              className="px-4 py-3 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <select
            id="subCategory"
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-gray-100"
            value={subCategory ?? ''}
            onChange={handleSubCategoryChange}
            disabled={!category}
          >
            <option value="">
              {subCategoryStats?.hasSubCategories ? 'Select subcategory' : 'No subcategory'}
            </option>
            {subCategories.map((subCat) => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
            <option value="new">Add new subcategory</option>
          </select>
        )}

        {/* SubCategory Information */}
        {subCategoryStats && (
          <div className="mt-2 text-sm text-gray-600">
            {subCategoryStats.hasSubCategories ? (
              <p>This category has {subCategoryStats.uniqueSubCategories.length} subcategories</p>
            ) : (
              <p>No subcategories in this category yet</p>
            )}
          </div>
        )}
      </div>
          </div>

      {/* Confirmation Modal */}
      {showSubCategoryConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm SubCategory Change</h3>
            <p className="mb-6 text-gray-600">{subCategoryConfirmationMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleSubCategoryConfirmation(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => handleSubCategoryConfirmation(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {formError && (
        <div className="text-red-500 text-sm mt-2">
          {formError}
        </div>
      )}

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-grow border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button 
                type="button"
                onClick={handleAddTag}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg flex items-center"
                >
                  {tag}
                  <X
                    className="inline-block ml-1 text-red-500 hover:text-red-700 cursor-pointer"
                    size={16}
                    onClick={() => handleDeleteTag(tag)}
                  />
                </span>
              ))}
            </div>
          </div>

          <ProductImageUpload 
            images={images}
            onFileSelect={handleFileSelect}
            onRemoveImage={removeImage}
            errors={errors}
          />

          <button 
            type="submit" 
            disabled={images.length === 0}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductCreateForm;