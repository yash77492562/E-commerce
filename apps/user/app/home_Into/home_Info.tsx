'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react';

interface HomeInfoData {
  id: string;
  heading: string;
  para: string;
}

export const Page_Info = () => {
  const [homeInfoData, setHomeInfoData] = useState<HomeInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setEditedData] = useState<Partial<HomeInfoData>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  const fetchHomeInfoData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/homeInfo');
      const data = await response.json();
      
      if (data.success && data.homeInfo) {
        setHomeInfoData(data.homeInfo);
        setEditedData(data.homeInfo);
      } else {
        setError(data.error || 'Failed to load home info data');
      }
    } catch (err) {
      console.error('Error fetching home info data:', err);
      setError('Failed to load home info data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeInfoData();
  }, [fetchHomeInfoData]);

  useEffect(() => {
    // Measure content height after content is loaded and rendered
    if (contentRef.current && !isLoading && homeInfoData) {
      // Get the height of the content
      const height = contentRef.current.scrollHeight;
      setContentHeight(height + 20); // Add extra 20px
    }
  }, [isLoading, homeInfoData]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!homeInfoData) return null;

  return (
    <div 
      className="w-full bg-backgroundImage relative text-foreground flex flex-col items-center justify-center"
      style={{ minHeight: contentHeight ? `${contentHeight}px` : 'auto' }}
    >
      <div ref={contentRef} className="flex flex-col items-center w-full pt-10 pb-16">
        {homeInfoData.heading && (
          <h1 className="w-[95%] sm:w-[85%] text-white md:w-3/4 lg:w-1/2 p-10 py-0 text-center">
            {homeInfoData.heading}
          </h1>
        )}
        {homeInfoData.para && (
          <p className="w-[95%] sm:w-[85%] md:w-3/4 lg:w-1/2 font-medium text-center text-white p-5 sm:p-10 border-b">
            {homeInfoData.para}
          </p>
        )}
      </div>
      <button className="absolute w-[200px] left-1/2 bottom-2 md:bottom-2 lg:bottom-4 -translate-x-1/2 text-white bg-opacity-50 border border-white py-3 px-6 shadow-lg transition-all duration-300">
        Discover More
      </button>
    </div>
  );
};

export default Page_Info;