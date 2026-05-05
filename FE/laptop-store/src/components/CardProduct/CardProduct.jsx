import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = "http://localhost:8000/storage/";

const LAPTOP_IMAGES = [
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
    "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&q=80",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&q=80",
    "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=400&q=80",
];

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/')) return `${BASE_URL}${imagePath.substring(1)}`;
    return `${BASE_URL}${imagePath}`;
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(Math.round(price)) + 'đ';

const CHIP_COLORS = [
    'bg-red-100 text-red-600',
    'bg-blue-100 text-blue-600',
    'bg-gray-100 text-gray-600',
];

function CardProduct({ product, index = 0 }) {
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [liked, setLiked] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (product?.variations?.length > 0) {
            const def = product.variations.find(v => v.is_default) || product.variations[0];
            setSelectedVariation(def);
        }
    }, [product]);

    if (!product?.variations?.length) return null;

    const price = parseFloat(selectedVariation?.price || product.base_price);
    const discountPrice = selectedVariation?.discount_price ? parseFloat(selectedVariation.discount_price) : null;
    const discountPct = discountPrice ? Math.round((1 - discountPrice / price) * 100) : null;

    const dbImg = selectedVariation?.images?.[0]?.image_path || product?.images?.[0]?.image_path;
    const imgSrc = (!imgError && dbImg) ? getImageUrl(dbImg) : LAPTOP_IMAGES[index % LAPTOP_IMAGES.length];

    // Chips thông số từ variation đang chọn (tối đa 3)
    const attrChips = (selectedVariation?.attributes || [])
        .slice(0, 3)
        .map(a => a.attribute_value?.display_value || a.attribute_value?.value)
        .filter(Boolean);

    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 group overflow-hidden relative flex flex-col">

            {/* Badge giảm giá */}
            {discountPct && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                    Giảm {discountPct}%
                </div>
            )}

            {/* Badge trả góp */}
            <div className="absolute top-3 right-9 z-10 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Trả góp 0%
            </div>

            {/* Nút yêu thích icon */}
            <button
                onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
                className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 transition-transform"
            >
                <svg className={`w-4 h-4 transition-colors ${liked ? 'text-red-500' : 'text-gray-400'}`}
                    fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            </button>

            {/* Ảnh */}
            <Link to={`/products/${product.id}`}>
                <div className="relative overflow-hidden bg-gray-50 h-52">
                    <img
                        src={imgSrc}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-[#2563eb] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-[#2563eb] text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                            Xem chi tiết
                        </span>
                    </div>
                </div>
            </Link>

            <div className="p-4 flex flex-col flex-1 gap-2">
                {/* Chips thông số */}
                {attrChips.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {attrChips.map((chip, i) => (
                            <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded ${CHIP_COLORS[i % CHIP_COLORS.length]}`}>
                                {chip}
                            </span>
                        ))}
                    </div>
                )}

                {/* Tên sản phẩm */}
                <Link to={`/products/${product.id}`}>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-[#2563eb] transition-colors leading-snug">
                        {product.name}
                    </h3>
                </Link>

                {/* Giá */}
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-red-500 font-black text-base">
                        {formatPrice(discountPrice || price)}
                    </span>
                    {discountPrice && (
                        <span className="text-gray-400 line-through text-xs">{formatPrice(price)}</span>
                    )}
                </div>

                {/* Nút yêu thích text */}
                <button
                    onClick={() => setLiked(!liked)}
                    className={`mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        liked
                            ? 'bg-red-50 border-red-300 text-red-500'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'
                    }`}
                >
                    <svg className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`}
                        fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    {liked ? 'Đã yêu thích' : 'Yêu thích'}
                </button>
            </div>
        </div>
    );
}

export default CardProduct;