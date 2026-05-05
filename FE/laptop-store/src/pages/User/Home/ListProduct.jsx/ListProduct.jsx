// src/pages/User/Home/ListProduct.jsx/ListProduct.jsx
import React from "react";
import CardProduct from "../../../../components/CardProduct/CardProduct";

function ListProduct({ categories=[], productsByCategory={}, isLoading=false, errorMessage="" }) {
    // Đếm tổng sản phẩm đã render để offset index ảnh Unsplash
    let globalIndex = 0;

    return (
        <div className="container mx-auto mt-10">
            {errorMessage && (
                <div className="text-center text-red-500 my-4">{errorMessage}</div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
                </div>
            ) : (
                <>
                    {categories.map((category) => {
                        const categoryProducts = productsByCategory[category.id] || [];
                        return (
                            <div key={category.id} className="mb-16">
                                {/* Header danh mục */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-8 bg-[#2563eb] rounded-full"></div>
                                    <div className="text-2xl font-black text-[#2563eb]">
                                        {category.name}
                                    </div>
                                </div>
                                <div className="border-b-2 border-[#2563eb] mb-6"></div>

                                {categoryProducts.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {categoryProducts.map((product) => {
                                                const idx = globalIndex++;
                                                return (
                                                    <CardProduct
                                                        key={product.id}
                                                        product={product}
                                                        index={idx}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="mt-8 flex justify-center">
                                            <button className="uppercase flex items-center gap-2 text-sm font-bold px-6 py-2.5 bg-[#2563eb] rounded-xl text-white hover:bg-[#1d4ed8] transition-colors duration-300">
                                                Xem tất cả {category.name}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-10 text-gray-400">
                                        Không có sản phẩm nào trong danh mục này
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

export default ListProduct;