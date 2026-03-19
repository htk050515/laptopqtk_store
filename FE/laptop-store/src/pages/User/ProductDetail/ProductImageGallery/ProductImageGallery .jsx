import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { baseUrl } from '../../../../constants/config';

const ProductImageGallery = ({ images }) => {
    const APP_URL = baseUrl;

    // Helper function to get image URL - supports both CDN and local storage
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/500?text=No+Image';
        
        // If image path is already a full HTTPS URL (CDN), return as is
        if (imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // If image path starts with /storage/, remove it and use APP_URL
        if (imagePath.startsWith('/storage/')) {
            return `${APP_URL}/storage${imagePath.substring(8)}`;
        }
        
        // If image path starts with /, it's a relative path from storage
        if (imagePath.startsWith('/')) {
            return `${APP_URL}/storage${imagePath}`;
        }
        
        // Otherwise, prepend APP_URL/storage/
        return `${APP_URL}/storage/${imagePath}`;
    };

    // Format image paths and filter out any invalid ones
    const formattedImages = images
        .filter(image => image && typeof image === 'string')
        .map(image => getImageUrl(image));

    // Debug log
    useEffect(() => {
        console.log('Formatted Images:', formattedImages);
    }, [formattedImages]);

    // State for the currently selected image
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageTransition, setImageTransition] = useState('');

    // Set the main image based on the selected index
    const mainImage = formattedImages[selectedImageIndex] || '';

    // Handle thumbnail click with proper index tracking
    const handleThumbnailClick = (index) => {
        console.log('Thumbnail clicked:', index, formattedImages[index]);

        // Start animation
        setImageTransition('animate-slide-in-right');

        // Update the selected index after animation completes
        setTimeout(() => {
            setSelectedImageIndex(index);
            setImageTransition('');
        }, 150);
    };

    // Settings for thumbnail slider
    const thumbnailSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        variableWidth: true,
        centerMode: false,
        focusOnSelect: false, // Disable focusOnSelect as we're handling clicks manually
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                }
            }
        ]
    };

    // Check if we have valid images to display
    if (formattedImages.length === 0) {
        return <div className="text-center py-6">No product images available</div>;
    }

    return (
        <div className="w-full">
            {/* Main image */}
            <div className="mb-4 border rounded-lg overflow-hidden bg-gray-50">
                <img
                    src={mainImage}
                    alt="Product image"
                    className={`w-full h-auto md:h-[500px] object-contain transition-transform duration-300 ${imageTransition}`}
                />
            </div>

            {/* Thumbnail slider with explicit click handlers */}
            <div className="w-full mt-4">
                <Slider {...thumbnailSettings}>
                    {formattedImages.map((image, index) => (
                        <div
                            key={index}
                            className="px-1 cursor-pointer outline-none"
                            onClick={() => handleThumbnailClick(index)}
                        >
                            <div className="w-20 h-20 flex-shrink-0">
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`w-full h-full object-cover rounded-lg border-2 transition-all duration-200
                                    ${selectedImageIndex === index ? 'border-[#2563eb] shadow-md' : 'border-gray-300 hover:border-gray-400'}`}
                                />
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>

            {/* Debug information - remove in production */}
            <div className="hidden">
                Selected index: {selectedImageIndex}
                Current main image: {mainImage}
            </div>
        </div>
    );
};

export default ProductImageGallery;