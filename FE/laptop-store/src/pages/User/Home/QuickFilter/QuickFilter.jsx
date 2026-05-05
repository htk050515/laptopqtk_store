// src/pages/User/Home/QuickFilter/QuickFilter.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PRICE_RANGES = [
    { label: 'Dưới 10 triệu', min: 0, max: 10 },
    { label: '10 - 15 triệu', min: 10, max: 15 },
    { label: '15 - 20 triệu', min: 15, max: 20 },
    { label: '20 - 30 triệu', min: 20, max: 30 },
    { label: '30 - 50 triệu', min: 30, max: 50 },
    { label: 'Trên 50 triệu', min: 50, max: 999 },
];

const NEEDS = [
    { label: 'Văn phòng', icon: '💼', slug: 'laptop-van-phong' },
    { label: 'Gaming', icon: '🎮', slug: 'laptop-gaming' },
    { label: 'Đồ họa', icon: '🎨', slug: 'laptop-do-hoa' },
    { label: 'Mỏng nhẹ', icon: '✈️', slug: 'laptop-mong-nhe' },
    { label: 'MacBook', icon: '🍎', slug: 'macbook' },
];

const BRANDS = ['ASUS', 'Lenovo', 'Dell', 'HP', 'MSI', 'Acer', 'Apple', 'LG'];

const SPECS = [
    { label: 'RAM 8GB', q: 'RAM 8GB' },
    { label: 'RAM 16GB', q: 'RAM 16GB' },
    { label: 'RAM 32GB', q: 'RAM 32GB' },
    { label: 'RTX 4060', q: 'RTX 4060' },
    { label: 'RTX 4070', q: 'RTX 4070' },
    { label: 'Core i5', q: 'Core i5' },
    { label: 'Core i7', q: 'Core i7' },
    { label: 'Apple M3', q: 'Apple M3' },
];

function QuickFilter({ categories = [] }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('need');
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [searchText, setSearchText] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchText) params.set('q', searchText);
        if (selectedPrice !== null) {
            params.set('min_price', PRICE_RANGES[selectedPrice].min * 1000000);
            params.set('max_price', PRICE_RANGES[selectedPrice].max * 1000000);
        }
        if (selectedBrand) params.set('q', (searchText ? searchText + ' ' : '') + selectedBrand);
        navigate(`/search?${params.toString()}`);
    };

    const handleNeed = (slug) => {
        navigate(`/category/${slug}`);
    };

    const handleSpec = (q) => {
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const handlePriceQuick = (range) => {
        navigate(`/search?min_price=${range.min * 1000000}&max_price=${range.max * 1000000}`);
    };

    const tabs = [
        { id: 'need', label: 'Nhu cầu' },
        { id: 'price', label: 'Giá tiền' },
        { id: 'brand', label: 'Thương hiệu' },
        { id: 'spec', label: 'Thông số' },
    ];

    return (
        <div className="container mx-auto mt-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                        </svg>
                        <span className="text-white font-bold text-lg">Tìm laptop phù hợp</span>
                    </div>
                    {/* Thanh tìm kiếm nhanh */}
                    <div className="flex gap-2 w-96">
                        <input
                            type="text"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder='VD: "laptop gaming dưới 20 triệu"'
                            className="flex-1 px-4 py-2 rounded-xl text-sm focus:outline-none"
                        />
                        <button onClick={handleSearch}
                            className="px-4 py-2 bg-white text-[#2563eb] rounded-xl font-bold text-sm hover:bg-blue-50 transition">
                            Tìm
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                                activeTab === tab.id
                                    ? 'text-[#2563eb] border-b-2 border-[#2563eb] bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="p-5">
                    {/* TAB: Nhu cầu */}
                    {activeTab === 'need' && (
                        <div className="flex flex-wrap gap-3">
                            {NEEDS.map(need => (
                                <button key={need.slug}
                                    onClick={() => handleNeed(need.slug)}
                                    className="flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-[#2563eb] hover:text-white border border-gray-200 hover:border-[#2563eb] rounded-xl text-sm font-medium transition-all duration-200 group">
                                    <span className="text-lg">{need.icon}</span>
                                    <span className="text-gray-700 group-hover:text-white">{need.label}</span>
                                </button>
                            ))}
                            <div className="ml-auto flex items-center text-xs text-gray-400 italic">
                                Click để xem sản phẩm theo nhu cầu →
                            </div>
                        </div>
                    )}

                    {/* TAB: Giá tiền */}
                    {activeTab === 'price' && (
                        <div className="flex flex-wrap gap-3">
                            {PRICE_RANGES.map((range, i) => (
                                <button key={i}
                                    onClick={() => handlePriceQuick(range)}
                                    className={`px-5 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                                        selectedPrice === i
                                            ? 'bg-[#2563eb] text-white border-[#2563eb]'
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#2563eb] hover:text-[#2563eb]'
                                    }`}>
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* TAB: Thương hiệu */}
                    {activeTab === 'brand' && (
                        <div className="flex flex-wrap gap-3">
                            {BRANDS.map(brand => (
                                <button key={brand}
                                    onClick={() => navigate(`/search?q=${encodeURIComponent(brand)}`)}
                                    className="flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-[#2563eb] hover:text-white border border-gray-200 hover:border-[#2563eb] rounded-xl text-sm font-medium transition-all duration-200 group">
                                    <img
                                        src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${brand.toLowerCase()}.svg`}
                                        alt={brand}
                                        className="w-5 h-5 object-contain group-hover:invert"
                                        style={{ filter: 'invert(11%) sepia(93%) saturate(6083%) hue-rotate(350deg) brightness(84%) contrast(116%)' }}
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                    <span className="text-gray-700 group-hover:text-white">{brand}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* TAB: Thông số */}
                    {activeTab === 'spec' && (
                        <div className="flex flex-wrap gap-3">
                            {SPECS.map(spec => (
                                <button key={spec.q}
                                    onClick={() => handleSpec(spec.q)}
                                    className="px-5 py-3 bg-gray-50 hover:bg-[#2563eb] hover:text-white border border-gray-200 hover:border-[#2563eb] rounded-xl text-sm font-medium transition-all duration-200 group">
                                    <span className="text-gray-700 group-hover:text-white">{spec.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuickFilter;
