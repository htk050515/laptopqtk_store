import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import banner1 from "../../../../assets/Home/banner1.png";
import banner2 from "../../../../assets/Home/banner2.png";
import banner3 from "../../../../assets/Home/banner3.png";

const Banner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Images with correct src import
    const images = [
        { src: banner1, alt: 'Banner 1' },
        { src: banner2, alt: 'Banner 2' },
        { src: banner3, alt: 'Banner 3' },
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    // Auto-advance slides
    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000);
        return () => clearInterval(slideInterval);
    }, []);

    return (
        <div className="relative w-full overflow-hidden h-[500px]">
            {/* Slide Container */}
            <div className="relative w-full h-full">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                ))}
            </div>
            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2 text-white text-xl hover:text-pink-400 rounded-full p-2 transition-all duration-300"
            >
                <FontAwesomeIcon icon={faChevronLeft} className="text-white hover:pink-400 text-5xl" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2 text-white text-xl hover:text-pink-400 rounded-full p-2 transition-all duration-300"
            >
                <FontAwesomeIcon icon={faChevronRight} className="text-white hover:pink-400 text-5xl" />
            </button>


            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                            ? 'bg-white'
                            : 'bg-white/50 hover:bg-white/75'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Banner;