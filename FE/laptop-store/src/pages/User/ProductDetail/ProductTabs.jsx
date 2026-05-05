
// ProductTabs.jsx
import React, { useState } from 'react';
import ProductInfo from './ProductInfo';
import ProductComments from './ProductComments';

const ProductTabs = ({ product, selectedVariation, variationTableData, formatPrice }) => {
    const [selectedTab, setSelectedTab] = useState('info');

    return (
        <div className="container mx-auto mt-6">
            <div className="flex border-b">
                <button
                    className={`py-2 px-4 font-semibold ${selectedTab === 'info' ? 'border-b-2 border-[#2563eb] text-[#2563eb]' : 'text-gray-600'}`}
                    onClick={() => setSelectedTab('info')}
                >
                    Thông tin sản phẩm
                </button>
                <button
                    className={`py-2 px-4 font-semibold ${selectedTab === 'comments' ? 'border-b-2 border-[#2563eb] text-[#2563eb]' : 'text-gray-600'}`}
                    onClick={() => setSelectedTab('comments')}
                >
                    Bình luận
                </button>
            </div>

            <div className="p-4">
                {selectedTab === 'info' && (
                    <ProductInfo
                        product={product}
                        selectedVariation={selectedVariation}
                        variationTableData={variationTableData}
                        formatPrice={formatPrice}
                    />
                )}

                {selectedTab === 'comments' && (
                    <ProductComments productId={product.id} />
                )}
            </div>
        </div>
    );
};

export default ProductTabs;