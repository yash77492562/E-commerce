import React from 'react';
import Image from 'next/image';

const StudioPage = () => {
  return (
    <div className="">
      
      {/* Hero Section */}
      <section id="home" className="relative h-screen max-h-[800px]">
        <div className="absolute inset-0">
          <Image
            src="/images/3.webp"
            alt="Studio Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Our Studio
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Capturing moments that last forever
            </p>
            <button className="bg-white text-gray-900 px-8 py-3 rounded-lg 
                             hover:bg-gray-100 transition duration-300">
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Our Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="relative overflow-hidden rounded-lg shadow-lg h-64">
                <Image
                  src="/images/3.webp"
                  alt={`Gallery ${item}`}
                  fill
                  className="object-cover transition duration-300 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">About Us</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px]">
              <Image
                src="/images/3.webp"
                alt="About Us"
                fill
                className="rounded-lg shadow-lg object-cover"
              />
            </div>
            <div>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are a passionate team of photographers dedicated to capturing 
                your special moments. With years of experience and a keen eye for 
                detail, we ensure that every shot tells a story.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudioPage;