'use client'

'use client'
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface HomeMainData {
  id: string;
  heading: string;
  first_para: string;
  second_para: string;
  third_para: string;
}

export const Page = () => {
  const [homeMainData, setHomeMainData] = useState<HomeMainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setEditedData] = useState<Partial<HomeMainData>>({});

  const fetchHomeMainData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/homeMain');
      const data = await response.json();
      
      if (data.success && data.homeMain) {
        setHomeMainData(data.homeMain);
        setEditedData(data.homeMain);
      } else {
        setError(data.error || 'Failed to load home main data');
      }
    } catch (err) {
      console.error('Error fetching home main data:', err);
      setError('Failed to load home main data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeMainData();
  }, [fetchHomeMainData]);

  
  if (isLoading) return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="w-full h-screen flex justify-center items-center text-red-600">
      {error}
    </div>
  );

  if (!homeMainData) return null;

  return (
    <div className="w-full min-h-[500px]">
      <div className="w-full min-h-[500px] max-h-[800px] h-screen bg-home_bg bg-center whitespace-normal bg-cover flex flex-col gap-16 justify-center items-center relative before:content-[''] before:absolute  before:inset-0 before:bg-black before:opacity-60">
        {homeMainData.heading && (
          <p className="text-2xl sm:text-3xl z-10 md:text-4xl lg:text-3xl font-extralight sm:font-light md:font-normal lg:font-medium">
            {homeMainData.heading} 
          </p>
        )}
        {(homeMainData.first_para || homeMainData.second_para || homeMainData.third_para) && (
          <div className="flex flex-col z-10 justify-center items-center gap-2">
            <div>
              {homeMainData.first_para && (
                <p className="text-xl font-extralight sm:font-normal md:font-normal lg:font-normal">
                  {homeMainData.first_para} 
                </p>
              )}
              {homeMainData.second_para && (
                <p className="text-xl font-extralight sm:font-light md:font-medium lg:font-medium text-center">
                  {homeMainData.second_para} 
                </p>
              )}
            </div>
            {homeMainData.third_para && (
              <div>
                <p className="font-medium text-center">
                  {homeMainData.third_para} 
                </p>
              </div>
            )}
          </div>
        )}
        <button className="absolute z-10 w-[150px] hover:shadow-md  left-1/2 bottom-20 -translate-x-1/2 border border-white bg-opacity-50 text-white py-3 px-6 ">
          <Link href="/shop">
            Shop
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Page;