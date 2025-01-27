'use client'
import Image from "next/image"
import React, {  useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import {useRouter} from 'next/navigation'
import {Trash2 , X} from 'lucide-react'

interface HomeDetailData {
    id: string;
    title: string;
    slug: string;
    first_para: string;
    second_para: string;
    third_para: string;
    home_images: {
      id: string;
      image_url: string;
      is_main: boolean;
    }[];
  }

export default function Page() {
  const router = useRouter()
  const params = useParams();
  const [homeData, setHomeData] = useState<HomeDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<keyof HomeDetailData | null>(null);
  const [, setSelectedImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const fetchHomeDetail = async () => {
      try {
        const response = await fetch(`/api/${params.slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch home details');
        }
        const data = await response.json();
        setHomeData(data);
        setImageId(data.home_images[0].id)
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching home details:', error);
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchHomeDetail();
    }
  }, [params.slug]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      if (imageId) {
        formData.append('imageId', imageId);
      }
  
      try {
        const response = await fetch(`/api/${params.slug}/image`, {
          method: 'POST',
          body: formData
        });
  
        if (response.ok) {
          const updatedData = await response.json();
          if (updatedData && updatedData.home_images) {
            setHomeData(updatedData);
            setSelectedImage(null);
            setImageId(updatedData.home_images[0]?.id || null);
          } else {
            console.error('Invalid response structure:', updatedData);
            alert('Failed to update home data');
          }
        } else {
          const errorData = await response.json();
          console.error('Image upload error:', errorData.error);
          alert(errorData.error || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
  };
  


  const handleImageDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/${params.slug}/delete/${imageId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setHomeData((prev) => {
          if (prev) {
            const updatedImages = prev.home_images.filter(
              (image) => image.id !== imageId
            );
            return { ...prev, home_images: updatedImages };
          }
          return prev;
        });
      } else {
        console.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Image delete error:', error);
    }
  };
  
  // Modified handleEditClick function
  const handleEditClick = (field: keyof HomeDetailData) => {
    setEditingField(field);
    if (homeData) {
      setEditValue(homeData[field]?.toString() || '');
    }
  };
  const handleUpdateDetails = async (field: keyof HomeDetailData, value: string) => {
    try {
      const response = await fetch(`/api/${params.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update');
      }

      const updatedData = await response.json();
      
      if (field === 'title' && updatedData.newSlug && updatedData.newSlug !== params.slug) {
        router.push(`/${updatedData.newSlug}`);
        return;
      }

      // Update local state with new data
      setHomeData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [field]: value
        };
      });
      setEditingField(null);

    } catch (error) {
      console.error('Update error:', error);
    }
  };


  // Image upload placeholder component
  const ImageUploadPlaceholder = () => (
    <div 
      onClick={() => document.getElementById('imageUpload')?.click()}
      className="w-full h-60 bg-white flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-500 transition-colors"
    >
      <input 
        type="file" 
        id="imageUpload"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <span className="text-4xl text-gray-400 font-bold">+</span>
    </div>
  );

  if (isLoading) return <div>Loading...</div>;
  if (!homeData) return <div>No data found</div>;

  return (
    <div className="w-full p-4 pt-24 sm:pt-28 md:pt-36 bg-ibisWhite flex justify-center text-customText items-center">
      <div className="flex flex-col w-full sm:w-4/5 md:w-3/4 lg:w-1/2 justify-center items-center gap-4 sm:gap-8">
        {/* Title */}
        <h1 
          onClick={() => handleEditClick('title')} 
          className="text-white w-full text-xl sm:text-2xl text-center font-bold cursor-pointer hover:bg-gray-100 rounded-md p-2"
        >
          {homeData.title}
        </h1>

        {/* First Paragraph */}
        <p 
          onClick={() => handleEditClick('first_para')} 
          className="w-full text-center font-medium cursor-pointer hover:bg-gray-100 rounded-md p-2"
        >
          {homeData.first_para || "Add first paragraph..."}
        </p>
        
        <div className="w-full flex flex-col items-center gap-2 sm:gap-4">
          {homeData?.home_images && homeData.home_images.length > 0 ? (
            homeData.home_images.some(image => image.image_url) ? (
              homeData.home_images.map((image) => (
                image.image_url ? (
                  <div key={image.id} className="relative w-full group">
                    <Image
                      loader={() => image.image_url}
                      src={image.image_url}
                      alt={homeData.slug}
                      width={440}
                      height={294}
                    // Add onError handling
                    onError={(e) => {
                      console.error('Image load error:', e);
                      // Optionally, you can set a placeholder or handle the error
                    }}
                      className="w-full h-auto object-cover object-center"
                    />
                    <button 
                      onClick={() => handleImageDelete(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ) : null
              ))
            ) : (
              <ImageUploadPlaceholder />
            )
          ) : (
            <ImageUploadPlaceholder />
          )}
        </div>

{/* Second Paragraph */}
<p 
  onClick={() => handleEditClick('second_para')} 
  className="w-full text-sm sm:text-base font-semibold text-center cursor-pointer hover:bg-gray-100 rounded-md p-2"
>
  {homeData.second_para || "Add second paragraph..."}
</p>

{/* Third Paragraph */}
<p 
  onClick={() => handleEditClick('third_para')} 
  className="w-full font-semibold text-center cursor-pointer hover:bg-gray-100 rounded-md p-2"
>
  {homeData.third_para || "Add some content here..."}
</p>
</div>

{/* Edit Modal */}
{editingField && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-2xl w-[400px] border-t-4 border-blue-600">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Edit {editingField.charAt(0).toUpperCase() + editingField.slice(1).replace(/_/g, ' ')}
        </h3>
        <button 
          onClick={() => {
            setEditingField(null);
            setEditValue('');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {editingField === 'title' ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={`Enter ${editingField}`}
        />
      ) : (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={6}
          placeholder={`Enter ${editingField.replace(/_/g, ' ')}`}
        />
      )}

      <div className="mt-6 flex space-x-3">
        <button
          onClick={() => handleUpdateDetails(editingField, editValue)}
          className="flex-1 bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={() => {
            setEditingField(null);
            setEditValue('');
          }}
          className="flex-1 bg-red-500 text-white px-5 py-3 rounded-md hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
</div>
);
}