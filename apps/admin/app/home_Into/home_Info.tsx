'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { FaEdit } from 'react-icons/fa';
import { X } from 'lucide-react';

interface HomeInfoData {
  id: string;
  heading: string;
  para: string;
}

export const Page_Info = () => {
  const [homeInfoData, setHomeInfoData] = useState<HomeInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<keyof HomeInfoData | null>(null);
  const [, setEditedData] = useState<Partial<HomeInfoData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState<string>('');

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


  const handleEditClick = (field: keyof HomeInfoData) => {
    setEditingField(field);
    if (homeInfoData) {
      setEditValue(homeInfoData[field]?.toString() || '');
    }
  };

  const handleUpdateDetails = useCallback(async (field: keyof HomeInfoData, value: string) => {
    if (!homeInfoData?.id || isSaving) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/homeInfo', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: homeInfoData.id, 
          [field]: value 
        })
      });

      if (response.ok) {
        setHomeInfoData(prevData => ({
          ...prevData!,
          [field]: value
        }));
        setEditingField(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [homeInfoData, isSaving]);

  const EditableText = ({ value, field }: { value: string, field: keyof HomeInfoData }) => (
    <span 
      onClick={() => handleEditClick(field)}
      className="cursor-pointer group relative inline-block min-w-[100px] hover:bg-gray-100 rounded-md p-2"
    >
      <span>{value}</span>
      <FaEdit className="inline ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
    </span>
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!homeInfoData) return null;

  return (
    <>
      <div className="w-full bg-customBeige h-[60vh] flex flex-col items-center relative justify-center text-white">
        <h1 className="w-[95%] sm:w-[85%] md:w-3/4 lg:w-1/2 p-10 py-0 text-center">
          <EditableText value={homeInfoData.heading} field="heading" />
        </h1>
        <p className="w-[95%] sm:w-[85%] md:w-3/4 lg:w-1/2 text-center p-5 sm:p-10 border-b">
          <EditableText value={homeInfoData.para} field="para" />
        </p>
        <button className="absolute w-[200px] font-bold left-1/2 bottom-8 -translate-x-1/2 bg-white bg-opacity-50 text-white py-3 px-6 shadow-lg hover:bg-white hover:bg-opacity-80 transition-all duration-300">
          Discover More
        </button>
      </div>

      {/* Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 text-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-[400px] border-t-4 border-blue-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Edit {editingField.charAt(0).toUpperCase() + editingField.slice(1)}
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
              placeholder={`Enter ${editingField}`}
            />

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleUpdateDetails(editingField, editValue)}
                className="flex-1 bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition-colors"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditingField(null);
                  setEditValue('');
                }}
                className="flex-1 bg-red-500 text-white px-5 py-3 rounded-md hover:bg-red-600 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page_Info;