'use client'
import { useState } from 'react'
import Image from 'next/image'

interface HomeUploadFormProps {
    onImageUploadComplete: () => void;
    remainingSlots: number;
}

export default function HomeUploadForm({ 
    onImageUploadComplete, 
    remainingSlots 
}: HomeUploadFormProps) {
    const [title, setTitle] = useState('');
    const [firstPara, setFirstPara] = useState('');
    const [secondPara, setSecondPara] = useState('');
    const [thirdPara, setThirdPara] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [formErrors, setFormErrors] = useState<{
        title: string;
        firstPara: string;
        secondPara: string;
    }>({
        title: '',
        firstPara: '',
        secondPara: ''
    });

    const validateForm = () => {
        const errors = {
            title: title.trim() ? '' : 'Title is required',
            firstPara: firstPara.trim() ? '' : 'First paragraph is required',
            secondPara: secondPara.trim() ? '' : 'Second paragraph is required'
        };

        setFormErrors(errors);
        return !errors.title && !errors.firstPara && !errors.secondPara;
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // First, validate the form
        if (!validateForm()) {
            return;
        }

        const file = event.target.files?.[0];
        if (file) {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('first_para', firstPara);
            formData.append('second_para', secondPara);
            formData.append('third_para', thirdPara);

            try {
                // Send to API route
                const response = await fetch('/api/home', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    setUploadStatus({
                        success: true,
                        message: 'Image uploaded successfully!'
                    });
                    onImageUploadComplete(); // Increment image count
                    
                    // Reset form
                    setTitle('');
                    setFirstPara('');
                    setSecondPara('');
                    setThirdPara('');
                    setPreviewImage(null);
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
                    message: 'Error uploading image'
                });
                console.error('Error uploading image:', error);
            }
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto  p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Home Image Upload {remainingSlots < 6 ? `(${remainingSlots} slots left)` : ''}
            </h2>

            <div className="space-y-4">
                <div>
                    <input 
                        type="text" 
                        placeholder="Title*" 
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setFormErrors(prev => ({...prev, title: ''}));
                        }}
                        className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.title ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {formErrors.title && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
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

                <textarea 
                    placeholder="Third Paragraph (Optional)" 
                    value={thirdPara}
                    onChange={(e) => setThirdPara(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md h-24"
                />

                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="w-full"
                    disabled={remainingSlots === 0}
                />
                
                {uploadStatus && (
                    <div className={`w-full text-center p-2 rounded ${
                        uploadStatus.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                        {uploadStatus.message}
                    </div>
                )}
                
                {previewImage && (
                    <div className="w-full flex justify-center mt-4">
                        <Image
                            src={previewImage}
                            alt="Preview"
                            width={440}
                            height={294}
                            className="object-cover object-center rounded-md"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}