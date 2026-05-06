import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import Banner from "./Banner/Banner";
import Footer from "../../../components/Footer/Footer";
import BackToTopButton from "../../../components/BackToTopButton/BackToTopButton";
import CardProduct from "../../../components/CardProduct/CardProduct";
import categoryApi from "../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../api/AdminApi/ProductApi/productApi";

/* ── Constants ── */
const BRANDS = [
  { name:'MacBook', key:'apple' }, { name:'ASUS',   key:'asus'   },
  { name:'Lenovo',  key:'lenovo'}, { name:'MSI',    key:'msi'    },
  { name:'Acer',    key:'acer'  }, { name:'HP',     key:'hp'     },
  { name:'Dell',    key:'dell'  }, { name:'LG',     key:'lg'     },
];
const NEEDS = [
  { label:'Văn phòng', icon:'💼', slug:'laptop-van-phong' },
  { label:'Gaming',    icon:'🎮', slug:'laptop-gaming'    },
  { label:'Mỏng nhẹ', icon:'✈️', slug:'laptop-mong-nhe'  },
  { label:'Đồ họa',   icon:'🎨', slug:'laptop-do-hoa'    },
  { label:'Sinh viên', icon:'🎓', slug:'laptop-van-phong' },
  { label:'Cảm ứng',  icon:'👆', slug:'laptop-mong-nhe'  },
  { label:'Laptop AI', icon:'🤖', slug:'laptop-gaming'    },
];
const PRICE_RANGES = [
  { label:'Dưới 10 triệu', min:0,    max:10e6  },
  { label:'10 – 15 triệu', min:10e6, max:15e6  },
  { label:'15 – 20 triệu', min:15e6, max:20e6  },
  { label:'20 – 30 triệu', min:20e6, max:30e6  },
  { label:'30 – 50 triệu', min:30e6, max:50e6  },
  { label:'Trên 50 triệu', min:50e6, max:Infinity },
];
const SERVICES = [
  { icon:'🛡️', label:'Sản phẩm an toàn',     desc:'100% chính hãng' },
  { icon:'🤝', label:'Chất lượng cam kết',    desc:'Bảo hành chính hãng' },
  { icon:'✅', label:'Dịch vụ vượt trội',    desc:'Hỗ trợ 24/7'     },
  { icon:'🚚', label:'Giao hàng miễn phí',   desc:'Cho đơn từ 300k' },
];
const PROMOS = [
  { badge:'-0% APR', title:'Trả góp 0% lãi suất',  desc:'Qua thẻ tín dụng, duyệt nhanh 5 phút',        cta:'Xem chi tiết',  img:'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=70' },
  { badge:'-5%',     title:'Ưu đãi sinh viên',      desc:'Giảm thêm cho email .edu hoặc thẻ SV hợp lệ', cta:'Nhận ưu đãi',   img:'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=70' },
  { badge:'Trade-in',title:'Thu cũ đổi mới',        desc:'Đổi laptop cũ lấy máy mới, định giá nhanh',   cta:'Định giá ngay', img:'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&q=70' },
];
const NEWS = [
  { title:'Top 5 laptop gaming giá tốt nhất 2025',           img:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=120&q=60' },
  { title:'MacBook Air M3 vs Pro M3: Nên mua cái nào?',      img:'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=120&q=60' },
  { title:'Laptop pin trâu nhất cho văn phòng 2025',         img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=120&q=60' },
  { title:'RTX 4060 vs 4070: Chênh lệch bao nhiêu hiệu năng?',img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=120&q=60' },
];
const FAQ = [
  { q:'Làm sao chọn laptop đúng nhu cầu?',  a:'Xác định mục đích: văn phòng chọn RAM 16GB pin 8h+; gaming cần GPU RTX màn 144Hz; đồ họa cần màn chuẩn màu 100% sRGB RAM 32GB+.' },
  { q:'Nên chọn RAM bao nhiêu GB là đủ?',   a:'8GB đủ cơ bản. 16GB lý tưởng cho đa nhiệm. 32GB+ cho đồ họa nặng, lập trình, máy ảo.' },
  { q:'Sinh viên nên mua laptop nào?',      a:'Tầm 10–15 triệu: ASUS VivoBook, Dell Inspiron, HP 240. Ưu tiên pin trâu, nhẹ, màn Full HD.' },
  { q:'LaptopQTK có hỗ trợ trả góp không?', a:'Có! Trả góp 0% lãi suất qua thẻ tín dụng, duyệt nhanh 5 phút. Áp dụng cho sản phẩm trên 5 triệu.' },
];

const vnd = (p) => new Intl.NumberFormat('vi-VN').format(Math.round(p)) + 'đ';

/* ── Sub-components ── */
function SectionTitle({ children, accent = '#2563eb' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
      <div style={{ width:4, height:26, borderRadius:999, background:accent, flexShrink:0 }}/>
      <h2 style={{ fontSize:20, fontWeight:800, color:accent, margin:0 }}>{children}</h2>
    </div>
  );
}

function FeaturedRow({ products, loading }) {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d * 268, behavior: 'smooth' });
  if (!loading && !products.length) return null;
  return (
    <section style={{ marginTop:24, borderRadius:18, overflow:'hidden', background:'linear-gradient(135deg,#dc2626,#ea580c)', boxShadow:'0 4px 24px rgba(220,38,38,.25)' }}>
      <div style={{ padding:'16px 20px 8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ color:'#fff', fontSize:20, fontWeight:900, margin:0, letterSpacing:-.5 }}>
          🔥 Sản phẩm <span style={{ color:'#fde047' }}>Nổi Bật</span>
        </h2>
        <Link to="/search?featured=true" style={{ color:'rgba(255,255,255,.8)', fontSize:12, textDecoration:'none', fontWeight:600 }}>Xem tất cả ›</Link>
      </div>
      <div style={{ padding:'8px 20px 20px', position:'relative' }}>
        <button onClick={() => scroll(-1)} style={{ position:'absolute', left:6, top:'50%', transform:'translateY(-50%)', zIndex:5, width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.2)', fontSize:16, fontWeight:700 }}>‹</button>
        <button onClick={() => scroll(1)}  style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', zIndex:5, width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.2)', fontSize:16, fontWeight:700 }}>›</button>
        {loading ? (
          <div style={{ display:'flex', gap:12 }}>
            {[...Array(5)].map((_,i) => <div key={i} style={{ flexShrink:0, width:248, height:320, borderRadius:14, background:'rgba(255,255,255,.2)' }}/>)}
          </div>
        ) : (
          <div ref={ref} style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
            {products.map((p,i) => (
              <div key={p.id} style={{ flexShrink:0, width:248 }}>
                <CardProduct product={p} index={i}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden', marginBottom:8 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', background:open?'#f0f9ff':'#fff', border:'none', cursor:'pointer', textAlign:'left', gap:12, fontFamily:'inherit' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{q}</span>
        <span style={{ color:'#6b7280', transition:'transform .2s', transform:open?'rotate(180deg)':'none', flexShrink:0 }}>▾</span>
      </button>
      {open && <div style={{ padding:'10px 16px 14px', fontSize:13, color:'#4b5563', background:'#f8fafc', borderTop:'1px solid #e5e7eb', lineHeight:1.65 }}>{a}</div>}
    </div>
  );
}

/* ── Main ── */
export default function Home() {
  const navigate = useNavigate();
  const [categories,    setCategories]    = useState([]);
  const [byCat,         setByCat]         = useState({});
  const [featured,      setFeatured]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [visibleCat,    setVisibleCat]    = useState({});

  useEffect(() => { fetchCats(); fetchFeatured(); }, []);
  useEffect(() => { if (categories.length) fetchByCat(); }, [categories]);

  const fetchCats = async () => {
    try { const r = await categoryApi.getListCategories(); if (r.status===200) setCategories(r.data); } catch {}
  };
  const fetchFeatured = async () => {
    try { const r = await productApi.getListProducts(); if (r.status===200) setFeatured(r.data.filter(p=>p.featured)); } catch {}
  };
  const fetchByCat = async () => {
    setLoading(true);
    const map = {};
    for (const cat of categories) {
      try { const r = await productApi.searchProducts({ category_id: cat.id }); if (r.status===200) map[cat.id] = r.data; } catch {}
    }
    setByCat(map);
    setLoading(false);
  };

  const card  = { background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,.05)' };
  const pill  = (active) => ({ padding:'7px 16px', borderRadius:999, border:`1.5px solid ${active?'#2563eb':'#e5e7eb'}`, background:active?'#eff6ff':'#fff', color:active?'#1d4ed8':'#4b5563', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', fontFamily:'inherit' });

  return (
    <>
      <Header/><Navbar/>
      <div style={{ background:'#f1f5f9', minHeight:'100vh', fontFamily:"'Inter','Segoe UI',sans-serif" }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 16px' }}>

          {/* 1. Banner */}
          <Banner/>

          {/* 2. Services */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, margin:'16px 0' }}>
            {SERVICES.map((s,i) => (
              <div key={i} style={{ ...card, display:'flex', alignItems:'center', gap:12, padding:'14px 16px' }}>
                <span style={{ fontSize:26, lineHeight:1 }}>{s.icon}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:0 }}>{s.label}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:'2px 0 0' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Brand + Need filter */}
          <div style={{ ...card, marginBottom:14 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:12 }}>Máy tính laptop</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {BRANDS.map(b => (
                <button key={b.key} onClick={() => navigate(`/search?q=${b.key}`)} style={pill(false)}>
                  <img src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${b.key}.svg`} alt={b.name}
                    style={{ width:16, height:16, filter:'grayscale(1)', flexShrink:0 }} onError={e=>e.target.style.display='none'}/>
                  {b.name}
                </button>
              ))}
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10 }}>Chọn theo nhu cầu</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {NEEDS.map(n => (
                <button key={n.slug+n.label} onClick={() => navigate(`/category/${n.slug}`)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:12, border:'1.5px solid #e5e7eb', background:'#fff', cursor:'pointer', transition:'all .15s', fontFamily:'inherit' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#2563eb';e.currentTarget.style.background='#eff6ff';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.background='#fff';}}>
                  <span style={{ fontSize:24 }}>{n.icon}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:'#374151' }}>{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Brand hero banners */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            {[
              { q:'lenovo', title:'Laptop Lenovo', sub:'Giá từ 18.49 Triệu', src:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&q=70' },
              { q:'msi',    title:'Laptop MSI Gaming', sub:'Giá từ 13.99 Triệu', src:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&q=70' },
            ].map((b,i) => (
              <div key={i} onClick={() => navigate(`/search?q=${b.q}`)}
                style={{ borderRadius:16, overflow:'hidden', height:150, position:'relative', cursor:'pointer' }}>
                <img src={b.src} alt={b.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }}
                  onMouseEnter={e=>e.target.style.transform='scale(1.06)'}
                  onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,rgba(0,0,0,.6) 0%,transparent 55%)' }}/>
                <div style={{ position:'absolute', bottom:0, left:0, padding:'16px 18px' }}>
                  <p style={{ color:'rgba(255,255,255,.75)', fontSize:11, fontWeight:600, margin:0 }}>{b.q.toUpperCase()}</p>
                  <p style={{ color:'#fff', fontSize:16, fontWeight:800, margin:'2px 0' }}>{b.title}</p>
                  <p style={{ color:'rgba(255,255,255,.8)', fontSize:12, margin:0 }}>{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 5. Featured */}
          <FeaturedRow products={featured} loading={loading}/>

          {/* 6. Price filter pills */}
          <div style={{ ...card, marginTop:16, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>Chọn theo tiêu chí</p>
              <div style={{ display:'flex', gap:8 }}>
                {['Sẵn hàng','Hàng mới về','Khuyến mãi HOT'].map(t => (
                  <button key={t} style={{ ...pill(false), fontSize:12 }}>{t==='Sẵn hàng'?'🚚':t==='Hàng mới về'?'🆕':'🔥'} {t}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              <span style={{ fontSize:12, color:'#6b7280', fontWeight:500, alignSelf:'center' }}>Xem theo giá:</span>
              {PRICE_RANGES.map((r,i) => (
                <button key={i} onClick={() => navigate(`/search?min_price=${r.min}&max_price=${r.max === Infinity ? 999999999 : r.max}`)}
                  style={{ ...pill(false), fontSize:12 }}>{r.label}</button>
              ))}
            </div>
          </div>

          {/* 7. Products by category */}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
              <div style={{ width:36, height:36, border:'3px solid #2563eb', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
            </div>
          ) : categories.map(cat => {
            const prods = byCat[cat.id] || [];
            if (!prods.length) return null;
            const shown = visibleCat[cat.id] ? prods : prods.slice(0, 10);
            return (
              <section key={cat.id} style={{ marginBottom:36 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <SectionTitle>{cat.name}</SectionTitle>
                  <Link to={`/category/${cat.slug}`} style={{ fontSize:13, color:'#2563eb', textDecoration:'none', fontWeight:600 }}>Xem tất cả ›</Link>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
                  {shown.map((p,i) => <CardProduct key={p.id} product={p} index={i}/>)}
                </div>
                {prods.length > 10 && (
                  <div style={{ marginTop:20, display:'flex', justifyContent:'center' }}>
                    <button onClick={() => setVisibleCat(v => ({...v,[cat.id]:!v[cat.id]}))}
                      style={{ padding:'9px 28px', border:'1.5px solid #d1d5db', borderRadius:999, background:'#fff', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', transition:'all .15s', fontFamily:'inherit' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#2563eb';e.currentTarget.style.color='#1d4ed8';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#d1d5db';e.currentTarget.style.color='#374151';}}>
                      {visibleCat[cat.id] ? 'Thu gọn ▲' : `Xem thêm ${prods.length-10} sản phẩm ▾`}
                    </button>
                  </div>
                )}
              </section>
            );
          })}

          {/* 8. Promos */}
          <section style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
              <SectionTitle>Ưu đãi hấp dẫn</SectionTitle>
              <Link to="/promotions" style={{ fontSize:13, color:'#2563eb', textDecoration:'none', fontWeight:600 }}>Xem tất cả ›</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {PROMOS.map((p,i) => (
                <div key={i} style={{ borderRadius:16, overflow:'hidden', height:180, position:'relative', cursor:'pointer' }}>
                  <img src={p.img} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }}
                    onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.65),rgba(0,0,0,.15) 55%, transparent)' }}/>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:10, fontWeight:800, background:'rgba(254,226,226,.9)', color:'#b91c1c', padding:'2px 7px', borderRadius:4 }}>{p.badge}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{p.title}</span>
                    </div>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,.8)', margin:'0 0 4px' }}>{p.desc}</p>
                    <span style={{ fontSize:11, fontWeight:600, color:'#fda4af' }}>{p.cta} →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 9. FAQ + News */}
          <section style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, marginBottom:40 }}>
            <div>
              <SectionTitle>Câu hỏi thường gặp</SectionTitle>
              {FAQ.map((f,i) => <FAQItem key={i} q={f.q} a={f.a}/>)}
            </div>
            <div>
              <SectionTitle>Tin tức sản phẩm</SectionTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {NEWS.map((n,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'center', background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:'10px 12px', cursor:'pointer', transition:'box-shadow .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                    <img src={n.img} alt={n.title} style={{ width:62, height:50, objectFit:'cover', borderRadius:8, flexShrink:0 }}/>
                    <p style={{ fontSize:13, fontWeight:600, color:'#1f2937', lineHeight:1.45, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{n.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
      <Footer/><BackToTopButton/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}