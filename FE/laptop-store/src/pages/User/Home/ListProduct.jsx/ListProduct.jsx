// ListProduct.jsx
import React from "react";
import CardProduct from "../../../../components/CardProduct/CardProduct";

function ListProduct({ categories = [], productsByCategory = {}, isLoading = false, errorMessage = "" }) {
    return (
        <div className="container mx-auto mt-10">
            {/* Error message */}
            {errorMessage && (
                <div className="text-center text-red-500 my-4">{errorMessage}</div>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="flex justify-center items-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
                </div>
            ) : (
                <>
                    {/* Display all categories with their products */}
                    {categories.map((category) => {
                        const categoryProducts = productsByCategory[category.id] || [];

                        return (
                            <div key={category.id} className="mb-16">
                                {/* Category title */}
                                <div className="text-center text-2xl font-black text-[#2563eb]">
                                    BST {category.name}
                                </div>
                                <div className="border-b-2 border-[#2563eb] my-5"></div>

                                {/* Products for this category */}
                                {categoryProducts.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mt-2">
                                            {categoryProducts.map((product) => (
                                                <CardProduct key={product.id} product={product} />
                                            ))}
                                        </div>

                                        {/* View all button for this category */}
                                        <div className="mt-8 flex justify-center">
                                            <button className="uppercase flex items-center text-sm font-bold px-5 py-2 bg-[#2563eb] rounded-lg text-white transition-colors duration-300 hover:bg-[#1d4ed8]">
                                                <span>
                                                    Xem tất cả {category.name}
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        Không tìm thấy sản phẩm nào trong danh mục này
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