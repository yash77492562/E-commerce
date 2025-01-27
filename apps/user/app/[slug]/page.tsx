'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface HomeImage {
  id: string;
  image_key?: string;
  image_url: string;
  is_main: boolean;
}
interface HomeDetailData {
  id: string;
  title: string;
  slug: string;
  first_para: string;
  second_para: string;
  third_para: string;
  home_images: HomeImage[];
}

export default function Page() {
  const params = useParams();
  const [homeData, setHomeData] = useState<HomeDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeDetail = async () => {
      try {
        const response = await fetch(`/api/${params.slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch home details");
        }
        const data = await response.json();
        setHomeData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching home details:", error);
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchHomeDetail();
    }
  }, [params.slug]);

  if (isLoading) return <div>Loading...</div>;
  if (!homeData) return <div>No data found</div>;

  return (
    <div className="w-full p-4 pt-24 sm:pt-28 md:pt-36  bg-ibisWhite flex justify-center text-customText items-center">
      <div className="flex flex-col w-full sm:w-4/5 md:w-3/4 lg:w-1/2 justify-center items-center gap-4 sm:gap-8">
        <h1 className="text-white w-full text-xl sm:text-2xl text-center font-bold">
          {homeData.title}
        </h1>

        <p className="w-full text-sm sm:text-base text-center font-medium">
          {homeData.first_para}
        </p>

        <div className="w-full flex flex-col items-center gap-2 sm:gap-4">
          {homeData?.home_images?.map((image) => (
            image.image_url ? (
              <div key={image.id} className="relative w-full group">
                <Image
                  loader={() => image.image_url}
                  src={image.image_url}
                  alt={homeData.slug}
                  loading='lazy'
                  width={440}
                  height={294}
                  onError={(e) => {
                    console.error("Image load error:", e);
                  }}
                  className="w-full h-auto object-cover object-center"
                />
              </div>
            ) : null
          ))}
        </div>

        <p className="w-full text-sm sm:text-base font-semibold hide-scrollbar text-center">
          {homeData.second_para}
        </p>

        <p className="w-full hide-scrollbar font-semibold text-center">
          {homeData.third_para}
        </p>
      </div>
    </div>
  );
}
