'use client';
import { useState, useEffect } from 'react';
import ProductCreateForm from "../components/products/ProductCreateForm";
import HomeUploadForm from '../home_upload/home_upload';
import AboutUploadForm from '../about_upload/aboutUpload';

const AwsUpload = () => {
    const [activeSection, setActiveSection] = useState<'product' | 'home' | 'about'>('product');
    const [homeImageCount, setHomeImageCount] = useState(0);
    const [aboutImageCount, setAboutImageCount] = useState(0);

    // State for limit checks
    const [homeLimit, setHomeLimit] = useState(false);
    const [aboutLimit, setAboutLimit] = useState(false);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Check limits on component mount
    useEffect(() => {
        const checkLimits = async () => {
            setLoading(true); // Start loading

            try {
                // Check home image limit
                const homeResponse = await fetch('/api/limitCheck/home');
                const homeData = await homeResponse.json();
                setHomeLimit(homeData.limitReached);

                // Check about content limit
                const aboutResponse = await fetch('/api/limitCheck/about');
                const aboutData = await aboutResponse.json();
                setAboutLimit(aboutData.limitReached);
            } catch (error) {
                console.error('Limit check error:', error);
            } finally {
                setLoading(false); // Stop loading once both API calls complete
            }
        };

        checkLimits();
    }, []);

    const handleHomeImageUploadComplete = () => {
        setHomeImageCount(prevCount => prevCount + 1);
        // If home count reaches 6, update limit
        if (homeImageCount + 1 >= 6) {
            setHomeLimit(true);
        }
    };

    const handleAboutImageUploadComplete = () => {
        setAboutImageCount(prevCount => prevCount + 1);
        // If about count reaches 1, update limit
        if (aboutImageCount + 1 >= 1) {
            setAboutLimit(true);
        }
    };

    return (
        <div className="container mx-auto p-6  pt-24 sm:pt-28 md:pt-36 ">
            {loading ? ( // Display loading message while data is being fetched
                <div className="text-center">
                    <p className="text-lg text-gray-700">Loading...</p>
                </div>
            ) : (
                <>
                    <div className="flex mb-6">
                        <button
                            className={`mr-4 px-4 py-2 rounded ${
                                activeSection === 'product'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                            onClick={() => setActiveSection('product')}
                        >
                            Product
                        </button>
                        <button
                            className={`mr-4 px-4 py-2 rounded ${
                                activeSection === 'home'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            } ${
                                homeLimit
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-700'
                            }`}
                            onClick={() => !homeLimit && setActiveSection('home')}
                            disabled={homeLimit}
                        >
                            Home {homeLimit ? `(Limit Reached)` : ''}
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${
                                activeSection === 'about'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            } ${
                                aboutLimit
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-700'
                            }`}
                            onClick={() => !aboutLimit && setActiveSection('about')}
                            disabled={aboutLimit}
                        >
                            About {aboutLimit ? `(Limit Reached)` : ''}
                        </button>
                    </div>

                    {activeSection === 'product' ? (
                        <ProductCreateForm />
                    ) : activeSection === 'home' ? (
                        <HomeUploadForm
                            onImageUploadComplete={handleHomeImageUploadComplete}
                            remainingSlots={6 - homeImageCount}
                        />
                    ) : (
                        <AboutUploadForm
                            onImageUploadComplete={handleAboutImageUploadComplete}
                            remainingSlots={1 - aboutImageCount}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default AwsUpload;
