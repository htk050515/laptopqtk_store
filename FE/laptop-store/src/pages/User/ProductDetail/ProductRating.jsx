
// ProductRating.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const ProductRating = () => {
    return (
        <div className="flex items-center gap-2 my-2">
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} className="mr-1" />)}
            </div>
            <span className="text-sm text-gray-600">(10 đánh giá)</span>
        </div>
    );
};

export default ProductRating;