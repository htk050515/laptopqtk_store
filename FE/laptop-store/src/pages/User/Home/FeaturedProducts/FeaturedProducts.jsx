// src/pages/User/Home/FeaturedProducts/FeaturedProducts.jsx
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(Math.round(price)) + 'đ';

const LAPTOP_IMAGES = [
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
    "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&q=80",
];

const BASE_URL = "http://localhost:8000/storage/";
const getImg = (path) => {
    if (!path) return null;
    if (path.startsWith('https://')) return path;
    if (path.startsWith('/')) return BASE_URL + path.substring(1);
    return BASE_URL + path;
};

function FeaturedCard({ product, index }) {
    const [liked, setLiked] = useState(false);
    const [imgError, setImgError] = useState(false);

    const variation = product.variations?.find(v => v.is_default) || product.variations?.[0];
    const price = parseFloat(variation?.price || product.base_price);
    const discountPrice = variation?.discount_price ? parseFloat(variation.discount_price) : null;
    const discountPct = discountPrice ? Math.round((1 - discountPrice / price) * 100) : null;
    const attrs = variation?.attributes?.slice(0, 3) || [];
    const attrChips = attrs.map(a => a.attribute_value?.display_value || a.attribute_value?.value).filter(Boolean);
    const dbImg = variation?.images?.[0]?.image_path || product?.images?.[0]?.image_path;
    const imgSrc = (!imgError && dbImg) ? getImg(dbImg) : LAPTOP_IMAGES[index % LAPTOP_IMAGES.length];

    return (
        <div className="flex-shrink-0 w-[250px] bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
            {discountPct && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                    Giảm {discountPct}%
                </div>
            )}
            <div className="absolute top-3 right-9 z-10 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Trả góp 0%
            </div>
            <button onClick={() => setLiked(!liked)}
                className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 transition-transform">
                <svg className={`w-4 h-4 ${liked ? 'text-red-500' : 'text-gray-400'}`}
                    fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            </button>
            <Link to={`/products/${product.id}`}>
                <div className="relative overflow-hidden bg-gray-50 h-48">
                    <img src={imgSrc} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImgError(true)}/>
                    <div className="absolute inset-0 bg-[#2563eb] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-[#2563eb] text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                            Xem chi tiết
                        </span>
                    </div>
                </div>
            </Link>
            <div className="p-3">
                {attrChips.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {attrChips.map((chip, i) => (
                            <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                i===0?'bg-red-100 text-red-600':i===1?'bg-blue-100 text-blue-600':'bg-gray-100 text-gray-600'}`}>
                                {chip}
                            </span>
                        ))}
                    </div>
                )}
                <Link to={`/products/${product.id}`}>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-[#2563eb] transition-colors leading-snug">
                        {product.name}
                    </h3>
                </Link>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-red-500 font-black text-base">{formatPrice(discountPrice||price)}</span>
                    {discountPrice && <span className="text-gray-400 line-through text-xs">{formatPrice(price)}</span>}
                </div>
                <button onClick={() => setLiked(!liked)}
                    className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        liked?'bg-red-50 border-red-300 text-red-500':'bg-gray-50 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'}`}>
                    <svg className={`w-4 h-4 ${liked?'fill-red-500 text-red-500':''}`}
                        fill={liked?"currentColor":"none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    {liked?'Đã yêu thích':'Yêu thích'}
                </button>
            </div>
        </div>
    );
}

function FeaturedProducts({ products=[], isLoading=false }) {
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir==='left'?-270:270, behavior:'smooth' });
    if (!isLoading && products.length===0) return null;
    return (
        <section className="mt-10">
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 py-4 px-6 flex items-center justify-center gap-3 mb-6">
                <svg className="w-6 h-6 text-yellow-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                </svg>
                <h2 className="text-white text-2xl font-black tracking-wide uppercase">
                    Sản phẩm <span className="text-yellow-300">Nổi Bật</span>
                </h2>
                <svg className="w-6 h-6 text-yellow-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                </svg>
            </div>
            <div className="container mx-auto">
                <div className="flex justify-end mb-4">
                    <button onClick={() => navigate('/search?featured=true')}
                        className="text-sm text-[#2563eb] font-semibold hover:underline flex items-center gap-1">
                        Xem tất cả
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
                {isLoading ? (
                    <div className="flex gap-5">
                        {[...Array(5)].map((_,i) => (
                            <div key={i} className="flex-shrink-0 w-[250px] h-[370px] bg-gray-100 rounded-2xl animate-pulse"/>
                        ))}
                    </div>
                ) : (
                    <div className="relative">
                        <button onClick={() => scroll('left')}
                            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border-2 border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-200 group/btn">
                            <svg className="w-5 h-5 text-gray-600 group-hover/btn:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                            </svg>
                        </button>
                        <button onClick={() => scroll('right')}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border-2 border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-200 group/btn">
                            <svg className="w-5 h-5 text-gray-600 group-hover/btn:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-3"
                            style={{ scrollbarWidth:'none', msOverflowStyle:'none' }}>
                            {products.map((product, index) => (
                                <FeaturedCard key={product.id} product={product} index={index}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default FeaturedProducts;