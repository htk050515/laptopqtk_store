import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import BackToTopButton from "../../../components/BackToTopButton/BackToTopButton";
import CardProduct from "../../../components/CardProduct/CardProduct";
import categoryApi from "../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../api/AdminApi/ProductApi/productApi";
import banner1 from "../../../assets/Home/banner1.png";
import banner2 from "../../../assets/Home/banner2.png";
import banner3 from "../../../assets/Home/banner3.png";

const BRANDS = [
  { name:"MacBook", key:"apple",  logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/apple.svg" },
  { name:"ASUS",    key:"asus",   logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/asus.svg" },
  { name:"Lenovo",  key:"lenovo", logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/lenovo.svg" },
  { name:"MSI",     key:"msi",    logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/msi.svg" },
  { name:"Acer",    key:"acer",   logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/acer.svg" },
  { name:"HP",      key:"hp",     logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/hp.svg" },
  { name:"Dell",    key:"dell",   logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dell.svg" },
  { name:"LG",      key:"lg",     logo:"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/lg.svg" },
];

const NEEDS = [
  { label:"Văn phòng", icon:"💼", q:"van-phong" },
  { label:"Gaming",    icon:"🎮", q:"gaming"    },
  { label:"Mỏng nhẹ", icon:"✈️", q:"mong-nhe"  },
  { label:"Đồ họa",   icon:"🎨", q:"do-hoa"    },
  { label:"Sinh viên", icon:"🎓", q:"sinh-vien" },
  { label:"Cảm ứng",  icon:"👆", q:"cam-ung"   },
  { label:"Laptop AI", icon:"🤖", q:"laptop-ai" },
];

const PRICE_RANGES = [
  { label:"Dưới 10 triệu",  min:0,    max:10e6  },
  { label:"10 – 15 triệu",  min:10e6, max:15e6  },
  { label:"15 – 20 triệu",  min:15e6, max:20e6  },
  { label:"20 – 30 triệu",  min:20e6, max:30e6  },
  { label:"30 – 50 triệu",  min:30e6, max:50e6  },
  { label:"Trên 50 triệu",  min:50e6, max:Infinity },
];

const PROMOS = [
  { badge:"-0% APR", title:"Trả góp 0% lãi suất", desc:"Qua thẻ tín dụng, duyệt nhanh 5 phút", cta:"Xem chi tiết", img:"https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=70" },
  { badge:"-5%",     title:"Ưu đãi sinh viên -5%", desc:"Giảm thêm cho email .edu hoặc thẻ SV hợp lệ", cta:"Nhận ưu đãi", img:"https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=70" },
  { badge:"Trade-in",title:"Thu cũ đổi mới",      desc:"Đổi laptop cũ lấy máy mới, định giá nhanh", cta:"Định giá ngay", img:"https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&q=70" },
];

const SERVICES = [
  { icon:"🛡️", label:"Sản phẩm an toàn" },
  { icon:"🤝", label:"Chất lượng cam kết" },
  { icon:"✅", label:"Dịch vụ vượt trội" },
  { icon:"🚚", label:"Giao hàng miễn phí" },
];

const FAQ = [
  { q:"Làm sao chọn laptop đúng nhu cầu?", a:"Xác định mục đích: văn phòng chọn RAM 16GB pin trên 8h; gaming cần GPU RTX và màn 144Hz; đồ họa cần màn chuẩn màu 100% sRGB RAM 32GB+." },
  { q:"Nên chọn RAM bao nhiêu GB là đủ?",   a:"8GB đủ cho cơ bản. 16GB lý tưởng cho đa nhiệm chuyên nghiệp. 32GB+ cho đồ họa nặng, lập trình, máy ảo." },
  { q:"Sinh viên nên mua laptop nào?",       a:"Tầm 10-15 triệu như ASUS VivoBook, Dell Inspiron, HP 240. Ưu tiên pin trâu, nhẹ, màn Full HD. Tránh gaming nặng tốn pin." },
  { q:"LaptopQTK có hỗ trợ trả góp không?", a:"Có! Trả góp 0% lãi suất qua thẻ tín dụng, duyệt nhanh 5 phút. Áp dụng cho sản phẩm trên 5 triệu." },
];

const NEWS = [
  { title:"Top 5 laptop gaming giá tốt nhất 2025", img:"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=120&q=60" },
  { title:"MacBook Air M3 vs Pro M3: Nên mua cái nào?", img:"https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=120&q=60" },
  { title:"Laptop pin trâu nhất cho văn phòng 2025", img:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=120&q=60" },
  { title:"RTX 4060 vs 4070: Chênh lệch bao nhiêu hiệu năng?", img:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=120&q=60" },
];

const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(Math.round(p)) + "đ";

// ── Banner Slider ──────────────────────────────────────────────────────────────
function BannerSlider() {
  const slides = [banner1, banner2, banner3];
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur(c => (c+1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative w-full overflow-hidden" style={{height:420}}>
      {slides.map((src, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i===cur?"opacity-100":"opacity-0"}`}>
          <img src={src} alt={`Banner ${i+1}`} className="w-full h-full object-cover"/>
        </div>
      ))}
      <button onClick={() => setCur(c => (c-1+slides.length)%slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all">
        ‹
      </button>
      <button onClick={() => setCur(c => (c+1)%slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all">
        ›
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_,i) => (
          <button key={i} onClick={() => setCur(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i===cur?"bg-white":"bg-white/50"}`}/>
        ))}
      </div>
    </div>
  );
}

// ── Section Title ──────────────────────────────────────────────────────────────
function SectionTitle({ children, color="#2563eb" }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-7 rounded-full" style={{background:color}}/>
      <h2 className="text-xl font-bold" style={{color}}>{children}</h2>
    </div>
  );
}

// ── Featured Scroll Row ────────────────────────────────────────────────────────
function FeaturedRow({ products, isLoading }) {
  const ref = useRef(null);
  if (!isLoading && products.length === 0) return null;
  const scroll = (d) => ref.current?.scrollBy({ left: d*270, behavior:"smooth" });
  return (
    <section className="mt-6 relative bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-white text-xl font-black uppercase tracking-wide flex items-center gap-2">
          🔥 Sản phẩm <span className="text-yellow-300">Nổi Bật</span>
        </h2>
        <Link to="/search?featured=true" className="text-white/80 text-sm hover:text-white flex items-center gap-1">
          Xem tất cả <span>›</span>
        </Link>
      </div>
      <div className="px-6 pb-6 relative">
        <button onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition text-gray-600 text-lg">‹</button>
        <button onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition text-gray-600 text-lg">›</button>
        {isLoading ? (
          <div className="flex gap-4">
            {[...Array(5)].map((_,i) => <div key={i} className="flex-shrink-0 w-56 h-72 bg-white/20 rounded-xl animate-pulse"/>)}
          </div>
        ) : (
          <div ref={ref} className="flex gap-4 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>
            {products.map((p,i) => (
              <div key={p.id} className="flex-shrink-0 w-56">
                <CardProduct product={p} index={i}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── FAQ Item ───────────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-sm font-medium text-gray-800">
        {q}
        <span className={`text-gray-400 transition-transform duration-200 ${open?"rotate-180":""}`}>▾</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-gray-500 bg-gray-50 border-t border-gray-100 leading-relaxed">{a}</div>}
    </div>
  );
}

// ── Main Home ──────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [visibleCat, setVisibleCat] = useState({});

  useEffect(() => { fetchCategories(); fetchFeatured(); }, []);
  useEffect(() => { if (categories.length) fetchAllByCategory(); }, [categories]);

  const fetchCategories = async () => {
    try {
      const r = await categoryApi.getListCategories();
      if (r.status===200 && Array.isArray(r.data)) setCategories(r.data);
    } catch {}
  };

  const fetchFeatured = async () => {
    try {
      const r = await productApi.getListProducts();
      if (r.status===200) setFeaturedProducts(r.data.filter(p=>p.featured));
    } catch {}
  };

  const fetchAllByCategory = async () => {
    setIsLoading(true);
    const map = {};
    for (const cat of categories) {
      try {
        const r = await productApi.searchProducts({ category_id: cat.id });
        if (r.status===200 && Array.isArray(r.data)) map[cat.id] = r.data;
      } catch {}
    }
    setProductsByCategory(map);
    setIsLoading(false);
  };

  const handleBrandFilter = (key) => {
    setSelectedBrand(key===selectedBrand?null:key);
    navigate(`/search?q=${encodeURIComponent(key)}`);
  };

  const handlePriceFilter = (i) => {
    const r = PRICE_RANGES[i];
    navigate(`/search?min_price=${r.min}&max_price=${r.max}`);
  };

  return (
    <>
      <Header/>
      <Navbar/>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-2">

          {/* ── 1. BANNER ── */}
          <BannerSlider/>

          {/* ── 2. DỊCH VỤ ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
            {SERVICES.map((s,i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── 3. LỌC THƯƠNG HIỆU + NHU CẦU ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <p className="text-sm font-bold text-gray-700 mb-3">Máy tính laptop</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {BRANDS.map(b => (
                <button key={b.key} onClick={() => handleBrandFilter(b.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    selectedBrand===b.key ? "border-[#2563eb] bg-blue-50 text-[#2563eb]" : "border-gray-200 bg-white text-gray-700 hover:border-[#2563eb] hover:text-[#2563eb]"
                  }`}>
                  <img src={b.logo} alt={b.name} className="w-4 h-4 object-contain"
                    style={{filter: selectedBrand===b.key ? "invert(30%) sepia(90%) saturate(1000%) hue-rotate(200deg)" : "grayscale(1)"}}
                    onError={e=>e.target.style.display="none"}/>
                  {b.name}
                </button>
              ))}
            </div>

            <p className="text-sm font-bold text-gray-700 mb-3">Chọn theo nhu cầu</p>
            <div className="flex flex-wrap gap-3">
              {NEEDS.map(n => (
                <button key={n.q} onClick={() => navigate(`/category/${n.q}`)}
                  className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl border border-gray-200 bg-white hover:border-[#2563eb] hover:bg-blue-50 transition-all">
                  <span className="text-2xl">{n.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. BANNER THƯƠNG HIỆU NỔI BẬT ── */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="rounded-2xl overflow-hidden relative h-36 cursor-pointer group" onClick={() => navigate("/search?q=lenovo")}>
              <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=70" alt="Lenovo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-5">
                <div className="text-white">
                  <div className="text-xs font-bold opacity-80">Lenovo</div>
                  <div className="text-lg font-black">Laptop Lenovo</div>
                  <div className="text-sm opacity-80">Giá từ 18.49 Triệu</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden relative h-36 cursor-pointer group" onClick={() => navigate("/search?q=msi")}>
              <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=70" alt="MSI" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center px-5">
                <div className="text-white">
                  <div className="text-xs font-bold opacity-80">MSI</div>
                  <div className="text-lg font-black">Laptop MSI Gaming</div>
                  <div className="text-sm opacity-80">Giá từ 13.99 Triệu</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 5. SẢN PHẨM NỔI BẬT ── */}
          <FeaturedRow products={featuredProducts} isLoading={isLoading}/>

          {/* ── 6. LỌC THEO TIÊU CHÍ (filter pills) ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 my-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">Chọn theo tiêu chí</p>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors">
                <span>⚙️</span> Bộ lọc
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {["Sẵn hàng","Hàng mới về","Khuyến mãi HOT"].map(t => (
                <button key={t} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-[#2563eb] hover:text-[#2563eb] bg-white transition-colors">
                  {t==="Sẵn hàng"?"🚚":t==="Hàng mới về"?"🆕":"🔥"} {t}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 font-medium mb-2">Xem theo giá</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((r,i) => (
                  <button key={i} onClick={() => handlePriceFilter(i)}
                    className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      selectedPrice===i ? "bg-[#2563eb] text-white border-[#2563eb]" : "border-gray-200 text-gray-600 hover:border-[#2563eb] hover:text-[#2563eb] bg-white"
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 7. DANH SÁCH SẢN PHẨM THEO DANH MỤC ── */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : categories.map(cat => {
            const prods = productsByCategory[cat.id] || [];
            if (!prods.length) return null;
            const shown = visibleCat[cat.id] ? prods : prods.slice(0,10);
            return (
              <section key={cat.id} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>{cat.name}</SectionTitle>
                  <Link to={`/category/${cat.slug}`} className="text-sm text-[#2563eb] font-medium hover:underline flex items-center gap-1">
                    Xem tất cả <span>›</span>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {shown.map((p,i) => <CardProduct key={p.id} product={p} index={i}/>)}
                </div>
                {prods.length > 10 && (
                  <div className="mt-5 flex justify-center">
                    <button onClick={() => setVisibleCat(v=>({...v,[cat.id]:!v[cat.id]}))}
                      className="flex items-center gap-2 px-8 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:border-[#2563eb] hover:text-[#2563eb] transition-all bg-white">
                      {visibleCat[cat.id] ? "Thu gọn ▲" : `Xem thêm ${prods.length-10} sản phẩm ▾`}
                    </button>
                  </div>
                )}
              </section>
            );
          })}

          {/* ── 8. ƯU ĐÃI HẤP DẪN ── */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Ưu đãi hấp dẫn</SectionTitle>
              <Link to="/promotions" className="text-sm text-[#2563eb] hover:underline">Xem tất cả ›</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {PROMOS.map((p,i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden h-44 cursor-pointer group">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"/>
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-red-100/90 text-red-700 px-2 py-0.5 rounded">{p.badge}</span>
                      <span className="text-sm font-bold text-white">{p.title}</span>
                    </div>
                    <p className="text-xs text-gray-200 hidden sm:block">{p.desc}</p>
                    <span className="text-xs text-red-300 font-medium">{p.cta} →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 9. FAQ + TIN TỨC ── */}
          <section className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <SectionTitle>Câu hỏi thường gặp</SectionTitle>
                <div className="space-y-3">
                  {FAQ.map((item,i) => <FAQItem key={i} q={item.q} a={item.a}/>)}
                </div>
              </div>
              <div>
                <SectionTitle>Tin tức sản phẩm</SectionTitle>
                <div className="space-y-3">
                  {NEWS.map((n,i) => (
                    <div key={i} className="flex gap-3 items-start bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:shadow-md transition-shadow group">
                      <img src={n.img} alt={n.title} className="w-16 h-14 object-cover rounded-lg flex-shrink-0"/>
                      <p className="text-sm text-gray-700 font-medium line-clamp-2 group-hover:text-[#2563eb] transition-colors">{n.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
      <Footer/>
      <BackToTopButton/>
    </>
  );
}