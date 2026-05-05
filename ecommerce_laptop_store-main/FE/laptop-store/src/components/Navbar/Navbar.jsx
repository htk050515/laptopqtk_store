import React, { useState, useEffect } from "react";
import categoryApi from "../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../api/AdminApi/ProductApi/productApi";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:8000/storage/";

// Helper function to get image URL - supports both CDN and local storage
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x300?text=No+Image';
    
    // If image path is already a full HTTPS URL (CDN), return as is
    if (imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If image path starts with /storage/, remove it and use BASE_URL
    if (imagePath.startsWith('/storage/')) {
        return `${BASE_URL}${imagePath.substring(9)}`;
    }
    
    // If image path starts with /, it's a relative path from storage
    if (imagePath.startsWith('/')) {
        return `${BASE_URL}${imagePath.substring(1)}`;
    }
    
    // Otherwise, prepend BASE_URL
    return `${BASE_URL}${imagePath}`;
};

function Navbar() {
    const [categories, setCategories] = useState([]);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (hoveredItem) {
            fetchProductsByCategory(hoveredItem);
        }
    }, [hoveredItem]);

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getListCategories();

            if (response.status === 200 && Array.isArray(response.data)) {
                setCategories(response.data.slice(0, 5)); // Chỉ lấy 5 danh mục đầu tiên
            }
        } catch (error) {
            console.error("❌ Lỗi tải danh mục:", error);
        }
    };

    const fetchProductsByCategory = async (categoryId) => {
        // Kiểm tra xem đã có dữ liệu cho danh mục này chưa
        if (categoryProducts[categoryId]) return;

        setIsLoading(true);
        try {
            const response = await productApi.searchProducts({ category_id: categoryId });

            if (response.status === 200 && Array.isArray(response.data)) {
                setCategoryProducts(prev => ({
                    ...prev,
                    [categoryId]: response.data.slice(0, 4) // Chỉ lấy 4 sản phẩm đầu tiên
                }));
            }
        } catch (error) {
            console.error(`❌ Lỗi tải sản phẩm cho danh mục ${categoryId}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm hiển thị thông tin thuộc tính
    const displayAttributes = (variation) => {
        if (!variation || !variation.attributes) return "";

        return variation.attributes.map(attr => {
            if (!attr.attribute_value || !attr.attribute_value.attribute_type) return "";

            return `${attr.attribute_value.attribute_type.display_name}: ${attr.attribute_value.display_value}`;
        }).filter(Boolean).join(", ");
    };

    // Hàm định dạng giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <nav className="w-full bg-[#2563eb] sticky top-0 z-40 shadow-md">
            <div className="container mx-auto px-4">
                <ul className="flex gap-10 text-white text-sm uppercase relative font-bold">
                    {/* Trang chủ */}
                    {/* <li className="group">
                        <Link
                            to="/"
                            className="block py-4 hover:bg-white/10 transition-colors duration-300 text-center"
                        >
                            Trang chủ
                        </Link>
                    </li> */}

                    {/* Danh mục động từ API */}
                    {categories.map((category) => (
                        <li
                            key={category.id}
                            className=" w-max"
                            onMouseEnter={() => setHoveredItem(category.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <Link
                                to={`/category/${category.slug}`}
                                className="py-4 transition-colors duration-300 flex items-center justify-center gap-1"
                            >
                                {category.name}
                                <i className="fas fa-angle-down text-xs"></i>
                            </Link>

                            {/* Dropdown rộng full navbar */}
                            {hoveredItem === category.id && (
                                <div className="absolute left-0 top-full w-full bg-white text-black shadow-lg rounded-b-lg p-6 grid grid-cols-4 justify-start items-start gap-6 animate-fadeIn">
                                    <div className="col-span-1">
                                        {category.image ? (
                                            <img
                                                src={getImageUrl(category.image)}
                                                alt={category.name}
                                                className="w-full h-28 object-cover rounded-md border"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-28 bg-gray-200 rounded-md border flex items-center justify-center">
                                                <span className="text-gray-400">Không có hình ảnh</span>
                                            </div>
                                        )}
                                        <div className="mt-4">
                                            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                                            <p className="text-gray-600 text-sm">{category.description || "Chưa có mô tả"}</p>
                                            <Link
                                                to={`/category/${category.slug}`}
                                                className="mt-4 block px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition text-center"
                                            >
                                                Xem tất cả
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-span-3 grid grid-cols-3 gap-4">
                                        <div className="text-lg font-semibold col-span-3 border-b pb-2">Sản phẩm nổi bật</div>

                                        {isLoading ? (
                                            <div className="col-span-3 text-center text-[#2563eb]">
                                                Đang tải sản phẩm...
                                            </div>
                                        ) : categoryProducts[category.id] && categoryProducts[category.id].length > 0 ? (
                                            categoryProducts[category.id].map((product) => (
                                                <Link key={product.id} to={`/products/${product.id}`}>
                                                    <div className="group col-span-1 h-full border rounded-md p-3 text-[#2563eb] hover:bg-[#2563eb]  hover:text-white cursor-pointer">
                                                        <div key={product.id} className="flex gap-3 items-start">
                                                            <div className="w-16 h-16 flex-shrink-0">
                                                                {product.images && product.images.length > 0 ? (
                                                                    <img
                                                                        src={getImageUrl(product.images[0].image_path)}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-cover rounded-md"
                                                                        onError={(e) => {
                                                                            e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                                                        <span className="text-xs text-[#2563eb]">No image</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 text-[#2563eb]">
                                                                <Link to={`/product/${product.slug}`} className="font-medium text-sm text-[#2563eb] group-hover:text-white hover:text-[#1d4ed8] transition">
                                                                    {product.name}
                                                                </Link>
                                                                {product.variations && product.variations.length > 0 && (
                                                                    <>
                                                                        <div className="text-xs text-[#2563eb] group-hover:text-white mt-1">
                                                                            {displayAttributes(product.variations[0])}
                                                                        </div>
                                                                        <div className="text-xs text-[#2563eb] font-medium mt-1">
                                                                            {product.variations[0].discount_price ? (
                                                                                <>
                                                                                    <span className="text-[#2563eb] group-hover:text-white">{formatPrice(product.variations[0].discount_price)}</span>
                                                                                    <span className="line-through text-[#2563eb] group-hover:text-white ml-1">{formatPrice(product.variations[0].price)}</span>
                                                                                </>
                                                                            ) : (
                                                                                <span>{formatPrice(product.variations[0].price)}</span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center text-gray-500">
                                                Không có sản phẩm nào
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;