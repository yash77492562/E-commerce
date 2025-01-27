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
    <div className="max-w-4xl mx-auto px-4 py-8 pt-24 sm:pt-28 md:pt-36">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Shipping & Refund Policy
      </h1>

      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <AccordionSection 
          title="Shipping Policy" 
          sectionKey="shipping"
        >
          <h2 className="text-xl font-semibold mb-2">Delivery Timeline</h2>
          <p className="mb-4">Once your order has been confirmed, it will be processed and shipped within 15-20 working days. We use trusted shipping partners to ensure that your order arrives safely and promptly.</p>
          
          <h2 className="text-xl font-semibold mb-2">Product Care During Shipping</h2>
          <p className="mb-4">Given the delicate nature of our marble handicraft items, all products are carefully packaged with protective materials to minimize the risk of damage during shipping. However, we strongly advise customers to handle their items with care upon delivery.</p>

          <h2 className="text-xl font-semibold mb-2">Shipping Charges</h2>
          <ul className="list-disc pl-5">
            <li>Charges are calculated based on weight and destination</li>
            <li>Free shipping promotions may be available periodically</li>
            <li>All promotions will be clearly indicated at checkout</li>
            <li>You are responsible for providing the correct shipping address</li>
            <li>Redelivery fees due to incorrect address will be charged to the customer</li>
          </ul>
        </AccordionSection>

        <AccordionSection 
          title="International Delivery" 
          sectionKey="internationalDelivery"
        >
          <p className="mb-4">For international orders, please note the following important information:</p>
          
          <h2 className="text-xl font-semibold mb-2">Import Duties and Taxes</h2>
          <ul className="list-disc pl-5">
            <li>Orders may be subject to import duties and taxes in your country</li>
            <li>These charges are determined by your local customs office</li>
            <li>CKME Handicraft has no control over these charges</li>
            <li>All import duties and taxes must be paid by the recipient</li>
          </ul>

          <p className="mt-4">We recommend contacting your local customs office before placing an order to understand potential additional costs.</p>
        </AccordionSection>

        <AccordionSection 
          title="Returns and Refunds Policy" 
          sectionKey="returnsPolicy"
        >
          <h2 className="text-xl font-semibold mb-2">No Returns Policy</h2>
          <p className="mb-4">Due to the fragile nature of our handcrafted marble products, we do not accept returns once the order has been delivered. Please make sure to review your order carefully before completing your purchase.</p>
          
          <h2 className="text-xl font-semibold mb-2">Replacement Policy</h2>
          <p className="mb-4">For damaged or defective items:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Contact us within 24 hours of receiving your order</li>
            <li>Provide video proof of damage (unboxing video required)</li>
            <li>Include clear images of packaging showing damage during transit</li>
            <li>Replacements only valid for shipping damage, not customer handling</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2">Cancellation Policy</h2>
          <p>Once an order reaches the processing stage, it cannot be canceled. We begin preparing your order as soon as it is placed to ensure timely delivery.</p>
        </AccordionSection>

        <div className="mt-6 text-center text-gray-600">
          <p>For any queries, please contact:</p>
          <p>Email: teamckmehandicraft@gmail.com</p>
          <p>Phone: +91-7733022989</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingAndRefundPolicy;
