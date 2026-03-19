
// ProductInfo.jsx
import React from 'react';

const ProductInfo = ({ product, selectedVariation, variationTableData, formatPrice }) => {
    return (
        <div>
            <div>– Mã SP: {selectedVariation?.sku || product?.id}</div>
            <div className='text-lg mt-2'>{product?.name}</div>
            <div className='mt-2'>– {product?.description}</div>
            <div className='mt-2'>– Thông tin chi tiết:</div>
            {variationTableData.map((item, index) => (
                <div className='mt-2' key={index}>
                    + {Object.keys(item.attributes).map(attr =>
                        `${attr}: ${item.attributes[attr]}`
                    ).join(', ')}: {formatPrice(item.price)}
                    {item.discount_price > 0
                        ? ` (Giảm còn ${formatPrice(item.discount_price)})`
                        : ''}
                </div>
            ))}
        </div>
    );
};

export default ProductInfo;

