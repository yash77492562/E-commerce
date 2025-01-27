'use client'
import { useState } from 'react'
import Image from 'next/image'

interface AboutUploadFormProps {
    onImageUploadComplete: () => void;
    remainingSlots: number;
}

export default function AboutUploadForm({ 
    onImageUploadComplete
}: AboutUploadFormProps) {
    const [heading, setHeading] = useState('');
    const [firstPara, setFirstPara] = useState('');
    const [secondPara, setSecondPara] = useState('');
    const [thirdPara, setThirdPara] = useState('');
    const [fourPara, setFourPara] = useState('');
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [formErrors, setFormErrors] = useState<{
        heading: string;
        firstPara: string;
        secondPara: string;
        thirdPara: string;
        fourPara: string;
        images: string;
    }>({
        heading: '',
        firstPara: '',
        secondPara: '',
        thirdPara: '',
        fourPara: '',
        images: ''
    });

    const validateForm = () => {
        const errors = {
            heading: heading.trim() ? '' : 'Heading is required',
            firstPara: firstPara.trim() ? '' : 'First paragraph is required',
            secondPara: secondPara.trim() ? '' : 'Second paragraph is required',
            thirdPara: thirdPara.trim() ? '' : 'Third paragraph is required',
            fourPara: fourPara.trim() ? '' : 'Fourth paragraph is required',
            images: ''
        };

        setFormErrors(errors);
        return !errors.heading && !errors.firstPara && 
               !errors.secondPara && !errors.thirdPara && 
               !errors.fourPara;
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // First, validate the form
        if (!validateForm()) {
            return;
        }

        const files = event.target.files;
        if (files && files.length === 3) {
            // Create previews
            const previews: string[] = [];
            const fileArray = Array.from(files);
            
            fileArray.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews.push(reader.result as string);
                    if (previews.length === 3) {
                        setPreviewImages(previews);
                    }
                };
                reader.readAsDataURL(file);
            });

            // Prepare form data
            const formData = new FormData();
            fileArray.forEach(file => {
                formData.append('files', file);
            });
            formData.append('heading', heading);
            formData.append('first_para', firstPara);
            formData.append('second_para', secondPara);
            formData.append('third_para', thirdPara);
            formData.append('four_para', fourPara);

            try {
                // Send to API route
                const response = await fetch('/api/about', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    setUploadStatus({
                        success: true,
                        message: 'About content uploaded successfully!'
                    });
                    onImageUploadComplete();
                    
                    // Reset form
                    setHeading('');
                    setFirstPara('');
                    setSecondPara('');
                    setThirdPara('');
                    setFourPara('');
                    setPreviewImages([]);
                    
                    // Reset file input
                    if (event.target) {
                        event.target.value = '';
                    }
                } else {
                    setUploadStatus({
                        success: false,
                        message: result.error || 'Upload failed'
                    });
                    console.error('Upload failed:', result);
                }
            } catch (error) {
                setUploadStatus({
                    success: false,
                    message: 'Error uploading content'
                });
                console.error('Error uploading content:', error);
            }
        } else {
            setFormErrors(prev => ({
                ...prev,
                images: 'Exactly 3 images must be selected'
            }));
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto  p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
                About Content Upload 
            </h2>

            <div className="space-y-4">
                <div>
                    <input 
                        type="text" 
                        placeholder="Heading*" 
                        value={heading}
                        onChange={(e) => {
                            setHeading(e.target.value);
                            setFormErrors(prev => ({...prev, heading: ''}));
                        }}
                        className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.heading ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {formErrors.heading && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.heading}</p>
                    )}
                </div>

                <div>
                    <textarea 
                        placeholder="First Paragraph*" 
                        value={firstPara}
                        onChange={(e) => {
                            setFirstPara(e.target.value);
                            setFormErrors(prev => ({...prev, firstPara: ''}));
                        }}
                        className={`w-full px-3 py-2 border rounded-md h-24 ${
                            formErrors.firstPara ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {formErrors.firstPara && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.firstPara}</p>
                    )}
                </div>

                <div>
                    <textarea 
                        placeholder="Second Paragraph*" 
                        value={secondPara}
                        onChange={(e) => {
                            setSecondPara(e.target.value);
                            setFormErrors(prev => ({...prev, secondPara: ''}));
                        }}
                        className={`w-full px-3 py-2 border rounded-md h-24 ${
                            formErrors.secondPara ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {formErrors.secondPara && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.secondPara}</p>
                    )}
                </div>

                <div>
                    <textarea 
                        placeholder="Third Paragraph*" 
                        value={thirdPara}
                        onChange={(e) => {
                            setThirdPara(e.target.value);
                            setFormErrors(prev => ({...prev, thirdPara: ''}));
                        }}
                        className={`w-full px-3 py-2 border rounded-md h-24 ${
                            formErrors.thirdPara ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {formErrors.thirdPara && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.thirdPara}</p>
                    )}
                </div>

                <div>
                    <textarea 
                        placeholder="Fourth Paragraph*" 
                        value={fourPara}
                        onChange={(e) => {
                            setFourPara(e.target.value);
                            setFormErrors(prev => ({...prev, fourPara: ''}));
                        }}
                        className={`w-full px-3 py-2 border rounded-md h-24 ${
                            formErrors.fourPara ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {formErrors.fourPara && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.fourPara}</p>
                    )}
                </div>

                <div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={handleImageUpload} 
                        className="w-full"
                        required
                    />
                    {formErrors.images && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.images}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                        Please upload exactly 3 images: 
                        1 for middle, 1 for right corner, and 1 big image
                    </p>
                </div>
                
                {uploadStatus && (
                    <div className={`w-full text-center p-2 rounded ${
                        uploadStatus.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                        {uploadStatus.message}
                    </div>
                )}
                
                {previewImages.length === 3 && (
                    <div className="w-full grid grid-cols-3 gap-4 mt-4">
                        {previewImages.map((preview, index) => (
                            <Image
                                key={index}
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover object-center rounded-md"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}