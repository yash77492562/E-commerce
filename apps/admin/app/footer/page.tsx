'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { FaInstagram, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { X } from 'lucide-react';
import Link from 'next/link';

interface FooterData {
  id: string;
  companyName: string;
  address: string;
  phone: string;
  open: string;
  close: string;
  email: string;
}

const GalleryFooter = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<keyof FooterData | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const fetchFooterData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/footer');
      const data = await response.json();
      
      if (data.success && data.footer) {
        setFooterData(data.footer);
      } else {
        setError(data.error || 'Failed to load footer data');
      }
    } catch (err) {
      console.error('Error fetching footer data:', err);
      setError('Failed to load footer data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFooterData();
  }, [fetchFooterData]);

  const handleEditClick = (field: keyof FooterData) => {
    setEditingField(field);
    if (footerData) {
      setEditValue(footerData[field]?.toString() || '');
    }
  };

  const handleUpdateDetails = async (field: keyof FooterData, value: string) => {
    if (!footerData?.id) return;

    try {
      const response = await fetch('/api/footer', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: footerData.id, 
          [field]: value 
        })
      });

      if (response.ok) {
        setFooterData(prevData => ({
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!footerData) return null;

  return (
    <footer className="py-8 px-4 lg:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center lg:items-start space-y-8 lg:space-y-0">
        <div className="flex flex-col items-center lg:items-start space-y-8 w-full lg:w-auto">
          <div className="flex flex-col items-center sm:items-start space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 text-customText1">
            <Link href="/termsAndConditions" className="hover:underline">Terms & Conditions</Link>
            <Link href="/shipingAndRefund" className="hover:underline">Shipping & Returns</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/auth/login" className="hover:underline">Account Login</Link>
          </div>
          
          <div className="text-customText1 text-center lg:text-left">
            <p onClick={() => handleEditClick('companyName')} className="cursor-pointer hover:bg-gray-100 rounded-md p-2">
              {footerData.companyName}
            </p>
            <p onClick={() => handleEditClick('address')} className="cursor-pointer hover:bg-gray-100 rounded-md p-2">
              {footerData.address}
            </p>
            <p onClick={() => handleEditClick('email')} className="cursor-pointer hover:bg-gray-100 rounded-md p-2">
              Email: {footerData.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-start space-y-4 text-customText1 w-full lg:w-auto">
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-600">
              <FaInstagram size={24} />
            </a>
            <a href="#" className="hover:text-gray-600">
              <FaWhatsapp size={24} />
            </a>
            <a href="#" className="hover:text-gray-600">
              <FaPhoneAlt size={24} />
            </a>
          </div>

          <p onClick={() => handleEditClick('phone')} className="cursor-pointer hover:bg-gray-100 rounded-md p-2">
            T: {footerData.phone}
          </p>

          <div className="text-center lg:text-left">
            <p className="font-bold">Opening Times</p>
            <p onClick={() => handleEditClick('open')} className="cursor-pointer hover:bg-gray-100 rounded-md p-2">
              <span className="font-bold">Open:</span> {footerData.open}
            </p>
            <p onClick={() => handleEditClick('close')} className="cursor-pointer hover:bg-gray-100 rounded-md p-2">
              <span className="font-bold">Closed:</span> {footerData.close}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
    </footer>
  );
};

export default GalleryFooter;