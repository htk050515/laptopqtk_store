import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = "http://localhost:8000/storage/";

// Helper function to get image URL - supports both CDN and local storage
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x300?text=No+Image';
    
    // If image path is already a full HTTPS URL (CDN), return as is
    if (imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If image path starts with /, it's a relative path from storage
    if (imagePath.startsWith('/')) {
        return `${BASE_URL}${imagePath.substring(1)}`;
    }
    
    // Otherwise, prepend BASE_URL
    return `${BASE_URL}${imagePath}`;
};

function CardProduct({ product }) {
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [attributes, setAttributes] = useState([]);

    useEffect(() => {
        if (product && product.variations && product.variations.length > 0) {
            // Set default variation (either the one marked as default or the first one)
            const defaultVariation = product.variations.find(v => v.is_default) || product.variations[0];
            setSelectedVariation(defaultVariation);

            // Extract unique attribute types from all variations
            extractAttributes();
        }
    }, [product]);

    const extractAttributes = () => {
        if (!product || !product.variations) return;

        // Create a map to store unique attributes by type
        const attributeMap = new Map();

        // Go through all variations and collect unique attribute values
        product.variations.forEach(variation => {
            if (variation.attributes) {
                variation.attributes.forEach(attr => {
                    if (attr.attribute_value && attr.attribute_value.attribute_type) {
                        const typeId = attr.attribute_value.attribute_type.id;
                        const typeName = attr.attribute_value.attribute_type.display_name;

                        if (!attributeMap.has(typeId)) {
                            attributeMap.set(typeId, {
                                typeId,
                                typeName,
                                values: []
                            });
                        }

                        // Add the attribute value if it doesn't exist
                        const currentAttr = attributeMap.get(typeId);
                        const valueExists = currentAttr.values.some(v =>
                            v.id === attr.attribute_value.id
                        );

                        if (!valueExists) {
                            currentAttr.values.push({
                                id: attr.attribute_value.id,
                                value: attr.attribute_value.display_value,
                                variations: [variation.id]
                            });
                        } else {
                            // Add this variation to the existing value
                            const existingValue = currentAttr.values.find(v =>
                                v.id === attr.attribute_value.id
                            );
                            if (!existingValue.variations.includes(variation.id)) {
                                existingValue.variations.push(variation.id);
                            }
                        }
                    }
                });
            }
        });

        // Convert map to array
        setAttributes(Array.from(attributeMap.values()));
    };

    const handleAttributeSelect = (attrTypeId, valueId) => {
        // Find all variations that have this attribute value
        const validVariations = product.variations.filter(variation =>
            variation.attributes && variation.attributes.some(attr =>
                attr.attribute_value && attr.attribute_value.id === valueId
            )
        );

        if (validVariations.length > 0) {
            setSelectedVariation(validVariations[0]);
        }
    };

    // Return empty div if no product or variations
    if (!product || !product.variations || product.variations.length === 0) {
        return <div className="hidden"></div>;
    }

    // Get the price to display
    const price = selectedVariation ? selectedVariation.price : product.base_price;
    const discountPrice = selectedVariation ? selectedVariation.discount_price : null;

    // Format price in Vietnamese currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price).replace('₫', '').trim() + ' ₫';
    };
    console.log("product", product);
    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 group overflow-hidden">
            <Link to={`/products/${product.id}`}>
                <div className="relative overflow-hidden bg-gray-50">
                    {/* Product image */}
                    <img
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                        src={
                            selectedVariation && selectedVariation.images && selectedVariation.images.length > 0
                                ? getImageUrl(selectedVariation.images[0].image_path)
                                : product.images && product.images.length > 0
                                    ? getImageUrl(product.images[0].image_path)
                                    : 'https://via.placeholder.com/300x300?text=No+Image'
                        }
                        alt={product.name}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                    />

                    {/* Discount badge */}
                    {discountPrice && (
                        <div className="absolute top-3 right-3 bg-[#2563eb] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            -{Math.round((1 - discountPrice / price) * 100)}%
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4 space-y-3">
                {/* Product name */}
                <Link to={`/products/${product.id}`}>
                    <h3 className="text-center text-base font-semibold text-gray-800 group-hover:text-[#2563eb] transition-colors duration-200 line-clamp-2 min-h-[3rem] leading-tight">
                        {product.name}
                    </h3>
                </Link>

                {/* Product price */}
                <div className="text-center">
                    {discountPrice ? (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[#2563eb] text-lg font-bold">{formatPrice(discountPrice)}</span>
                            <span className="text-gray-400 line-through text-sm">{formatPrice(price)}</span>
                        </div>
                    ) : (
                        <span className="text-[#2563eb] text-lg font-bold">{formatPrice(price)}</span>
                    )}
                </div>

                {/* Attributes selection - Chỉ hiển thị tối đa 2 loại thuộc tính, mỗi loại tối đa 4 giá trị */}
                {attributes.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                        {attributes.slice(0, 2).map((attributeType) => {
                            // Giới hạn tối đa 4 giá trị mỗi loại
                            const displayValues = attributeType.values.slice(0, 4);
                            const hasMore = attributeType.values.length > 4;

                            return (
                                <div key={attributeType.typeId} className="mb-2 last:mb-0">
                                    <div className="text-xs text-gray-500 font-medium mb-1 text-center">
                                        {attributeType.typeName}
                                        {hasMore && <span className="text-gray-400 ml-1">(+{attributeType.values.length - 4})</span>}
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {displayValues.map((attrValue) => {
                                            // Check if the current attribute value is in the selected variation
                                            const isSelected = selectedVariation && selectedVariation.attributes &&
                                                selectedVariation.attributes.some(attr =>
                                                    attr.attribute_value && attr.attribute_value.id === attrValue.id
                                                );

                                            return (
                                                <button
                                                    key={attrValue.id}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAttributeSelect(attributeType.typeId, attrValue.id);
                                                    }}
                                                    className={`
                                                        text-[10px] px-2 py-1 rounded font-medium transition-all duration-200
                                                        ${isSelected
                                                            ? 'bg-[#2563eb] text-white shadow-sm'
                                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:border-[#2563eb] hover:text-[#2563eb]'}
                                                    `}
                                                >
                                                    {attrValue.value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {attributes.length > 2 && (
                            <div className="text-center mt-2">
                                <span className="text-xs text-gray-400">
                                    +{attributes.length - 2} thuộc tính khác
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CardProduct;