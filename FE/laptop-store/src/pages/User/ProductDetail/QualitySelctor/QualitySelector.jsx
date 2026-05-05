import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

const QuantitySelector = ({
    quantity,
    onIncrease,
    onDecrease,
    min = 1,
    max = 10
}) => {
    return (
        <div className="flex items-center border rounded-lg overflow-hidden w-[120px]">
            <button
                onClick={onDecrease}
                disabled={quantity <= min}
                className={`
                    p-2 text-white transition-colors duration-300 
                    ${quantity <= min
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#2563eb] hover:bg-[#1d4ed8]'}
                `}
            >
                <FontAwesomeIcon icon={faMinus} size="sm" />
            </button>
            <input
                type="number"
                value={quantity}
                readOnly
                className="w-full text-center border-x py-1 appearance-none"
            />
            <button
                onClick={onIncrease}
                disabled={quantity >= max}
                className={`
                    p-2 text-white transition-colors duration-300 
                    ${quantity >= max
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#2563eb] hover:bg-[#1d4ed8]'}
                `}
            >
                <FontAwesomeIcon icon={faPlus} size="sm" />
            </button>
        </div>
    );
};

export default QuantitySelector;