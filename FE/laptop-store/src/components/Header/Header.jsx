import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faShoppingCart, faSignOutAlt, faEdit, faHistory, faPhone, faMapMarkerAlt, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import path from '../../constants/path';
import useAuthActions from '../../hooks/useAuthActions';
import { useAuth } from '../../Contexts/AuthContext';
import userApi from '../../api/UserApi/userApi';
import productApi from '../../api/AdminApi/ProductApi/productApi';
import { baseUrl } from '../../constants/config';

const STORAGE_URL = baseUrl ? `${baseUrl}/storage/` : 'http://localhost:8000/storage/';
const FALLBACKS = [
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=80&q=60',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&q=60',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=80&q=60',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=80&q=60',
];
const TICKERS = [
    '🔥 Thu cũ giá ngon — Lên đời tiết kiệm',
    '✅ Sản phẩm Chính hãng — Xuất VAT đầy đủ',
    '🚚 Giao nhanh — Miễn phí cho đơn 300k',
    '🎁 Ưu đãi sinh viên giảm thêm 5%',
];
const QUICK = ['Laptop gaming', 'MacBook M3', 'Lenovo ThinkPad', 'ASUS ROG', 'Dell XPS'];

const getImg = (p) => {
    if (!p) return null;
    if (p.startsWith('https://')) return p;
    return `${STORAGE_URL}${p.startsWith('/') ? p.substring(1) : p}`;
};
const fmt = (p) => new Intl.NumberFormat('vi-VN').format(Math.round(p)) + 'đ';

export default function Header() {
    const { user } = useAuth();
    const { logout } = useAuthActions();
    const navigate = useNavigate();

    const [cartCount,   setCartCount]   = useState(0);
    const [dropOpen,    setDropOpen]    = useState(false);
    const [searchTerm,  setSearchTerm]  = useState('');
    const [results,     setResults]     = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [noResults,   setNoResults]   = useState(false);
    const [tickerIdx,   setTickerIdx]   = useState(0);

    const searchRef = useRef(null);
    const dropRef   = useRef(null);

    useEffect(() => {
        const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 3000);
        return () => clearInterval(t);
    }, []);

    const fetchCart = async () => {
        try {
            const tok = localStorage.getItem('access_token');
            if (!tok) return;
            const r = await userApi.getCart(tok);
            if (r.data) setCartCount(r.data.length);
        } catch {}
    };

    useEffect(() => {
        fetchCart();
        window.addEventListener('cart-updated', fetchCart);
        const h = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
            if (dropRef.current   && !dropRef.current.contains(e.target))   setDropOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => { window.removeEventListener('cart-updated', fetchCart); document.removeEventListener('mousedown', h); };
    }, []);

    useEffect(() => {
        const t = setTimeout(async () => {
            if (!searchTerm.trim()) { setShowResults(false); return; }
            try {
                const r = await productApi.searchProducts({ name: searchTerm });
                if (r.data?.length) { setResults(r.data.slice(0,6)); setNoResults(false); }
                else { setResults([]); setNoResults(true); }
                setShowResults(true);
            } catch { setNoResults(true); setShowResults(true); }
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!searchTerm.trim()) return;
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setShowResults(false);
        setSearchTerm('');
    };

    /* ── Inline styles để tránh Tailwind conflict ── */
    const S = {
        ticker:    { background:'#c62828', padding:'6px 0' },
        mainBar:   { background:'#2563eb' },
        row:       { display:'flex', alignItems:'center', gap:16, padding:'12px 0' },
        logo:      { display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0, width:190 },
        logoBox:   { width:36, height:36, background:'#fff', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
        searchWrap:{ flex:1, position:'relative' },
        searchForm:{ display:'flex', alignItems:'center', background:'#fff', borderRadius:12, overflow:'hidden', height:44, boxShadow:'0 1px 3px rgba(0,0,0,.15)' },
        input:     { flex:1, height:'100%', padding:'0 16px', fontSize:14, color:'#374151', outline:'none', border:'none', background:'transparent', minWidth:0 },
        searchBtn: { height:'100%', width:52, background:'#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', flexShrink:0 },
        actions:   { display:'flex', alignItems:'center', gap:4, flexShrink:0, width:190, justifyContent:'flex-end' },
        actionBtn: { display:'flex', flexDirection:'column', alignItems:'center', gap:2, color:'#fff', textDecoration:'none', padding:'4px 10px', cursor:'pointer', background:'none', border:'none' },
        iconCircle:{ width:32, height:32, background:'rgba(255,255,255,.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,.3)' },
        actionLbl: { fontSize:10, fontWeight:500, color:'#fff', lineHeight:1.2, whiteSpace:'nowrap' },
        quickRow:  { display:'flex', alignItems:'center', gap:8, paddingBottom:10, overflowX:'auto', scrollbarWidth:'none' },
        quickBtn:  { flexShrink:0, fontSize:12, color:'rgba(255,255,255,.9)', background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', borderRadius:999, padding:'3px 12px', cursor:'pointer', whiteSpace:'nowrap' },
        dropdown:  { position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', borderRadius:12, boxShadow:'0 8px 30px rgba(0,0,0,.15)', border:'1px solid #f3f4f6', zIndex:50, overflow:'hidden' },
        dropItem:  { display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid #f9fafb', transition:'background .15s' },
    };

    return (
        <header style={{ position:'sticky', top:0, zIndex:50, boxShadow:'0 2px 8px rgba(0,0,0,.15)' }}>

            {/* Ticker */}
            <div style={S.ticker}>
                <div className="container mx-auto px-4" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:24}}>
                    <div style={{display:'flex', alignItems:'center', gap:24, overflow:'hidden', flex:1}}>
                        {TICKERS.map((t,i) => (
                            <span key={i} style={{
                                fontSize:12, whiteSpace:'nowrap', color:'#fff',
                                opacity: i===tickerIdx ? 1 : 0.4,
                                fontWeight: i===tickerIdx ? 600 : 400,
                                transition:'opacity .5s'
                            }}>{t}</span>
                        ))}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:16, flexShrink:0}}>
                        <button style={{fontSize:11, color:'#fff', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap'}}
                            className="hover:text-yellow-200">
                            <FontAwesomeIcon icon={faMapMarkerAlt}/> Cửa hàng gần bạn
                        </button>
                        <span style={{color:'rgba(255,255,255,.3)'}}>|</span>
                        <Link to={path.historyOrder} style={{fontSize:11, color:'#fff', textDecoration:'none', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap'}}>
                            <FontAwesomeIcon icon={faFileInvoice}/> Tra cứu đơn hàng
                        </Link>
                        <span style={{color:'rgba(255,255,255,.3)'}}>|</span>
                        <a href="tel:18000515" style={{fontSize:11, color:'#fff', textDecoration:'none', fontWeight:700, display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap'}}>
                            <FontAwesomeIcon icon={faPhone}/> 1800 0515
                        </a>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div style={S.mainBar}>
                <div className="container mx-auto px-4">
                    <div style={S.row}>

                        {/* Logo */}
                        <Link to={path.home} style={S.logo}>
                            <div style={S.logoBox}>
                                <span style={{color:'#2563eb', fontWeight:900, fontSize:20, lineHeight:1}}>Q</span>
                            </div>
                            <div>
                                <div style={{color:'#fff', fontWeight:900, fontSize:20, lineHeight:1.2, fontFamily:"'Poppins',sans-serif"}}>
                                    Laptop<span style={{color:'#fde047'}}>QTK</span>
                                </div>
                                <div style={{color:'#bfdbfe', fontSize:10, lineHeight:1.3}}>Chính hãng · Uy tín</div>
                            </div>
                        </Link>

                        {/* Search */}
                        <div style={S.searchWrap} ref={searchRef}>
                            <form onSubmit={handleSubmit} style={S.searchForm}>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onFocus={() => searchTerm && setShowResults(true)}
                                    placeholder="Bạn muốn mua gì hôm nay?"
                                    style={S.input}
                                />
                                <button type="submit" style={S.searchBtn}>
                                    <FontAwesomeIcon icon={faSearch} style={{color:'#fff', fontSize:15}}/>
                                </button>
                            </form>

                            {showResults && (
                                <div style={S.dropdown}>
                                    {noResults ? (
                                        <div style={{padding:'20px 16px', textAlign:'center', fontSize:14, color:'#9ca3af'}}>
                                            Không tìm thấy "<b style={{color:'#374151'}}>{searchTerm}</b>"
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{padding:'8px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between'}}>
                                                <span style={{fontSize:12, color:'#9ca3af'}}>Kết quả tìm kiếm</span>
                                                <span style={{fontSize:12, color:'#2563eb', fontWeight:500}}>{results.length} sản phẩm</span>
                                            </div>
                                            {results.map((p,i) => {
                                                const imgPath = p.images?.[0]?.image_path;
                                                const imgSrc  = imgPath ? getImg(imgPath) : FALLBACKS[i%FALLBACKS.length];
                                                const v       = p.variations?.[0];
                                                const price   = v?.discount_price || v?.price || p.base_price;
                                                return (
                                                    <div key={p.id} style={S.dropItem}
                                                        onClick={() => { navigate(`/products/${p.id}`); setShowResults(false); setSearchTerm(''); }}
                                                        onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                                                        <img src={imgSrc} alt={p.name} style={{width:44,height:44,objectFit:'cover',borderRadius:8,background:'#f3f4f6',flexShrink:0}}
                                                            onError={e=>{e.target.src=FALLBACKS[i%FALLBACKS.length];}}/>
                                                        <div style={{flex:1, minWidth:0}}>
                                                            <p style={{fontSize:13,fontWeight:500,color:'#1f2937',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</p>
                                                            <p style={{fontSize:12,fontWeight:700,color:'#2563eb',marginTop:2}}>{fmt(parseFloat(price))}</p>
                                                        </div>
                                                        <svg width="16" height="16" fill="none" stroke="#d1d5db" viewBox="0 0 24 24" style={{flexShrink:0}}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                                        </svg>
                                                    </div>
                                                );
                                            })}
                                            <div style={{padding:'10px 16px', background:'#f9fafb', textAlign:'center', borderTop:'1px solid #f3f4f6'}}>
                                                <button onClick={handleSubmit} style={{fontSize:12,color:'#2563eb',fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>
                                                    Xem tất cả kết quả cho "{searchTerm}" →
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={S.actions}>
                            {/* User */}
                            <div style={{position:'relative'}} ref={dropRef}>
                                {user ? (
                                    <>
                                        <button onClick={() => setDropOpen(!dropOpen)} style={S.actionBtn}>
                                            <div style={S.iconCircle}><FontAwesomeIcon icon={faUser} style={{fontSize:13,color:'#fff'}}/></div>
                                            <span style={{...S.actionLbl, maxWidth:68, overflow:'hidden', textOverflow:'ellipsis'}}>{user.name}</span>
                                        </button>
                                        {dropOpen && (
                                            <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',width:208,background:'#fff',borderRadius:12,boxShadow:'0 8px 30px rgba(0,0,0,.15)',border:'1px solid #f3f4f6',zIndex:50,overflow:'hidden'}}>
                                                <div style={{padding:'12px 16px',background:'#eff6ff',borderBottom:'1px solid #f3f4f6'}}>
                                                    <p style={{fontWeight:600,fontSize:14,color:'#1f2937',overflow:'hidden',textOverflow:'ellipsis'}}>{user.name}</p>
                                                    <p style={{fontSize:12,color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis'}}>{user.email}</p>
                                                </div>
                                                {[
                                                    {to:path.profile,    icon:faEdit,      label:'Sửa thông tin'},
                                                    {to:path.historyOrder,icon:faHistory,  label:'Lịch sử đặt hàng'},
                                                ].map(item => (
                                                    <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                                                        style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',fontSize:14,color:'#374151',textDecoration:'none'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                                                        <FontAwesomeIcon icon={item.icon} style={{color:'#2563eb',width:16}}/> {item.label}
                                                    </Link>
                                                ))}
                                                <div style={{borderTop:'1px solid #f3f4f6'}}>
                                                    <button onClick={() => { logout(); setDropOpen(false); }}
                                                        style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:10,padding:'10px 16px',fontSize:14,color:'#ef4444',background:'none',border:'none',cursor:'pointer'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='none'}>
                                                        <FontAwesomeIcon icon={faSignOutAlt} style={{width:16}}/> Đăng xuất
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link to={path.login} style={S.actionBtn}>
                                        <div style={S.iconCircle}><FontAwesomeIcon icon={faUser} style={{fontSize:13,color:'#fff'}}/></div>
                                        <span style={S.actionLbl}>Đăng nhập</span>
                                    </Link>
                                )}
                            </div>

                            {/* Cart */}
                            <Link to={path.cart} style={{...S.actionBtn, position:'relative', textDecoration:'none'}}>
                                <div style={{...S.iconCircle, position:'relative'}}>
                                    <FontAwesomeIcon icon={faShoppingCart} style={{fontSize:13,color:'#fff'}}/>
                                    {cartCount > 0 && (
                                        <span style={{position:'absolute',top:-6,right:-6,background:'#c62828',color:'#fff',fontSize:9,fontWeight:900,borderRadius:999,minWidth:16,height:16,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px',boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}>
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </div>
                                <span style={S.actionLbl}>Giỏ hàng</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quick tags */}
                    <div style={S.quickRow}>
                        <span style={{fontSize:12,color:'#bfdbfe',flexShrink:0,fontWeight:500}}>Tìm nhanh:</span>
                        {QUICK.map((q,i) => (
                            <button key={i} style={S.quickBtn}
                                onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}