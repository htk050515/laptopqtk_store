import React, { useState, useEffect } from 'react';

function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 bg-[#2563eb] text-white border-none rounded-full w-12 h-12 flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 hover:bg-[#1d4ed8] hover:shadow-xl hover:scale-110 z-50 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{
                display: visible ? 'flex' : 'none',
            }}
        >
            ↑
        </button>
    );
}

export default BackToTopButton;