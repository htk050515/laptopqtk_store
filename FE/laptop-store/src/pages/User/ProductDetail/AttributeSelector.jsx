
// AttributeSelector.jsx
import React from 'react';

const AttributeSelector = ({ attributeOptions, selectedAttributes, onAttributeSelect }) => {
    return (
        <>
            {Object.keys(attributeOptions).map(attrType => (
                <div key={attrType} className="mb-3">
                    <div className="font-medium mb-1">{attrType}:</div>
                    <div className="flex flex-wrap gap-2">
                        {attributeOptions[attrType].map((value, index) => (
                            <button
                                key={index}
                                onClick={() => onAttributeSelect(attrType, value)}
                                className={`text-sm px-3 py-1.5 font-medium rounded-md transition-all duration-200 ${selectedAttributes[attrType] === value
                                    ? 'bg-[#2563eb] text-white shadow-md'
                                    : 'border border-gray-300 text-gray-700 hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-blue-50'
                                    }`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
};

export default AttributeSelector;