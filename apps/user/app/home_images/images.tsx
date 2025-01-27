'use client'
import Image from "next/image"
import Link from "next/link"  // Import Link
import { useState, useEffect } from "react"

interface HomeData {
  id: string;
  title: string;
  slug: string;  // Added slug to the interface
  first_para: string;
  home_images: {
    image_url: string;
    is_main: boolean;
  }[];
}

export const Page_Image = () => {
  const [homeData, setHomeData] = useState<HomeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeImages = async () => {
      try {
        const response = await fetch('/api/home');
        if (!response.ok) {
          throw new Error('Failed to fetch home images');
        }
        const data = await response.json();
        setHomeData(data.homes || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching home images:', err);
        setError('Unable to load images');
        setIsLoading(false);
      }
    };

    fetchHomeImages();
  }, []);

  const NoImagePlaceholder = () => (
    <div className="w-full h-full flex justify-center items-center bg-gray-200 text-gray-500">
      No Image Available
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full bg-customGray flex justify-center text-black py-10 px-4">
        Loading...
      </div>
    );
  }

  if (error || homeData.length === 0) {
    return (
      <div className="w-full bg-customGray flex justify-center text-black py-10 px-4">
        No images available
      </div>
    );
  }

  return (
    <div className="w-full bg-customGray flex justify-center text-black py-10 px-4">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-[80%]">
        <div className="w-1/2 gap-10"> 
          {homeData.slice(0, 4).map((item, index) => (
            <div key={item.id} className="p-5">
              <Link href={`/${item.slug}`}>
                <div className="flex flex-col justify-center items-center cursor-pointer">
                  {item.home_images.length > 0 && item.home_images[0]?.image_url ? (
                    <Image
                      loader={() => item.home_images[0]?.image_url || ''}
                      src={item.home_images[0]?.image_url || ''}
                      alt={`Event Highlight ${index + 1}`}
                        loading='lazy'
                      width={440}
                      height={294}
                      className="w-[440px] h-[294px] object-cover object-center"
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}
                  <div className="text-center text-customText p-2 w-[440px] font-semibold text-lg">
                    {item.title || 'Untitled Event'}
                  </div>
                  <div className="text-center text-sm p-2 w-[440px] text-white">
                    {item.first_para || 'No description available'}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="w-1/2">
          {homeData.slice(4, 6).map((item, index) => (
            <div key={item.id} className="flex flex-col p-5 justify-center items-center">
              <Link href={`/${item.slug}`}>
                <div className="flex flex-col justify-center items-center cursor-pointer">
                  {item.home_images.length > 0 && item.home_images[0]?.image_url ? (
                    <Image
                      loader={() => item.home_images[0]?.image_url || ''}
                      src={item.home_images[0]?.image_url || ''}
                      alt={`Grand Event Showcase ${index + 1}`}
                        loading='lazy'
                      width={446}
                      height={694}
                      className="w-[446px] h-[694px] object-cover object-center"
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}
                  <div className="text-center p-2 w-[446px] font-semibold text-xl text-customText">
                    {item.title || 'Untitled Event'}
                  </div>
                  <div className="text-center p-2 w-[446px] text-white">
                    {item.first_para || 'No description available'}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="w-full lg:hidden">
        <div className="w-full space-y-6">
          {homeData.slice(0, 6).map((item, index) => (
            <div key={item.id} className="flex flex-col items-center">
              <Link href={`/${item.slug}`}>
                <div className="flex flex-col items-center cursor-pointer">
                  {item.home_images.length > 0 && item.home_images[0]?.image_url ? (
                    <Image
                      loader={() => item.home_images[0]?.image_url || ''}
                      src={item.home_images[0]?.image_url || ''}
                      alt={`Responsive Event ${index + 1}`}
                        loading='lazy'
                      width={index % 2 === 0 ? 440 : 446}
                      height={index % 2 === 0 ? 294 : 694}
                      className={`w-full max-w-[600px] ${
                        index % 2 === 0 ? 'h-[294px]' : 'h-[694px]'
                      } object-cover object-center`}
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}
                  <div className="text-center p-4 w-full max-w-[600px] font-semibold text-lg text-customText">
                    {item.title || 'Untitled Event'}
                  </div>
                  <div className="text-center p-3 w-full max-w-[600px] text-white">
                    {item.first_para || 'No description available'}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page_Image;
