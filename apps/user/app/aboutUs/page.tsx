'use client'
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"

// 1. Type Definitions
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
  // 2. State Management
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoized state for images
  const [images, setImages] = useState<{
    middle?: AboutImageData,
    rightCorner?: AboutImageData,
    big?: AboutImageData
  }>({});

  // 3. Fetch About Data
  const fetchAboutData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/about');
      
      if (!response.ok) {
        throw new Error('Failed to fetch about data');
      }
      
      const data = await response.json();
      
      // Set about data
      setAboutData(data.about);
      
      // Organize images by position
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
      }, {} as {
        middle?: AboutImageData,
        rightCorner?: AboutImageData,
        big?: AboutImageData
      });
      
      // Set images in state
      setImages(imagesMap);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching about data:', error);
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  // 12. Render Image Section Helper
  const renderImageSection = useCallback((
    image: AboutImageData | undefined, 
    className?: string
  ) => {
    if (!image || !image.image_url) {
      return null; // Return null instead of 'No image found'
    }

    return (
      <div className={`relative  group ${className}`}>
        <Image
          loader={() => image.image_url}
          src={image.image_url}
          loading='lazy'
          alt={`${image.position} Image`}
          fill
          className="object-cover object-center"
        />
      </div>
    );
  }, []);

  // 13. Main Render
  if (isLoading) return <div className="  pt-24 sm:pt-28 md:pt-36 bg-ibisWhite">Loading...</div>;
  if (!aboutData) return <div className="  pt-24 sm:pt-28 md:pt-36 bg-ibisWhite">No data found</div>;

  return (
    <div className="w-full  p-4  pt-24 sm:pt-28 md:pt-36 bg-ibisWhite text-customText1">
      <div className="flex flex-col   flex-wrap sm:gap-6 md:gap-0  sm:flex-row   w-full">
        {/* Left Column - Only render if any content exists */}
        {(aboutData.first_para || aboutData.second_para || aboutData.third_para || aboutData.heading) && (
          <div className="w-full sm:w-full md:w-1/2 lg:w-1/3 flex flex-col sm:justify-center items-center md:justify-evenly mb-8 sm:mb-0">
            {aboutData.first_para && (
              <div className="w-full sm:w-[70%] md:max-w-[350px] px-4 sm:px-0">
                <p className="w-full sm:font-normal md:font-medium lg:font-semibold text-center">
                  {aboutData.first_para}
                </p>
              </div>
            )}
            {aboutData.second_para && (
              <div className="w-full sm:w-[70%]  md:max-w-[350px] font-light md:font-normal lg:font-medium flex justify-end px-4 sm:px-0 mt-6 sm:mt-0">
                <p className="w-full sm:w-[80%]">
                  {aboutData.second_para} 
                </p>
              </div>
            )}
            {aboutData.third_para && (
              <div className="w-full sm:w-[70%]  md:max-w-[350px] px-4 sm:px-0 mt-6 sm:mt-0">
                <p className="w-full text-center font-light md:font-normal lg:font-medium">
                  {aboutData.third_para} 
                </p>
              </div>
            )}
            {aboutData.heading && (
              <div className="w-full sm:w-[70%] md:max-w-[350px] font-normal md:font-medium lg:font-bold text-3xl px-4 sm:px-0 mt-6 sm:mt-0">
                <h2>
                  {aboutData.heading} 
                </h2>
              </div>
            )}
          </div>
        )}
      
        {/* Middle Column - Only render if middle image exists */}
        {images.middle?.image_url && (
          <div className="w-full md:w-1/2  lg:w-1/3 flex justify-center mb-8 sm:mb-0">
            <div className="w-full max-w-[400px] h-[500px] sm:h-[743px]">
              {renderImageSection(images.middle, 'w-full h-full')}
            </div>
          </div>
        )}
      
        {/* Right Column - Only render if rightCorner image or four_para exists */}
        {(images.rightCorner?.image_url || aboutData.four_para) && (
          <div className="w-full  md:mt-6  lg:w-1/3 lg:mt-0  mb-8 sm:mb-0">
            <div className=" lg:max-w-[400px]  md:w-full md:flex md:justify-center md:mb-0 md:items-center lg:block mx-auto lg:mx-0">
              {images.rightCorner?.image_url && renderImageSection(
                images.rightCorner,
                'w-full md:w-1/2 lg:w-full h-[400px] sm:h-[600px]'
              )}
              {aboutData.four_para && (
                <p className="w-full font-semibold md:w-1/2 lg:w-full text-center p-4 sm:p-7">
                  {aboutData.four_para} 
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full Width Big Image - Only render if big image exists */}
      {images.big?.image_url && (
        <div className="w-full h-[500px] sm:h-screen flex justify-center items-center mt-8 sm:mt-0">
          {renderImageSection(images.big, 'w-full sm:w-[90%] lg:w-[70%] h-[90%]')}
        </div>
      )}
    </div>
  );
}