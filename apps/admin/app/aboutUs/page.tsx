'use client'
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { Trash2, X } from 'lucide-react'

// Type Definitions
interface AboutImageData {
  id: string;
  index: number;
  position: string;
  image_key: string;
  image_url: string;
  is_main: boolean;
}

interface AboutData {
  id: string;
  heading: string;
  first_para: string;
  second_para: string;
  third_para: string;
  four_para: string;
  about_images: AboutImageData[];
}

export default function AboutUs() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<keyof AboutData | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [images, setImages] = useState<{
    middle?: AboutImageData,
    rightCorner?: AboutImageData,
    big?: AboutImageData
  }>({});

  // Fetch About Data
  const fetchAboutData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/about');
      
      if (!response.ok) {
        throw new Error('Failed to fetch about data');
      }
      
      const data = await response.json();
      setAboutData(data.about);
      
      const imagesMap = (data.about.about_images || []).reduce((acc: { 
        middle?: AboutImageData; 
        rightCorner?: AboutImageData; 
        big?: AboutImageData; 
      }, img: AboutImageData) => {
        switch(img.position) {
          case 'middle':
            acc.middle = img;
            break;
          case 'right-corner':
            acc.rightCorner = img;
            break;
          case 'big-one':
            acc.big = img;
            break;
        }
        return acc;
      }, {});
      
      setImages(imagesMap);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching about data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  // Handle Edit Click
  const handleEditClick = (field: keyof AboutData) => {
    setEditingField(field);
    if (aboutData) {
      setEditValue(aboutData[field]?.toString() || '');
    }
  };

  // Handle Update Details
  const handleUpdateDetails = async (field: keyof AboutData, value: string) => {
    try {
      const response = await fetch('/api/about', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value, id: aboutData?.id })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAboutData(updatedData);
        setEditingField(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // Image Upload Handler
  const handleImageUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>, 
    position: 'middle' | 'right-corner' | 'big-one'
  ) => {
    const file = event.target.files?.[0];
    if (file && aboutData?.about_images) {
      const imageToReplace = aboutData.about_images.find(img => img.position === position);
      
      if (!imageToReplace) {
        console.error('No image found for position:', position);
        await fetchAboutData();
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('imageId', imageToReplace.id);

      try {
        const response = await fetch('/api/about/image', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          await response.json();
          setAboutData(null);
          setImages({});
          setTimeout(() => {
            fetchAboutData();
          });
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
  }, [aboutData, fetchAboutData]);

  // Image Delete Handler
  const handleImageDelete = useCallback(async (imageId: string) => {
    try {
      const response = await fetch(`/api/about/delete/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAboutData();
      }
    } catch (error) {
      console.error('Image delete error:', error);
    }
  }, [fetchAboutData]);

  // Image Upload Placeholder Component
  const ImageUploadPlaceholder = ({ imageId, onUpload }: { 
    imageId: string, 
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void 
  }) => (
    <div 
      onClick={() => document.getElementById(`imageUpload-${imageId}`)?.click()}
      className="w-full h-full bg-gray-200 flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-500 transition-colors"
    >
      <input 
        type="file" 
        id={`imageUpload-${imageId}`}
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />
      <span className="text-4xl text-gray-400 font-bold">+</span>
    </div>
  );

  // Render Image Section Helper
  const renderImageSection = (
    image: AboutImageData | undefined, 
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onDelete: () => void,
    className?: string
  ) => {
    if (!image || !image.image_url || image.image_url === '') {
      return <ImageUploadPlaceholder imageId={image?.id || 'new'} onUpload={onUpload} />;
    }

    return (
      <div className={`relative group ${className}`}>
        <Image
          loader={() => image.image_url}
          src={image.image_url}
          alt={`${image.position} Image`}
          fill
          className="object-cover object-center"
        />
        <button 
          onClick={onDelete}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={20} />
        </button>
      </div>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (!aboutData) return <div>No data found</div>;

  return (
    <div className="w-full p-4 sm:p-7  pt-24 sm:pt-28 md:pt-36 text-customText1">
      <div className="flex flex-col flex-wrap sm:gap-6 md:gap-0 sm:flex-row w-full">
        {/* Left Column */}
        <div className="w-full sm:w-full md:w-1/2 lg:w-1/3 flex flex-col sm:justify-center items-center md:justify-evenly mb-8 sm:mb-0">
          <div className="w-full sm:w-[70%] md:max-w-[350px] px-4 sm:px-0">
            <p onClick={() => handleEditClick('first_para')} className="w-full sm:font-normal md:font-medium lg:font-semibold text-center cursor-pointer hover:bg-gray-100 rounded-md p-2">
              {aboutData.first_para || "Add first paragraph..."}
            </p>
          </div>
          <div className="w-full sm:w-[70%] md:max-w-[350px] font-light md:font-normal lg:font-medium flex justify-end px-4 sm:px-0 mt-6 sm:mt-0">
            <p onClick={() => handleEditClick('second_para')} className="w-full sm:w-[80%] cursor-pointer hover:bg-gray-100 rounded-md p-2">
              {aboutData.second_para || "Add second paragraph..."}
            </p>
          </div>
          <div className="w-full sm:w-[70%] md:max-w-[350px] px-4 sm:px-0 mt-6 sm:mt-0">
            <p onClick={() => handleEditClick('third_para')} className="w-full text-center font-light md:font-normal lg:font-medium cursor-pointer hover:bg-gray-100 rounded-md p-2">
              {aboutData.third_para || "Add third paragraph..."}
            </p>
          </div>
          <div className="w-full sm:w-[70%] md:max-w-[350px] font-normal md:font-medium lg:font-bold text-3xl px-4 sm:px-0 mt-6 sm:mt-0">
            <h2 onClick={() => handleEditClick('heading')} className="cursor-pointer hover:bg-gray-100 rounded-md p-2">
              {aboutData.heading || "Add heading..."}
            </h2>
          </div>
        </div>

        {/* Middle Column */}
        <div className="w-full md:w-1/2 lg:w-1/3 flex justify-center mb-8 sm:mb-0">
          <div className="w-full max-w-[400px] h-[500px] sm:h-[743px]">
            {renderImageSection(
              images.middle,
              (e) => handleImageUpload(e, 'middle'),
              () => images.middle?.id && handleImageDelete(images.middle.id),
              'w-full h-full'
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:mt-6 lg:w-1/3 lg:mt-0 mb-8 sm:mb-0">
          <div className="lg:max-w-[400px] xl:w-full md:w-full md:flex md:justify-center md:mb-0 md:items-center lg:block mx-auto lg:mx-0">
            {renderImageSection(
              images.rightCorner,
              (e) => handleImageUpload(e, 'right-corner'),
              () => images.rightCorner?.id && handleImageDelete(images.rightCorner.id),
              'w-full md:w-1/2 lg:w-full h-[400px] sm:h-[600px]'
            )}
            <p onClick={() => handleEditClick('four_para')} className="w-full font-semibold md:w-1/2 lg:w-full text-center p-4 sm:p-7 cursor-pointer hover:bg-gray-100 rounded-md">
              {aboutData.four_para || "Add fourth paragraph..."}
            </p>
          </div>
        </div>
      </div>

      {/* Full Width Big Image */}
      <div className="w-full h-[500px] sm:h-screen flex justify-center items-center mt-8 sm:mt-0">
        {renderImageSection(
          images.big,
          (e) => handleImageUpload(e, 'big-one'),
          () => images.big?.id && handleImageDelete(images.big.id),
          'w-full sm:w-[90%] lg:w-[70%] h-[90%] object-cover object-center'
        )}
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

            {editingField === 'heading' ? (
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