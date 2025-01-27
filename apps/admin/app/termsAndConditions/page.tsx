'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SectionKey = 
  | 'shipping' 
  | 'internationalDelivery' 
  | 'aboutUs' 
  | 'returnsPolicy' 
  | 'content' 
  | 'additionalInfo' 
  | 'purchasing' 
  | 'privacy';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  sectionKey: SectionKey;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  title, 
  children, 
  isOpen, 
  onToggle 
}) => (
  <div className="border-b border-gray-200 py-4">
    <button 
      onClick={onToggle}
      className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
      aria-expanded={isOpen}
    >
      {title}
      {isOpen ? <ChevronUp className="flex-shrink-0" /> : <ChevronDown className="flex-shrink-0" />}
    </button>
    {isOpen && (
      <div className="mt-3 text-gray-700 text-base leading-relaxed">
        {children}
      </div>
    )}
  </div>
);

const TermsAndConditions: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    shipping: false,
    internationalDelivery: false,
    aboutUs: false,
    returnsPolicy: false,
    content: false,
    additionalInfo: false,
    purchasing: false,
    privacy: false
  });

  const toggleSection = (section: SectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Flow Gallery Terms & Conditions
      </h1>

      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <AccordionSection 
          title="Shipping" 
          sectionKey="shipping" 
          isOpen={openSections.shipping}
          onToggle={() => toggleSection('shipping')}
        >
          <p>Due to fluctuations in shipping charges and taxation, we may need to amend our shipping costs. Shipping fees will be given at checkout or quoted after purchase. If your location is not listed, we will estimate shipping and contact you to organize the best delivery option.</p>
          <p className="mt-2">You can alternatively organize your own courier at your cost and responsibility. Collection at the gallery is available at checkout.</p>
        </AccordionSection>

        <AccordionSection 
          title="International Delivery" 
          sectionKey="internationalDelivery" 
          isOpen={openSections.internationalDelivery}
          onToggle={() => toggleSection('internationalDelivery')}
        >
          <p>Orders from outside the UK may be subject to import duties and taxes upon delivery. We have no control over these charges and cannot predict their amount.</p>
          <p className="mt-2">Import duties and taxes must be paid by the order recipient. Please contact your local customs office for more information before placing an order.</p>
        </AccordionSection>

        <AccordionSection 
          title="About Us" 
          sectionKey="aboutUs" 
          isOpen={openSections.aboutUs}
          onToggle={() => toggleSection('aboutUs')}
        >
          <p>Flow Gallery is the trading name of Nottinghill Applied Arts Limited, a gallery located in the heart of Notting Hill, London.</p>
          <p className="mt-2">Company Registration Number: 3803402</p>
          <p>Address: 1-5 Needham Road, London W11 2RP</p>
          <p>Website: www.flowgallery.co.uk</p>
        </AccordionSection>

        <AccordionSection 
          title="Returns Policy" 
          sectionKey="returnsPolicy" 
          isOpen={openSections.returnsPolicy}
          onToggle={() => toggleSection('returnsPolicy')}
        >
          <p>If unsatisfied with your purchase, contact us within 14 days of receiving the goods. Email info@flowgallery.co.uk to initiate a return.</p>
          <p className="mt-2">Returns are only accepted if:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Items are in unused condition</li>
            <li>Original packaging is undamaged</li>
            <li>Shipped at your expense</li>
            <li>Sent via recorded delivery</li>
          </ul>
          <p className="mt-2">Earrings may not be returnable due to hygiene reasons.</p>
          <p>Refunds will be processed to the original payment method within 10 business days, excluding shipping and customs fees.</p>
        </AccordionSection>

        <AccordionSection 
          title="Content" 
          sectionKey="content" 
          isOpen={openSections.content}
          onToggle={() => toggleSection('content')}
        >
          <p>We hold copyrights for all content on www.flowgallery.co.uk. To use our images or information, please contact info@flowgallery.co.uk.</p>
          <p className="mt-2">We welcome content use but request proper referencing and linking.</p>
        </AccordionSection>

        <AccordionSection 
          title="Purchasing" 
          sectionKey="purchasing" 
          isOpen={openSections.purchasing}
          onToggle={() => toggleSection('purchasing')}
        >
          <p>Customers must be 18 or older or have parental/guardian permission. Products remain Flow Gallery property until full payment is received.</p>
          <p className="mt-2">We accept major credit/debit cards via Stripe and PayPal. Prices are set at the time of order.</p>
          <p className="mt-2">Due to handmade nature, products may have slight variations. We recommend hand washing ceramics.</p>
        </AccordionSection>

        <AccordionSection 
          title="Privacy" 
          sectionKey="privacy" 
          isOpen={openSections.privacy}
          onToggle={() => toggleSection('privacy')}
        >
          <p>We treat personal information with strict confidentiality and will not share it with third parties.</p>
        </AccordionSection>

        <div className="mt-6 text-center text-gray-600">
          <p>VAT Number: 743 967002</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;