import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import CardProduct from "../../../components/CardProduct/CardProduct";
import Footer from "../../../components/Footer/Footer";
import productApi from '../../../api/AdminApi/ProductApi/productApi';
import path from '../../../constants/path';

const PRICE_RANGES = [
    { label:'Dưới 10 triệu', min:0,    max:10e6  },
    { label:'10 – 15 triệu', min:10e6, max:15e6  },
    { label:'15 – 20 triệu', min:15e6, max:20e6  },
    { label:'20 – 30 triệu', min:20e6, max:30e6  },
    { label:'30 – 50 triệu', min:30e6, max:50e6  },
    { label:'Trên 50 triệu', min:50e6, max:Infinity },
];

const BRANDS   = ['ASUS','Lenovo','Dell','HP','MSI','Acer','Apple','LG','Samsung'];
const CPUS     = ['Core i5','Core i7','Core i9','Ryzen 5','Ryzen 7','Apple M2','Apple M3'];
const RAMS     = ['8GB','16GB','32GB','64GB'];
const GPUS     = ['RTX 3050','RTX 4060','RTX 4070','RTX 4080','Intel Iris Xe','AMD Radeon'];
const SCREENS  = ['13"','14"','15.6"','16"','17"'];

const SORTS = [
    { label:'⭐ Phổ biến',      value:'popular'   },
    { label:'🔥 Khuyến mãi',   value:'discount'  },
    { label:'↑ Giá thấp – cao', value:'price_asc' },
    { label:'↓ Giá cao – thấp', value:'price_desc'},
    { label:'🆕 Hàng mới',     value:'newest'    },
];

const formatPrice = p => new Intl.NumberFormat('vi-VN').format(Math.round(p)) + 'đ';

/* ─── Dropdown filter component ─── */
function DropFilter({ label, options, selected, onToggle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const count = options.filter(o => selected.includes(o)).length;
    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                    count > 0 ? 'bg-[#2563eb] text-white border-[#2563eb]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#2563eb] hover:text-[#2563eb]'
                }`}>
                {label}
                {count > 0 && (
                    <span className="bg-white text-[#2563eb] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{count}</span>
                )}
                <svg className={`w-3 h-3 transition-transform ${open?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && (
                <div className="absolute top-full mt-1.5 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-50 min-w-[180px]">
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

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const qParam       = searchParams.get('q') || '';
    const minParam     = searchParams.get('min_price');
    const maxParam     = searchParams.get('max_price');
    const featuredParam= searchParams.get('featured') === 'true';

    const [allProducts, setAllProducts]   = useState([]);
    const [filtered,    setFiltered]      = useState([]);
    const [loading,     setLoading]       = useState(true);
    const [visibleCount,setVisibleCount]  = useState(10);

    /* filter states */
    const [searchText,    setSearchText]    = useState(qParam);
    const [sortBy,        setSortBy]        = useState('popular');
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [customMin,     setCustomMin]     = useState(minParam ? Math.round(minParam/1e6) : '');
    const [customMax,     setCustomMax]     = useState(maxParam ? Math.round(maxParam/1e6) : '');
    const [onlyDiscount,  setOnlyDiscount]  = useState(false);
    const [onlyFeatured,  setOnlyFeatured]  = useState(featuredParam);
    const [selBrands,     setSelBrands]     = useState([]);
    const [selCPUs,       setSelCPUs]       = useState([]);
    const [selRAMs,       setSelRAMs]       = useState([]);
    const [selGPUs,       setSelGPUs]       = useState([]);
    const [selScreens,    setSelScreens]    = useState([]);

    /* load all on mount */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await productApi.getListProducts();
                if (r.status === 200) setAllProducts(r.data);
            } catch {}
            finally { setLoading(false); }
        })();
    }, []);

    /* sync search text from URL */
    useEffect(() => { setSearchText(qParam); }, [qParam]);

    /* apply filters */
    useEffect(() => {
        let r = [...allProducts];

        if (searchText.trim())
            r = r.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase())
                            || p.description?.toLowerCase().includes(searchText.toLowerCase()));

        if (selBrands.length)
            r = r.filter(p => selBrands.some(b => p.name.toLowerCase().includes(b.toLowerCase())));

        const minP = customMin ? parseInt(customMin)*1e6
                   : selectedPrice !== null ? PRICE_RANGES[selectedPrice].min
                   : minParam ? parseInt(minParam) : null;
        const maxP = customMax ? parseInt(customMax)*1e6
                   : selectedPrice !== null ? PRICE_RANGES[selectedPrice].max
                   : maxParam ? parseInt(maxParam) : null;
        if (minP != null) r = r.filter(p => parseFloat(p.base_price) >= minP);
        if (maxP != null && maxP !== Infinity) r = r.filter(p => parseFloat(p.base_price) <= maxP);

        const attrFilter = (list) => {
            if (!list.length) return;
            r = r.filter(p => p.variations?.some(v =>
                v.attributes?.some(a =>
                    list.some(k => (a.attribute_value?.display_value||a.attribute_value?.value||'').includes(k))
                )
            ));
        };
        attrFilter(selCPUs);
        attrFilter(selRAMs);
        attrFilter(selGPUs);
        attrFilter(selScreens);

        if (onlyDiscount) r = r.filter(p => p.variations?.some(v => v.discount_price));
        if (onlyFeatured) r = r.filter(p => p.featured);

        if (sortBy === 'price_asc')  r.sort((a,b) => parseFloat(a.base_price)-parseFloat(b.base_price));
        if (sortBy === 'price_desc') r.sort((a,b) => parseFloat(b.base_price)-parseFloat(a.base_price));
        if (sortBy === 'newest')     r.sort((a,b) => new Date(b.created_at)-new Date(a.created_at));
        if (sortBy === 'discount')   r = [...r.filter(p=>p.variations?.some(v=>v.discount_price)), ...r.filter(p=>!p.variations?.some(v=>v.discount_price))];
        if (sortBy === 'popular')    r.sort((a,b) => (b.featured?1:0)-(a.featured?1:0));

        setFiltered(r);
        setVisibleCount(10);
    }, [allProducts, searchText, selBrands, selectedPrice, customMin, customMax,
        selCPUs, selRAMs, selGPUs, selScreens, onlyDiscount, onlyFeatured, sortBy]);

    const toggle = (arr, setArr, val) =>
        setArr(prev => prev.includes(val) ? prev.filter(v=>v!==val) : [...prev,val]);

    const resetAll = () => {
        setSearchText(''); setSortBy('popular'); setSelectedPrice(null);
        setCustomMin(''); setCustomMax(''); setOnlyDiscount(false); setOnlyFeatured(false);
        setSelBrands([]); setSelCPUs([]); setSelRAMs([]); setSelGPUs([]); setSelScreens([]);
        setSearchParams({});
    };

    const activeCount = selBrands.length + selCPUs.length + selRAMs.length + selGPUs.length + selScreens.length
        + (selectedPrice!==null?1:0) + (customMin||customMax?1:0) + (onlyDiscount?1:0) + (onlyFeatured?1:0);

    /* active filter pills */
    const activePills = [
        ...selBrands.map(v=>({ label:v, clear:()=>toggle(selBrands,setSelBrands,v) })),
        ...selCPUs.map(v=>({ label:v,   clear:()=>toggle(selCPUs,setSelCPUs,v) })),
        ...selRAMs.map(v=>({ label:v,   clear:()=>toggle(selRAMs,setSelRAMs,v) })),
        ...selGPUs.map(v=>({ label:v,   clear:()=>toggle(selGPUs,setSelGPUs,v) })),
        ...selScreens.map(v=>({ label:v,clear:()=>toggle(selScreens,setSelScreens,v) })),
        ...(selectedPrice!==null ? [{ label:PRICE_RANGES[selectedPrice].label, clear:()=>setSelectedPrice(null) }] : []),
        ...(customMin||customMax ? [{ label:`${customMin||0}tr – ${customMax||'∞'}tr`, clear:()=>{setCustomMin('');setCustomMax('');} }] : []),
        ...(onlyDiscount  ? [{ label:'Đang giảm giá', clear:()=>setOnlyDiscount(false)  }] : []),
        ...(onlyFeatured  ? [{ label:'Nổi bật',       clear:()=>setOnlyFeatured(false)  }] : []),
    ];

    return (
        <>
            <Header/>
            <Navbar/>
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-2 py-4">

                    {/* Breadcrumb */}
                    <nav className="text-xs flex items-center gap-1.5 text-gray-400 mb-4">
                        <Link to={path.home} className="hover:text-[#2563eb]">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-700 font-medium">Tìm kiếm</span>
                        {searchText && <><span>/</span><span className="text-[#2563eb]">"{searchText}"</span></>}
                    </nav>

                    {/* ── FILTER BAR ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
                        {/* Row 1: filter dropdowns */}
                        <div className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-gray-100">
                            <button onClick={resetAll}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold transition-all flex-shrink-0 ${
                                    activeCount > 0 ? 'border-[#2563eb] text-[#2563eb] bg-blue-50' : 'border-gray-300 text-gray-700'
                                }`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2"/>
                                </svg>
                                Bộ lọc
                                {activeCount > 0 && (
                                    <span className="bg-[#2563eb] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>
                                )}
                            </button>

                            <div className="w-px h-6 bg-gray-200 flex-shrink-0"/>

                            <DropFilter label="Hãng SX"      options={BRANDS}  selected={selBrands}  onToggle={v=>toggle(selBrands,setSelBrands,v)}/>
                            <DropFilter label="CPU"           options={CPUS}    selected={selCPUs}    onToggle={v=>toggle(selCPUs,setSelCPUs,v)}/>
                            <DropFilter label="RAM"           options={RAMS}    selected={selRAMs}    onToggle={v=>toggle(selRAMs,setSelRAMs,v)}/>
                            <DropFilter label="Card đồ họa"   options={GPUS}    selected={selGPUs}    onToggle={v=>toggle(selGPUs,setSelGPUs,v)}/>
                            <DropFilter label="Màn hình"      options={SCREENS} selected={selScreens} onToggle={v=>toggle(selScreens,setSelScreens,v)}/>

                            <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                                    <input type="checkbox" checked={onlyDiscount} onChange={e=>setOnlyDiscount(e.target.checked)} className="accent-[#2563eb]"/>
                                    <span>Giảm giá</span>
                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">SALE</span>
                                </label>
                                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                                    <input type="checkbox" checked={onlyFeatured} onChange={e=>setOnlyFeatured(e.target.checked)} className="accent-[#2563eb]"/>
                                    <span>Nổi bật</span>
                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">HOT</span>
                                </label>
                                {activeCount > 0 && (
                                    <button onClick={resetAll} className="text-xs text-red-500 hover:underline font-medium">Xóa tất cả</button>
                                )}
                            </div>
                        </div>

                        {/* Row 2: price ranges */}
                        <div className="px-4 py-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium flex-shrink-0">Xem theo giá:</span>
                            {PRICE_RANGES.map((r,i) => (
                                <button key={i} onClick={() => { setSelectedPrice(selectedPrice===i?null:i); setCustomMin(''); setCustomMax(''); }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        selectedPrice===i ? 'bg-[#2563eb] text-white border-[#2563eb]'
                                                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#2563eb] hover:text-[#2563eb]'
                                    }`}>
                                    {r.label}
                                </button>
                            ))}
                            <div className="flex items-center gap-1 ml-2">
                                <input type="number" value={customMin} onChange={e=>setCustomMin(e.target.value)}
                                    placeholder="Từ" min="0"
                                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#2563eb]"/>
                                <span className="text-gray-400 text-xs">—</span>
                                <input type="number" value={customMax} onChange={e=>setCustomMax(e.target.value)}
                                    placeholder="Đến" min="0"
                                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#2563eb]"/>
                                <span className="text-xs text-gray-400">triệu</span>
                            </div>
                        </div>
                    </div>

                    {/* ── SORT + COUNT ── */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h1 className="text-base font-bold text-gray-800">
                            {searchText ? `Kết quả tìm kiếm cho "${searchText}"` : 'Tất cả sản phẩm'}
                            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} sản phẩm)</span>
                        </h1>
                        <div className="flex gap-2 flex-wrap">
                            {SORTS.map(s => (
                                <button key={s.value} onClick={() => setSortBy(s.value)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        sortBy===s.value ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#2563eb]'
                                    }`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── ACTIVE PILLS ── */}
                    {activePills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {activePills.map((p,i) => (
                                <span key={i} className="flex items-center gap-1 bg-blue-50 text-[#2563eb] text-xs px-3 py-1 rounded-full border border-blue-200">
                                    {p.label}
                                    <button onClick={p.clear} className="hover:text-red-500 font-bold ml-0.5">✕</button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ── PRODUCTS ── */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[...Array(10)].map((_,i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse"/>)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl">
                            <div className="text-5xl mb-3">🔍</div>
                            <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm phù hợp</p>
                            <p className="text-gray-400 text-sm mt-1">Thử điều chỉnh hoặc xóa bớt bộ lọc</p>
                            <button onClick={resetAll}
                                className="mt-4 px-6 py-2 bg-[#2563eb] text-white rounded-xl text-sm hover:bg-[#1d4ed8] transition-colors">
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filtered.slice(0, visibleCount).map((p,i) => (
                                    <CardProduct key={p.id} product={p} index={i}/>
                                ))}
                            </div>
                            {visibleCount < filtered.length && (
                                <div className="mt-6 flex justify-center">
                                    <button onClick={() => setVisibleCount(c => c+10)}
                                        className="flex items-center gap-2 px-8 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:border-[#2563eb] hover:text-[#2563eb] transition-all bg-white">
                                        Xem thêm {Math.min(10, filtered.length-visibleCount)} sản phẩm ▾
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Footer/>
        </>
    );
}