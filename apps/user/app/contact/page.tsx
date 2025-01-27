'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { FaInstagram, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface ContactData {
  id: string;
  address_main: string;
  address_city: string;
  email: string;
  phone_main: string;
  phone_second: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

const ContactPage = () => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setEditedData] = useState<Partial<ContactData>>({});
  

  // Fetch contact data
  const fetchContactData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contact');
      const data = await response.json();
      
      if (data.success && data.contact) {
        setContactData(data.contact);
        setEditedData(data.contact);
      } else {
        setError(data.error || 'Failed to load contact data');
      }
    } catch (err) {
      console.error('Error fetching contact data:', err);
      setError('Failed to load contact data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactData();
  }, [fetchContactData]);

  const getGoogleMapsEmbedUrl = (address?: string, city?: string) => {
    const fullAddress = `${address || ''} ${city || ''}`.trim();
    const encodedAddress = encodeURIComponent(fullAddress);
    return `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  };

  const openInGoogleMaps = () => {
    if (!contactData) return;
    
    const fullAddress = `${contactData.address_main} ${contactData.address_city}`.trim();
    const encodedAddress = encodeURIComponent(fullAddress);
    
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const mapsUrl = `comgooglemaps://?q=${encodedAddress}`;
      const webUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
      
      const timeout = setTimeout(() => {
        window.location.href = webUrl;
      }, 500);
      
      window.location.href = mapsUrl;
      
      window.addEventListener('blur', () => {
        clearTimeout(timeout);
      });
    } else {
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center text-red-600">
      <div>{error}</div>
    </div>
  );

  if (!contactData) return null;

  return (
    <div className="container  pt-24 sm:pt-28 md:pt-36  mx-auto bg-ibisWhite px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(contactData.address_main || contactData.address_city) && (
                <div>
                  <h2 className="font-semibold text-lg mb-2">Address</h2>
                  {contactData.address_main && (
                    <div className="mb-1 flex items-center">
                      {contactData.address_main}
                    </div>
                  )}
                  {contactData.address_city && (
                    <div className="flex items-center">
                      {contactData.address_city} 
                    </div>
                  )}
                </div>
              )}

              {(contactData.email || contactData.phone_main || contactData.phone_second) && (
                <div>
                  <h2 className="font-semibold text-lg mb-2">Contact Information</h2>
                  {contactData.email && (
                    <div className="mb-1 flex items-center">
                      <span className="mr-2">Email:</span>
                      {contactData.email}
                    </div>
                  )}
                  {contactData.phone_main && (
                    <div className="mb-1 flex items-center">
                      <span className="mr-2">Tel:</span>
                      {contactData.phone_main} 
                    </div>
                  )}
                  {contactData.phone_second && (
                    <div className="flex items-center">
                      <span className="mr-2">Fax:</span>
                      {contactData.phone_second}
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                {contactData.email && (
                  <a 
                    href="https://www.instagram.com/flowgallery" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-3xl text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    <FaInstagram />
                  </a>
                )}
                {contactData.phone_main && (
                  <>
                    <a 
                      href={`https://wa.me/${contactData.phone_main.replace(/[^0-9]/g, '')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-3xl text-green-600 hover:text-green-700 transition-colors"
                    >
                      <FaWhatsapp />
                    </a>
                    <a 
                      href={`tel:${contactData.phone_main}`}
                      className="text-3xl text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FaPhoneAlt />
                    </a>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opening Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { day: 'Sunday', field: 'sunday' as keyof ContactData },
                { day: 'Monday', field: 'monday' as keyof ContactData },
                { day: 'Tuesday', field: 'tuesday' as keyof ContactData },
                { day: 'Wednesday', field: 'wednesday' as keyof ContactData },
                { day: 'Thursday', field: 'thursday' as keyof ContactData },
                { day: 'Friday', field: 'friday' as keyof ContactData },
                { day: 'Saturday', field: 'saturday' as keyof ContactData },
              ].map(({ day, field }) => (
                contactData[field] && (
                  <div key={day} className="flex justify-between items-center">
                    <span className="font-medium">{day}:</span>
                    {contactData[field]}
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {(contactData.address_main || contactData.address_city) && (
        <div className="mt-8 rounded-lg overflow-hidden shadow-lg">
          <div className="relative w-full h-96">
            <iframe
              key={`${contactData.address_main}-${contactData.address_city}`}
              src={getGoogleMapsEmbedUrl(contactData.address_main, contactData.address_city)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute top-0 left-0"
            />
            <button 
              onClick={openInGoogleMaps}
              className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Open in Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;