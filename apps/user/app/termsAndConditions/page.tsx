'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SectionKey = 
  | 'Introduction' 
  | 'Product Descriptions' 
  | 'Shipping' 
  | 'Returns' 
  | 'Cancellation' 
  | 'Replacement' 
  | 'CustomerResponsibility' 
  | 'Liability' 
  | 'IntellectualProperty' 
  | 'ForceMajeure' 
  | 'Governing' 
  | 'Miscellaneous' 
  | 'Acknowledgement' 
  | 'Changes' 
  | 'Contact';

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
    Introduction: false,
    'Product Descriptions': false,
    Shipping: false,
    Returns: false,
    Cancellation: false,
    Replacement: false,
    CustomerResponsibility: false,
    Liability: false,
    IntellectualProperty: false,
    ForceMajeure: false,
    Governing: false,
    Miscellaneous: false,
    Acknowledgement: false,
    Changes: false,
    Contact: false
  });

  const toggleSection = (section: SectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 md:pt-28 lg:pt-32 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        CKME Handicraft - Terms & Conditions
      </h1>

      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <AccordionSection 
          title="Introduction" 
          sectionKey="Introduction" 
          isOpen={openSections.Introduction}
          onToggle={() => toggleSection('Introduction')}
        >
          <p>Welcome to CKME Handicraft! By using our website (www.ckmehandicraft.com) and purchasing our products, you agree to the following Terms and Conditions. Please read these carefully before placing an order. CKME Handicraft specializes in luxury marble handicrafts, transforming your home into a luxurious living space with elegant tableware, candle holders, dining trays, and other premium marble items.</p>
          <p className="mt-2">If you do not agree to these Terms, please refrain from using our website or purchasing our products.</p>
        </AccordionSection>

        <AccordionSection 
          title="Product Descriptions and Availability" 
          sectionKey="Product Descriptions" 
          isOpen={openSections['Product Descriptions']}
          onToggle={() => toggleSection('Product Descriptions')}
        >
          <p>Our Products: At CKME Handicraft, we offer a wide range of luxury marble handicrafts including home décor, kitchenware, candle holders, paperweights, incense holders, coasters, and other exquisite handcrafted items made from white and black marble.</p>
          <p className="mt-2">Handcrafted Nature: As each product is hand-crafted with precision and care, some minor variations in colour, texture, or design may occur. This is a feature of handmade items and not a defect.</p>
          <p className="mt-2">Product Availability: Our products are made in limited quantities, and stock levels may vary. We reserve the right to update or discontinue products without notice.</p>
        </AccordionSection>

        <AccordionSection 
          title="Shipping and Delivery" 
          sectionKey="Shipping" 
          isOpen={openSections.Shipping}
          onToggle={() => toggleSection('Shipping')}
        >
          <p>Delivery Timeline: Once your order has been confirmed, it will be processed and shipped within 15-20 working days. We use trusted shipping partners to ensure that your order arrives safely and promptly.</p>
          <p className="mt-2">Fragility of Products: Given the delicate nature of our marble handicraft items, all products are carefully packaged with protective materials to minimize the risk of damage during shipping. However, we strongly advise customers to handle their items with care upon delivery.</p>
          <p className="mt-2">Shipping Charges: Shipping charges are calculated based on the weight and destination of your order. Free shipping promotions may be available periodically, which will be clearly indicated at checkout.</p>
          <p className="mt-2">International Shipping: We offer international shipping, but customs duties or taxes may apply depending on your country's regulations. You are responsible for these charges.</p>
          <p className="mt-2">Address Accuracy: You are responsible for providing the correct shipping address. If your order is shipped to an incorrect address due to user error, you will be responsible for redelivery fees or any shipping issues.</p>
        </AccordionSection>

        <AccordionSection 
          title="No Return Policy" 
          sectionKey="Returns" 
          isOpen={openSections.Returns}
          onToggle={() => toggleSection('Returns')}
        >
          <p>Due to the fragile nature of our handcrafted marble products, we do not accept returns once the order has been delivered. Please make sure to review your order carefully before completing your purchase.</p>
        </AccordionSection>

        <AccordionSection 
          title="Cancellation Policy" 
          sectionKey="Cancellation" 
          isOpen={openSections.Cancellation}
          onToggle={() => toggleSection('Cancellation')}
        >
          <p>Cancellation Restrictions: Once an order reaches the processing stage, it cannot be canceled. We begin preparing your order as soon as it is placed to ensure timely delivery. Therefore, cancellations will not be possible once processing has started.</p>
        </AccordionSection>

        <AccordionSection 
          title="Replacement Policy" 
          sectionKey="Replacement" 
          isOpen={openSections.Replacement}
          onToggle={() => toggleSection('Replacement')}
        >
          <p>Eligibility for Replacement: If your product is damaged or defective upon arrival, we offer replacement. This replacement is only valid if the product is found to be damaged or defective during shipping and not as a result of customer handling after delivery.</p>
          <p className="mt-2">Reporting Damaged or Incorrect Orders: To request a replacement, you must contact us immediately (within 24 hours of receiving your order) and provide video proof of the damage or defect. The video should clearly show the condition of the product at the time of unboxing, with particular focus on the packaging and the damaged item.</p>
          <p className="mt-2">Required Documentation:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Video proof showing the damaged product (unboxing video)</li>
            <li>Clear images of the packaging showing visible damage during transit</li>
          </ul>
        </AccordionSection>

        <AccordionSection 
          title="Customer Responsibility and Care" 
          sectionKey="CustomerResponsibility" 
          isOpen={openSections.CustomerResponsibility}
          onToggle={() => toggleSection('CustomerResponsibility')}
        >
          <p>Handling and Care: Once your order is delivered, you are responsible for ensuring that the product is handled with care. We recommend placing the items in safe locations to avoid breakage or damage.</p>
          <p className="mt-2">Damage After Delivery: CKME Handicraft will not be liable for any damages caused to products after delivery, including any breakage, cracks, or other damage resulting from customer handling, misuse, or accidents.</p>
        </AccordionSection>

        <AccordionSection 
          title="Limitation of Liability" 
          sectionKey="Liability" 
          isOpen={openSections.Liability}
          onToggle={() => toggleSection('Liability')}
        >
          <p>No Warranty: CKME Handicraft makes no warranties, express or implied, regarding the durability or performance of its products, except as specifically stated in these Terms.</p>
          <p className="mt-2">Limitation of Liability: CKME Handicraft will not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our products, including but not limited to damages related to shipping, handling, or damages during delivery.</p>
        </AccordionSection>

        <AccordionSection 
          title="Intellectual Property" 
          sectionKey="IntellectualProperty" 
          isOpen={openSections.IntellectualProperty}
          onToggle={() => toggleSection('IntellectualProperty')}
        >
          <p>Ownership of Content: All content on this website, including text, images, designs, and product descriptions, is owned by CKME Handicraft or licensed to us. You may not reproduce, modify, distribute, or use any content from our website without our express permission.</p>
          <p className="mt-2">Product Designs: All products, including their designs, are the exclusive property of CKME Handicraft and may not be reproduced or sold without our consent.</p>
        </AccordionSection>

        <AccordionSection 
          title="Force Majeure" 
          sectionKey="ForceMajeure" 
          isOpen={openSections.ForceMajeure}
          onToggle={() => toggleSection('ForceMajeure')}
        >
          <p>CKME Handicraft will not be held responsible for any delays or failure to perform due to events beyond our control, including but not limited to natural disasters, strikes, or other unforeseen circumstances that may disrupt our operations.</p>
        </AccordionSection>

        <AccordionSection 
          title="Governing Law and Dispute Resolution" 
          sectionKey="Governing" 
          isOpen={openSections.Governing}
          onToggle={() => toggleSection('Governing')}
        >
          <p>Governing Law: These Terms and Conditions are governed by and construed in accordance with the laws of Rajasthan.</p>
          <p className="mt-2">Dispute Resolution: Any disputes related to these Terms will be resolved through mediation or arbitration. If a resolution cannot be reached, disputes may be brought before the courts of Jaipur, Rajasthan.</p>
        </AccordionSection>

        <AccordionSection 
          title="Miscellaneous Provisions" 
          sectionKey="Miscellaneous" 
          isOpen={openSections.Miscellaneous}
          onToggle={() => toggleSection('Miscellaneous')}
        >
          <p>Severance: If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will continue to be in full effect.</p>
          <p className="mt-2">Entire Agreement: These Terms constitute the entire agreement between you and CKME Handicraft regarding your use of the website and purchase of our products.</p>
          <p className="mt-2">Assignment: We reserve the right to assign or transfer our rights and obligations under these Terms. You may not assign or transfer your rights without our written consent.</p>
        </AccordionSection>

        <AccordionSection 
          title="Customer Acknowledgement of Terms" 
          sectionKey="Acknowledgement" 
          isOpen={openSections.Acknowledgement}
          onToggle={() => toggleSection('Acknowledgement')}
        >
          <p>These terms and conditions apply when you place an order with us via the website www.ckmehandicraft.com. By placing your order you agree to be bound by these terms and conditions. Therefore, please make sure you have read and understood them before ordering.</p>
        </AccordionSection>

        <AccordionSection 
          title="Changes to Terms" 
          sectionKey="Changes" 
          isOpen={openSections.Changes}
          onToggle={() => toggleSection('Changes')}
        >
          <p>CKME Handicraft reserves the right to modify or update these Terms and Conditions at any time. Any changes will be posted on this page, and your continued use of the website after any changes constitutes your acceptance of the new Terms.</p>
        </AccordionSection>

        <AccordionSection 
          title="Contact Information" 
          sectionKey="Contact" 
          isOpen={openSections.Contact}
          onToggle={() => toggleSection('Contact')}
        >
          <p>If you have any questions, concerns, or inquiries regarding these Terms and Conditions, or if you need to request a replacement for a damaged product, please contact us at:</p>
          <p className="mt-2">CKME Handicraft</p>
          <p>Email: teamckmehandicraft@gmail.com</p>
          <p>Phone: +91-7733022989</p>
          <p>Address: Jaipur, Rajasthan</p>
        </AccordionSection>
      </div>
    </div>
  );
};

export default TermsAndConditions;
