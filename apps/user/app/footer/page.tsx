'use client'
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FaInstagram, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!footerData) return null;

  return (
    <footer className="bg-ibisWhite py-8 px-4 lg:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center lg:items-start space-y-8 lg:space-y-0">
        <div className="flex flex-col items-center lg:items-start space-y-8 w-full lg:w-auto">
          <div className="flex flex-col items-center sm:items-start space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 text-customText1">
            <Link href="/termsAndConditions" className="hover:underline">Terms & Conditions</Link>
            <Link href="/shipingAndRefund" className="hover:underline">Shipping & Returns</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/auth/login" className="hover:underline">Account Login</Link>
          </div>
          
          <div className="text-customText1 text-center lg:text-left">
            {footerData.companyName && <p>{footerData.companyName}</p>}
            {footerData.address && <p>{footerData.address}</p>}
            {footerData.email && <p>Email: {footerData.email}</p>}
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

          {footerData.phone && <p>T: {footerData.phone}</p>}

          {(footerData.open || footerData.close) && (
            <div className="text-center lg:text-left">
              <p className="font-bold">Opening Times</p>
              {footerData.open && <p><span className="font-bold">Open:</span> {footerData.open}</p>}
              {footerData.close && <p><span className="font-bold">Closed:</span> {footerData.close}</p>}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default GalleryFooter;