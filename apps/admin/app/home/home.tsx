'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';

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
  const [editingField, setEditingField] = useState<keyof HomeMainData | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const fetchHomeMainData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/homeMain');
      const data = await response.json();
      
      if (data.success && data.homeMain) {
        setHomeMainData(data.homeMain);
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

  const handleEditClick = (field: keyof HomeMainData) => {
    setEditingField(field);
    if (homeMainData) {
      setEditValue(homeMainData[field]?.toString() || '');
    }
  };

  const handleUpdateDetails = async (field: keyof HomeMainData, value: string) => {
    if (!homeMainData?.id) return;

    try {
      const response = await fetch('/api/homeMain', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: homeMainData.id, 
          [field]: value 
        })
      });

      if (response.ok) {
        setHomeMainData(prevData => ({
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

  const EditableText = ({ value, field }: { value: string, field: keyof HomeMainData }) => (
    <span 
      onClick={() => handleEditClick(field)}
      className="cursor-pointer group relative inline-block min-w-[100px] hover:bg-gray-100 rounded-md p-2"
    >
      <span>{value}</span>
      <FaEdit className="inline ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
    </span>
  );

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
    <div className="w-full">
      <div className="w-full h-screen bg-home_bg bg-center bg-cover flex flex-col gap-16 justify-center items-center relative">
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight sm:font-light md:font-normal lg:font-medium">
          <EditableText value={homeMainData?.heading || ''} field="heading" />
        </p>
        <div className="flex flex-col justify-center items-center gap-2">
          <div>
            <p className="text-xl font-extralight sm:font-median md:font-medium lg:font-medium">
              <EditableText value={homeMainData?.first_para || ''} field="first_para" />
            </p>
            <p className="text-xl font-extralight sm:font-light md:font-medium lg:font-medium text-center">
              <EditableText value={homeMainData?.second_para || ''} field="second_para" />
            </p>
          </div>
          <div>
            <p className="font-medium text-center">
              <EditableText value={homeMainData?.third_para || ''} field="third_para" />
            </p>
          </div>
        </div>
        <button className="absolute w-[150px] font-bold left-1/2 bottom-20 -translate-x-1/2 bg-white bg-opacity-50 text-black py-3 px-6 shadow-lg hover:bg-white hover:bg-opacity-80 transition-all duration-300">
          Shop
        </button>
      </div>

      {/* Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex justify-center items-center z-50">
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

export default Page;