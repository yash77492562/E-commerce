'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ShippingAndRefundPolicy: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    shipping: false,
    internationalDelivery: false,
    returnsPolicy: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const AccordionSection: React.FC<{
    title: string, 
    children: React.ReactNode, 
    sectionKey: keyof typeof openSections
  }> = ({ title, children, sectionKey }) => (
    <div className="border-b border-gray-200 py-4">
      <button 
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
      >
        {title}
        {openSections[sectionKey] ? <ChevronUp /> : <ChevronDown />}
      </button>
      {openSections[sectionKey] && (
        <div className="mt-3 text-gray-700 text-base leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8  pt-24 sm:pt-28 md:pt-36 ">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Shipping & Refund Policy
      </h1>

      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <AccordionSection 
          title="Shipping Policy" 
          sectionKey="shipping"
        >
          <p className="mb-4">Due to fluctuations in shipping charges and taxation, our shipping costs may be amended. Here are the key details:</p>
          
          <h2 className="text-xl font-semibold mb-2">Shipping Fees</h2>
          <ul className="list-disc pl-5 mb-4">
            <li>Shipping fees will be provided at checkout</li>
            <li>Fees may be quoted after purchase</li>
            <li>For unlisted locations, we will estimate shipping and contact you</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2">Delivery Options</h2>
          <p className="mb-4">You have two primary options:</p>
          <ul className="list-disc pl-5">
            <li>Use our shipping service (fees quoted at checkout)</li>
            <li>Organize your own courier at your cost and responsibility</li>
            <li>Gallery collection available at checkout</li>
          </ul>
        </AccordionSection>

        <AccordionSection 
          title="International Delivery" 
          sectionKey="internationalDelivery"
        >
          <p className="mb-4">For orders outside the UK, please note the following important information:</p>
          
          <h2 className="text-xl font-semibold mb-2">Import Duties and Taxes</h2>
          <ul className="list-disc pl-5">
            <li>Orders may be subject to import duties and taxes</li>
            <li>We cannot control or predict these additional charges</li>
            <li>Import duties and taxes must be paid by the recipient</li>
          </ul>

          <p className="mt-4">Recommended Action: Contact your local customs office before placing an international order to understand potential additional costs.</p>
        </AccordionSection>

        <AccordionSection 
          title="Returns and Refunds Policy" 
          sectionKey="returnsPolicy"
        >
          <p className="mb-4">We want you to be completely satisfied with your purchase. Here are our return and refund guidelines:</p>
          
          <h2 className="text-xl font-semibold mb-2">Return Conditions</h2>
          <ul className="list-disc pl-5 mb-4">
            <li>Contact us within 14 days of receiving the goods</li>
            <li>Initial contact must be via email to info@flowgallery.co.uk</li>
            <li>Do not ship items until you receive email confirmation</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2">Return Requirements</h2>
          <ul className="list-disc pl-5 mb-4">
            <li>Items must be in unused condition</li>
            <li>Original packaging must be undamaged</li>
            <li>Return shipping is at customer&apos;s expense</li>
            <li>Use recorded delivery for tracking</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2">Important Notes</h2>
          <ul className="list-disc pl-5">
            <li>Earrings may not be returnable due to hygiene reasons</li>
            <li>Refunds exclude shipping and international customs fees</li>
            <li>Refunds processed to original payment method within 10 business days</li>
            <li>No returns or cancellations for bespoke or personalized orders</li>
          </ul>

          <p className="mt-4 text-sm italic">Note: These policies do not affect your statutory rights under the Consumer Rights Act 2015.</p>
        </AccordionSection>

        <div className="mt-6 text-center text-gray-600">
          <p>For any queries, please contact: info@flowgallery.co.uk</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingAndRefundPolicy;