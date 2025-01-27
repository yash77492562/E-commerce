'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { FaInstagram, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { X } from 'lucide-react';
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
  const [editingField, setEditingField] = useState<keyof ContactData | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Fetch contact data
  const fetchContactData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contact');
      const data = await response.json();
      
      if (data.success && data.contact) {
        setContactData(data.contact);
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

  const handleEditClick = (field: keyof ContactData) => {
    setEditingField(field);
    if (contactData) {
      setEditValue(contactData[field]?.toString() || '');
    }
  };

  const handleUpdateDetails = async (field: keyof ContactData, value: string) => {
    if (!contactData?.id) return;

    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: contactData.id, 
          [field]: value 
        })
      });

      if (response.ok) {
        setContactData(prevData => ({
          ...prevData!,
          [field]: value
        }));
        setEditingField(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // EditableText component modified to use click-to-edit
  const EditableText = ({ 
    value, 
    field 
  }: { 
    value: string, 
    field: keyof ContactData 
  }) => (
    <span 
      onClick={() => handleEditClick(field)}
      className="cursor-pointer group inline-flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded"
    >
      {value}
    </span>
  );

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
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24 sm:pt-28 md:pt-36">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-lg mb-2">Address</h2>
                <div className="mb-1 flex items-center">
                  <EditableText value={contactData.address_main} field="address_main" />
                </div>
                <div className="flex items-center">
                  <EditableText value={contactData.address_city} field="address_city" />
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-2">Contact Information</h2>
                <div className="mb-1 flex items-center">
                  <span className="mr-2">Email:</span>
                  <EditableText value={contactData.email} field="email" />
                </div>
                <div className="mb-1 flex items-center">
                  <span className="mr-2">Tel:</span>
                  <EditableText value={contactData.phone_main} field="phone_main" />
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Fax:</span>
                  <EditableText value={contactData.phone_second} field="phone_second" />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <a 
                  href="https://www.instagram.com/flowgallery" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-3xl text-pink-600 hover:text-pink-700 transition-colors"
                >
                  <FaInstagram />
                </a>
                <a 
                  href={`https://wa.me/${contactData.phone_main?.replace(/[^0-9]/g, '') || ''}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-3xl text-green-600 hover:text-green-700 transition-colors"
                >
                  <FaWhatsapp />
                </a>
                <a 
                  href={`tel:${contactData.phone_main || ''}`}
                  className="text-3xl text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FaPhoneAlt />
                </a>
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
                <div key={day} className="flex justify-between items-center">
                  <span className="font-medium">{day}:</span>
                  <EditableText value={contactData[field]} field={field} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Add Modal at the end of the component */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-[400px] border-t-4 border-blue-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Edit {editingField.charAt(0).toUpperCase() + editingField.slice(1).replace(/([A-Z])/g, ' $1')}
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

            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={`Enter ${editingField.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            />

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
};

export default ContactPage;