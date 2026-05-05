import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import CardProduct from "../../../components/CardProduct/CardProduct";
import Footer from "../../../components/Footer/Footer";
import productApi from '../../../api/AdminApi/ProductApi/productApi';
import categoryApi from '../../../api/AdminApi/CategoryApi/categoryApi';
import path from '../../../constants/path';

// ─── Constants ────────────────────────────────────────────────────────────────
const NEEDS = [
    { label: 'Văn phòng', icon: '💼', q: 'van phong' },
    { label: 'Gaming', icon: '🎮', q: 'gaming' },
    { label: 'Mỏng nhẹ', icon: '✈️', q: 'mong nhe' },
    { label: 'Đồ họa', icon: '🎨', q: 'do hoa' },
    { label: 'Sinh viên', icon: '🎓', q: 'sinh vien' },
];

const BRANDS = [
    { name: 'MacBook', key: 'macbook' },
    { name: 'ASUS', key: 'asus' },
    { name: 'Lenovo', key: 'lenovo' },
    { name: 'MSI', key: 'msi' },
    { name: 'Acer', key: 'acer' },
    { name: 'HP', key: 'hp' },
    { name: 'Dell', key: 'dell' },
    { name: 'LG', key: 'lg' },
];

const CPUS = ['Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Apple M2', 'Apple M3'];
const RAMS = ['8GB', '16GB', '32GB', '64GB'];
const SCREENS = ['13"', '14"', '15.6"', '16"', '17"'];
const GPUS = ['RTX 3050', 'RTX 4060', 'RTX 4070', 'RTX 4080', 'Intel Iris Xe', 'AMD Radeon'];

const PRICE_RANGES = [
    { label: 'Dưới 10 triệu', min: 0, max: 10e6 },
    { label: '10 – 15 triệu', min: 10e6, max: 15e6 },
    { label: '15 – 20 triệu', min: 15e6, max: 20e6 },
    { label: '20 – 30 triệu', min: 20e6, max: 30e6 },
    { label: '30 – 50 triệu', min: 30e6, max: 50e6 },
    { label: 'Trên 50 triệu', min: 50e6, max: Infinity },
];

const SORTS = [
    { label: '⭐ Phổ biến', value: 'popular' },
    { label: '🔥 Khuyến mãi', value: 'discount' },
    { label: '↑ Giá thấp – cao', value: 'price_asc' },
    { label: '↓ Giá cao – thấp', value: 'price_desc' },
    { label: '🆕 Hàng mới về', value: 'newest' },
];

const FAQ = [
    { q: 'Làm sao chọn laptop đúng nhu cầu?', a: 'Cần xác định mục đích sử dụng: văn phòng, gaming hay đồ họa. Văn phòng chọn RAM 8-16GB, pin trên 8h. Gaming cần GPU RTX, màn 144Hz. Đồ họa cần màn chuẩn màu, RAM 32GB+.' },
    { q: 'Nên chọn RAM bao nhiêu GB là đủ?', a: 'RAM 8GB đủ cho công việc cơ bản. RAM 16GB lý tưởng cho đa nhiệm và làm việc chuyên nghiệp. RAM 32GB+ cho đồ họa nặng, lập trình, máy ảo.' },
    { q: 'Sinh viên nên mua laptop nào?', a: 'Sinh viên nên chọn tầm 10-15 triệu như ASUS VivoBook, Dell Inspiron, HP 240. Ưu tiên pin trâu, nhẹ, màn Full HD. Tránh laptop gaming nặng và tốn pin.' },
    { q: 'LaptopQTK có hỗ trợ trả góp không?', a: 'Có! LaptopQTK hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng, duyệt nhanh trong 5 phút. Áp dụng cho tất cả sản phẩm trên 5 triệu.' },
];

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(Math.round(p)) + 'đ';

// ─── Dropdown Filter Component ─────────────────────────────────────────────────
function DropFilter({ label, options, selected, onToggle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const count = options.filter(o => selected.includes(o)).length;
    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    count > 0 ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#2563eb] hover:text-[#2563eb]'
                }`}>
                {label}
                {count > 0 && <span className="bg-white text-[#2563eb] text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{count}</span>}
                <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-50 min-w-[180px]">
                    {options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)}
                                className="accent-[#2563eb] w-4 h-4"/>
                            <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-800 text-sm">{q}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">{a}</div>}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function ProductByCategory() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [allProducts, setAllProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(10);

    // Filters
    const [sortBy, setSortBy] = useState('popular');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [selectedCPUs, setSelectedCPUs] = useState([]);
    const [selectedRAMs, setSelectedRAMs] = useState([]);
    const [selectedScreens, setSelectedScreens] = useState([]);
    const [selectedGPUs, setSelectedGPUs] = useState([]);
    const [showFilterBar, setShowFilterBar] = useState(true);

    useEffect(() => { fetchData(); }, [categoryId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                categoryApi.getListCategories(),
                productApi.getProductByCategory(categoryId),
            ]);
            if (catRes.status === 200) setCategory(catRes.data.find(c => c.slug === categoryId || c.id == categoryId));
            if (prodRes.status === 200) { setAllProducts(prodRes.data); setFiltered(prodRes.data); }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        let r = [...allProducts];

        if (selectedBrands.length > 0)
            r = r.filter(p => selectedBrands.some(b => p.name.toLowerCase().includes(b.toLowerCase())));

        if (selectedNeed)
            r = r.filter(p => p.name.toLowerCase().includes(selectedNeed) || p.description?.toLowerCase().includes(selectedNeed));

        if (selectedPrice !== null) {
            const range = PRICE_RANGES[selectedPrice];
            r = r.filter(p => parseFloat(p.base_price) >= range.min && parseFloat(p.base_price) < range.max);
        }

        const filterByAttr = (list, key) => {
            if (!list.length) return r;
            return r.filter(p => p.variations?.some(v =>
                v.attributes?.some(a => list.some(k => (a.attribute_value?.display_value || a.attribute_value?.value || '').includes(k)))
            ));
        };
        if (selectedCPUs.length) r = filterByAttr(selectedCPUs, 'cpu');
        if (selectedRAMs.length) r = filterByAttr(selectedRAMs, 'ram');
        if (selectedScreens.length) r = filterByAttr(selectedScreens, 'screen');
        if (selectedGPUs.length) r = filterByAttr(selectedGPUs, 'gpu');

        if (sortBy === 'price_asc') r.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
        else if (sortBy === 'price_desc') r.sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price));
        else if (sortBy === 'newest') r.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (sortBy === 'discount') r = r.filter(p => p.variations?.some(v => v.discount_price)).concat(r.filter(p => !p.variations?.some(v => v.discount_price)));
        else if (sortBy === 'popular') r.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

        setFiltered(r);
        setVisibleCount(10);
    }, [allProducts, selectedBrands, selectedNeed, selectedPrice, selectedCPUs, selectedRAMs, selectedScreens, selectedGPUs, sortBy]);

    const toggleArr = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

    const resetAll = () => {
        setSelectedBrands([]); setSelectedNeed(null); setSelectedPrice(null);
        setSelectedCPUs([]); setSelectedRAMs([]); setSelectedScreens([]); setSelectedGPUs([]);
        setSortBy('popular');
    };

    const activeCount = selectedBrands.length + (selectedNeed ? 1 : 0) + (selectedPrice !== null ? 1 : 0) +
        selectedCPUs.length + selectedRAMs.length + selectedScreens.length + selectedGPUs.length;

    return (
        <>
            <Header />
            <Navbar />

            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto py-4 px-2">
                    {/* Breadcrumb */}
                    <nav className="text-xs flex items-center gap-1.5 text-gray-400 mb-4">
                        <Link to={path.home} className="hover:text-[#2563eb]">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-700 font-medium">{category?.name || 'Sản phẩm'}</span>
                    </nav>

                    {/* ── Lọc theo nhu cầu ── */}
                    <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <p className="text-sm font-bold text-gray-700 mb-3">Máy tính laptop</p>

                        {/* Brand pills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {BRANDS.map(b => (
                                <button key={b.key}
                                    onClick={() => toggleArr(selectedBrands, setSelectedBrands, b.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                                        selectedBrands.includes(b.key)
                                            ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#2563eb]'
                                    }`}>
                                    <img src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${b.key}.svg`}
                                        className="w-4 h-4" alt={b.name}
                                        style={{ filter: selectedBrands.includes(b.key) ? 'invert(30%) sepia(90%) saturate(1000%) hue-rotate(200deg)' : 'grayscale(1)' }}
                                        onError={e => e.target.style.display = 'none'}/>
                                    {b.name}
                                </button>
                            ))}
                        </div>

                        {/* Chọn theo nhu cầu */}
                        <p className="text-sm font-bold text-gray-700 mb-3">Chọn theo nhu cầu</p>
                        <div className="flex gap-3 flex-wrap">
                            {NEEDS.map(n => (
                                <button key={n.q}
                                    onClick={() => setSelectedNeed(selectedNeed === n.q ? null : n.q)}
                                    className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                                        selectedNeed === n.q
                                            ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-[#2563eb]'
                                    }`}>
                                    <span className="text-2xl">{n.icon}</span>
                                    <span>{n.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Sticky Filter Bar ── */}
                    <div className={`bg-white rounded-2xl shadow-sm mb-4 transition-all`}>
                        <div className="px-4 py-3 flex flex-wrap items-center gap-2">
                            {/* Bộ lọc button */}
                            <button onClick={() => setShowFilterBar(!showFilterBar)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold transition-all ${
                                    activeCount > 0 ? 'border-[#2563eb] text-[#2563eb] bg-blue-50' : 'border-gray-300 text-gray-700'
                                }`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                                </svg>
                                Bộ lọc
                                {activeCount > 0 && <span className="bg-[#2563eb] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
                            </button>

                            <div className="w-px h-6 bg-gray-200"></div>

                            {/* Dropdown filters */}
                            <DropFilter label="Hãng SX" options={BRANDS.map(b => b.key)} selected={selectedBrands} onToggle={v => toggleArr(selectedBrands, setSelectedBrands, v)}/>
                            <DropFilter label="CPU" options={CPUS} selected={selectedCPUs} onToggle={v => toggleArr(selectedCPUs, setSelectedCPUs, v)}/>
                            <DropFilter label="Dung lượng RAM" options={RAMS} selected={selectedRAMs} onToggle={v => toggleArr(selectedRAMs, setSelectedRAMs, v)}/>
                            <DropFilter label="Ổ cứng" options={['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD']} selected={[]} onToggle={() => {}}/>
                            <DropFilter label="Card đồ họa" options={GPUS} selected={selectedGPUs} onToggle={v => toggleArr(selectedGPUs, setSelectedGPUs, v)}/>
                            <DropFilter label="Kích thước màn" options={SCREENS} selected={selectedScreens} onToggle={v => toggleArr(selectedScreens, setSelectedScreens, v)}/>

                            {activeCount > 0 && (
                                <button onClick={resetAll} className="ml-auto text-xs text-red-500 hover:underline font-medium">Xóa tất cả</button>
                            )}
                        </div>

                        {/* Khoảng giá */}
                        <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                            <span className="text-xs text-gray-500 font-medium self-center mr-1">Xem theo giá:</span>
                            {PRICE_RANGES.map((r, i) => (
                                <button key={i}
                                    onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        selectedPrice === i ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#2563eb]'
                                    }`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Sort & Count ── */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                            Sắp xếp theo:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {SORTS.map(s => (
                                <button key={s.value}
                                    onClick={() => setSortBy(s.value)}
                                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                                        sortBy === s.value
                                            ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-[#2563eb]'
                                    }`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active filter pills */}
                    {activeCount > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedBrands.map(b => (
                                <span key={b} className="flex items-center gap-1 bg-blue-50 text-[#2563eb] text-xs px-3 py-1 rounded-full border border-blue-200">
                                    {BRANDS.find(br => br.key === b)?.name || b}
                                    <button onClick={() => toggleArr(selectedBrands, setSelectedBrands, b)}>✕</button>
                                </span>
                            ))}
                            {selectedNeed && (
                                <span className="flex items-center gap-1 bg-blue-50 text-[#2563eb] text-xs px-3 py-1 rounded-full border border-blue-200">
                                    {NEEDS.find(n => n.q === selectedNeed)?.label}
                                    <button onClick={() => setSelectedNeed(null)}>✕</button>
                                </span>
                            )}
                            {selectedPrice !== null && (
                                <span className="flex items-center gap-1 bg-blue-50 text-[#2563eb] text-xs px-3 py-1 rounded-full border border-blue-200">
                                    {PRICE_RANGES[selectedPrice].label}
                                    <button onClick={() => setSelectedPrice(null)}>✕</button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* ── Product Grid ── */}
                    <div className="mb-2 text-sm text-gray-500 font-medium">
                        {category?.name} <span className="text-gray-400">({filtered.length} sản phẩm)</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse"/>)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl">
                            <div className="text-5xl mb-3">🔍</div>
                            <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm phù hợp</p>
                            <button onClick={resetAll} className="mt-4 px-6 py-2 bg-[#2563eb] text-white rounded-xl text-sm">Xóa bộ lọc</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filtered.slice(0, visibleCount).map((p, i) => (
                                    <CardProduct key={p.id} product={p} index={i}/>
                                ))}
                            </div>

                            {visibleCount < filtered.length && (
                                <div className="mt-8 flex justify-center">
                                    <button onClick={() => setVisibleCount(c => c + 10)}
                                        className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 rounded-full text-sm font-medium hover:border-[#2563eb] hover:text-[#2563eb] transition-all">
                                        Xem thêm {Math.min(10, filtered.length - visibleCount)} sản phẩm
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── FAQ ── */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* FAQ bên trái */}
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Câu hỏi thường gặp</h2>
                            <div className="space-y-3">
                                {FAQ.map((item, i) => <FAQItem key={i} q={item.q} a={item.a}/>)}
                            </div>
                        </div>

                        {/* Tin tức bên phải */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Tin tức sản phẩm</h2>
                            <div className="space-y-3">
                                {[
                                    { title: 'Top 5 laptop gaming giá tốt nhất 2025', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=120&q=70' },
                                    { title: 'MacBook Air M3 vs MacBook Pro M3: Nên mua cái nào?', img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=120&q=70' },
                                    { title: 'Laptop nào pin trâu nhất cho dân văn phòng?', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=120&q=70' },
                                    { title: 'RTX 4060 vs RTX 4070: Chênh lệch bao nhiêu % hiệu năng?', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=120&q=70' },
                                ].map((news, i) => (
                                    <div key={i} className="flex gap-3 items-start bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                                        <img src={news.img} alt={news.title} className="w-16 h-14 object-cover rounded-lg flex-shrink-0"/>
                                        <p className="text-sm text-gray-700 font-medium line-clamp-2 hover:text-[#2563eb] transition-colors">{news.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default ProductByCategory;