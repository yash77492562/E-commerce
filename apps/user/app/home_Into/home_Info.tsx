'use client'
import React, { useEffect, useState, useCallback } from 'react';

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

  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!homeInfoData) return null;

  return (
    <div className="w-full bg-customBeige h-[60vh] flex flex-col items-center relative justify-center text-white">
      {homeInfoData.heading && (
        <h1 className="w-[95%] sm:w-[85%]  md:w-3/4 lg:w-1/2 p-10 py-0 text-center">
          {homeInfoData.heading}
        </h1>
      )}
      {homeInfoData.para && (
        <p className="w-[95%] sm:w-[85%]  md:w-3/4 lg:w-1/2 text-center p-5 sm:p-10 border-b">
          {homeInfoData.para}
        </p>
      )}
      <button className="absolute w-[200px] font-bold left-1/2 bottom-8 -translate-x-1/2 bg-white bg-opacity-50 text-white py-3 px-6 shadow-lg hover:bg-white hover:bg-opacity-80 transition-all duration-300">
        Discover More
      </button>
    </div>
  );
};

export default Page_Info;