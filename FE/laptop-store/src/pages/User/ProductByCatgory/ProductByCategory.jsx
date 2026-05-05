import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import CardProduct from "../../../components/CardProduct/CardProduct";
import Footer from "../../../components/Footer/Footer";
import productApi from '../../../api/AdminApi/ProductApi/productApi';
import categoryApi from '../../../api/AdminApi/CategoryApi/categoryApi';
import path from '../../../constants/path';

const PRICE_RANGES = [
    { label: 'Tất cả', min: null, max: null },
    { label: 'Dưới 10 triệu', min: null, max: 10000000 },
    { label: '10 - 15 triệu', min: 10000000, max: 15000000 },
    { label: '15 - 20 triệu', min: 15000000, max: 20000000 },
    { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
    { label: '30 - 50 triệu', min: 30000000, max: 50000000 },
    { label: 'Trên 50 triệu', min: 50000000, max: null },
];

const SORT_OPTIONS = [
    { label: 'Mặc định', value: 'default' },
    { label: 'Giá tăng dần', value: 'price_asc' },
    { label: 'Giá giảm dần', value: 'price_desc' },
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Nổi bật', value: 'featured' },
];

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

function ProductByCategory() {
    const { categoryId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(true);

    // Filter states
    const [selectedPrice, setSelectedPrice] = useState(0);
    const [customMin, setCustomMin] = useState('');
    const [customMax, setCustomMax] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [searchText, setSearchText] = useState('');
    const [onlyDiscount, setOnlyDiscount] = useState(false);
    const [onlyFeatured, setOnlyFeatured] = useState(false);
    const [selectedBrands, setSelectedBrands] = useState([]);

    // Lấy danh sách thương hiệu từ sản phẩm
    const brands = [...new Set(allProducts.map(p => {
        const name = p.name.toLowerCase();
        for (const b of ['asus', 'lenovo', 'dell', 'hp', 'msi', 'acer', 'apple', 'lg', 'samsung', 'gigabyte']) {
            if (name.includes(b)) return b.toUpperCase() === 'HP' ? 'HP' : b.charAt(0).toUpperCase() + b.slice(1);
        }
        return null;
    }).filter(Boolean))];

    useEffect(() => {
        fetchData();
    }, [categoryId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                categoryApi.getListCategories(),
                productApi.getProductByCategory(categoryId),
            ]);
            if (catRes.status === 200) {
                const cat = catRes.data.find(c => c.slug === categoryId || c.id == categoryId);
                setCategory(cat);
            }
            if (prodRes.status === 200) {
                setAllProducts(prodRes.data);
                setFilteredProducts(prodRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters
    useEffect(() => {
        let result = [...allProducts];

        // Filter text
        if (searchText.trim()) {
            result = result.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        // Filter brand
        if (selectedBrands.length > 0) {
            result = result.filter(p =>
                selectedBrands.some(b => p.name.toLowerCase().includes(b.toLowerCase()))
            );
        }

        // Filter price range
        const range = PRICE_RANGES[selectedPrice];
        const minP = customMin ? parseInt(customMin) * 1000000 : range.min;
        const maxP = customMax ? parseInt(customMax) * 1000000 : range.max;
        if (minP) result = result.filter(p => parseFloat(p.base_price) >= minP);
        if (maxP) result = result.filter(p => parseFloat(p.base_price) <= maxP);

        // Filter discount
        if (onlyDiscount) {
            result = result.filter(p => p.variations?.some(v => v.discount_price));
        }

        // Filter featured
        if (onlyFeatured) {
            result = result.filter(p => p.featured);
        }

        // Sort
        if (sortBy === 'price_asc') result.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
        else if (sortBy === 'price_desc') result.sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price));
        else if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (sortBy === 'featured') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

        setFilteredProducts(result);
    }, [allProducts, searchText, selectedPrice, customMin, customMax, sortBy, onlyDiscount, onlyFeatured, selectedBrands]);

    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const resetFilters = () => {
        setSelectedPrice(0);
        setCustomMin('');
        setCustomMax('');
        setSortBy('default');
        setSearchText('');
        setOnlyDiscount(false);
        setOnlyFeatured(false);
        setSelectedBrands([]);
    };

    const activeFilterCount = [
        selectedPrice !== 0,
        customMin || customMax,
        sortBy !== 'default',
        searchText,
        onlyDiscount,
        onlyFeatured,
        selectedBrands.length > 0,
    ].filter(Boolean).length;

    return (
        <>
            <Header />
            <Navbar />

            <div className="container mx-auto my-4">
                {/* Breadcrumb */}
                <nav className="text-sm flex items-center gap-2 text-gray-500 mb-4">
                    <Link to={path.home} className="hover:text-[#2563eb]">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">{category?.name || categoryId}</span>
                </nav>

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-black text-[#2563eb]">
                        {category?.name || 'Sản phẩm'}
                        <span className="ml-2 text-base font-normal text-gray-400">({filteredProducts.length} sản phẩm)</span>
                    </h1>
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:border-[#2563eb] hover:text-[#2563eb] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                        </svg>
                        Bộ lọc
                        {activeFilterCount > 0 && (
                            <span className="bg-[#2563eb] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className="border-b-2 border-[#2563eb] mb-6"></div>

                <div className="flex gap-6">
                    {/* SIDEBAR LỌC */}
                    {showFilter && (
                        <aside className="w-64 flex-shrink-0">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-gray-800">Bộ lọc nâng cao</h2>
                                    {activeFilterCount > 0 && (
                                        <button onClick={resetFilters}
                                            className="text-xs text-red-500 hover:underline font-medium">
                                            Xóa tất cả
                                        </button>
                                    )}
                                </div>

                                {/* Tìm kiếm */}
                                <div className="mb-5">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tìm trong danh mục</p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchText}
                                            onChange={e => setSearchText(e.target.value)}
                                            placeholder="Nhập tên sản phẩm..."
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb] pr-8"
                                        />
                                        {searchText && (
                                            <button onClick={() => setSearchText('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Sắp xếp */}
                                <div className="mb-5">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sắp xếp theo</p>
                                    <div className="space-y-1">
                                        {SORT_OPTIONS.map(opt => (
                                            <button key={opt.value}
                                                onClick={() => setSortBy(opt.value)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    sortBy === opt.value
                                                        ? 'bg-[#2563eb] text-white font-medium'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                }`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Khoảng giá */}
                                <div className="mb-5">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Khoảng giá</p>
                                    <div className="space-y-1">
                                        {PRICE_RANGES.map((range, i) => (
                                            <button key={i}
                                                onClick={() => { setSelectedPrice(i); setCustomMin(''); setCustomMax(''); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    selectedPrice === i && !customMin && !customMax
                                                        ? 'bg-[#2563eb] text-white font-medium'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                }`}>
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tùy chỉnh giá */}
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-400 mb-1">Tùy chỉnh (triệu đồng)</p>
                                        <div className="flex gap-2 items-center">
                                            <input type="number" value={customMin} onChange={e => setCustomMin(e.target.value)}
                                                placeholder="Từ" min="0"
                                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#2563eb]"/>
                                            <span className="text-gray-400 text-xs">—</span>
                                            <input type="number" value={customMax} onChange={e => setCustomMax(e.target.value)}
                                                placeholder="Đến" min="0"
                                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#2563eb]"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Thương hiệu */}
                                {brands.length > 0 && (
                                    <div className="mb-5">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Thương hiệu</p>
                                        <div className="flex flex-wrap gap-2">
                                            {brands.map(brand => (
                                                <button key={brand}
                                                    onClick={() => toggleBrand(brand)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                        selectedBrands.includes(brand)
                                                            ? 'bg-[#2563eb] text-white border-[#2563eb]'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#2563eb] hover:text-[#2563eb]'
                                                    }`}>
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Điều kiện đặc biệt */}
                                <div className="mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Điều kiện</p>
                                    <label className="flex items-center gap-2 cursor-pointer py-1.5 hover:bg-gray-50 rounded-lg px-2">
                                        <input type="checkbox" checked={onlyDiscount} onChange={e => setOnlyDiscount(e.target.checked)}
                                            className="w-4 h-4 accent-[#2563eb]"/>
                                        <span className="text-sm text-gray-700">Đang giảm giá</span>
                                        <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">SALE</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer py-1.5 hover:bg-gray-50 rounded-lg px-2">
                                        <input type="checkbox" checked={onlyFeatured} onChange={e => setOnlyFeatured(e.target.checked)}
                                            className="w-4 h-4 accent-[#2563eb]"/>
                                        <span className="text-sm text-gray-700">Sản phẩm nổi bật</span>
                                        <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">HOT</span>
                                    </label>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* DANH SÁCH SẢN PHẨM */}
                    <div className="flex-1 min-w-0">
                        {/* Active filters pills */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {searchText && (
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-200">
                                        Tìm: "{searchText}"
                                        <button onClick={() => setSearchText('')} className="ml-1 hover:text-red-500">✕</button>
                                    </span>
                                )}
                                {selectedPrice !== 0 && !customMin && !customMax && (
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-200">
                                        {PRICE_RANGES[selectedPrice].label}
                                        <button onClick={() => setSelectedPrice(0)} className="ml-1 hover:text-red-500">✕</button>
                                    </span>
                                )}
                                {(customMin || customMax) && (
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-200">
                                        {customMin ? `${customMin}tr` : '0'} — {customMax ? `${customMax}tr` : '∞'}
                                        <button onClick={() => { setCustomMin(''); setCustomMax(''); }} className="ml-1 hover:text-red-500">✕</button>
                                    </span>
                                )}
                                {selectedBrands.map(b => (
                                    <span key={b} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-200">
                                        {b}
                                        <button onClick={() => toggleBrand(b)} className="ml-1 hover:text-red-500">✕</button>
                                    </span>
                                ))}
                                {onlyDiscount && (
                                    <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full border border-red-200">
                                        Đang giảm giá
                                        <button onClick={() => setOnlyDiscount(false)} className="ml-1 hover:text-red-800">✕</button>
                                    </span>
                                )}
                                {onlyFeatured && (
                                    <span className="flex items-center gap-1 bg-orange-50 text-orange-600 text-xs px-3 py-1.5 rounded-full border border-orange-200">
                                        Nổi bật
                                        <button onClick={() => setOnlyFeatured(false)} className="ml-1 hover:text-orange-800">✕</button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Loading */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse"/>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-gray-500 text-lg font-medium">Không tìm thấy sản phẩm phù hợp</p>
                                <p className="text-gray-400 text-sm mt-1">Thử điều chỉnh bộ lọc hoặc xóa bớt điều kiện</p>
                                <button onClick={resetFilters}
                                    className="mt-4 px-6 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors">
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <div className={`grid gap-5 ${showFilter ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                                {filteredProducts.map((product, i) => (
                                    <CardProduct key={product.id} product={product} index={i}/>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default ProductByCategory;