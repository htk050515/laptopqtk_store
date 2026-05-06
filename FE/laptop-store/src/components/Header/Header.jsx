import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faShoppingCart, faSignOutAlt, faEdit, faHistory, faPhone, faMapMarkerAlt, faReceipt } from '@fortawesome/free-solid-svg-icons';
import path from '../../constants/path';
import useAuthActions from '../../hooks/useAuthActions';
import { useAuth } from '../../Contexts/AuthContext';
import userApi from '../../api/UserApi/userApi';
import productApi from '../../api/AdminApi/ProductApi/productApi';
import { baseUrl } from '../../constants/config';

const STORAGE = baseUrl ? `${baseUrl}/storage/` : 'http://localhost:8000/storage/';
const FALLBACK = [
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=80&q=60',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&q=60',
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=80&q=60',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=80&q=60',
];
const TICKERS = [
  '🔥 Thu cũ giá ngon — Lên đời tiết kiệm',
  '✅ Sản phẩm chính hãng — Xuất VAT đầy đủ',
  '🚚 Giao nhanh — Miễn phí cho đơn 300k',
  '🎁 Ưu đãi sinh viên — Giảm thêm 5%',
];
const QUICK = ['Laptop gaming', 'MacBook M3', 'Lenovo ThinkPad', 'ASUS ROG', 'Dell XPS'];

const getImg = (p) => !p ? null : p.startsWith('https://') ? p : `${STORAGE}${p.replace(/^\//, '')}`;
const vnd   = (p) => new Intl.NumberFormat('vi-VN').format(Math.round(p)) + 'đ';

export default function Header() {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const navigate   = useNavigate();

  const [cartN,  setCartN]  = useState(0);
  const [drop,   setDrop]   = useState(false);
  const [term,   setTerm]   = useState('');
  const [hits,   setHits]   = useState([]);
  const [show,   setShow]   = useState(false);
  const [empty,  setEmpty]  = useState(false);
  const [tick,   setTick]   = useState(0);

  const sRef = useRef(null);
  const dRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTick(i => (i + 1) % TICKERS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const loadCart = async () => {
    const tok = localStorage.getItem('access_token');
    if (!tok) return;
    try { const r = await userApi.getCart(tok); if (r?.data) setCartN(r.data.length); } catch {}
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    const h = (e) => {
      if (sRef.current && !sRef.current.contains(e.target)) setShow(false);
      if (dRef.current && !dRef.current.contains(e.target)) setDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => { window.removeEventListener('cart-updated', loadCart); document.removeEventListener('mousedown', h); };
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!term.trim()) { setShow(false); return; }
      try {
        const r = await productApi.searchProducts({ name: term });
        if (r.data?.length) { setHits(r.data.slice(0, 6)); setEmpty(false); }
        else { setHits([]); setEmpty(true); }
        setShow(true);
      } catch { setEmpty(true); setShow(true); }
    }, 280);
    return () => clearTimeout(t);
  }, [term]);

  const go = (e) => {
    e?.preventDefault();
    if (!term.trim()) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShow(false); setTerm('');
  };

  /* ─── Tất cả style dùng inline object, KHÔNG dùng class hay <style> tag ─── */

  const S = {
    header: { position:'sticky', top:0, zIndex:999, boxShadow:'0 2px 16px rgba(30,64,175,.35)', fontFamily:"'Inter','Segoe UI',sans-serif" },

    /* ticker */
    ticker: { background:'#b91c1c', padding:'5px 0' },
    tickerInner: { maxWidth:1280, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24 },
    tickerLeft: { display:'flex', gap:28, overflow:'hidden', flex:1 },
    tickerRight: { display:'flex', alignItems:'center', gap:12, flexShrink:0 },
    tickerLink: { fontSize:11, color:'#fff', textDecoration:'none', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' },
    tickerBtn:  { fontSize:11, color:'#fff', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', fontFamily:'inherit' },
    tickerSep:  { color:'rgba(255,255,255,.3)' },

    /* main bar */
    mainBar: { background:'linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%)' },
    mainInner: { maxWidth:1280, margin:'0 auto', padding:'10px 20px' },

    /* 3-col layout: CHỈ dùng inline style, không dùng CSS class */
    row: { display:'flex', flexDirection:'row', alignItems:'center', width:'100%', gap:0 },

    /* logo – cố định 200px */
    logoWrap: { width:200, minWidth:200, flexShrink:0, display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
    logoBox:  { width:40, height:40, background:'#fff', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,.18)' },
    logoQ:    { color:'#1d4ed8', fontWeight:900, fontSize:22, lineHeight:'1', letterSpacing:-1 },
    logoTxt:  { color:'#fff', fontWeight:900, fontSize:20, lineHeight:'1.25', fontFamily:"'Poppins',sans-serif", letterSpacing:-0.5 },
    logoSub:  { color:'#93c5fd', fontSize:10, lineHeight:'1.4', fontWeight:500 },

    /* search – flex:1, chiếm hết khoảng còn lại */
    searchOuter: { flex:'1 1 0', minWidth:0, padding:'0 16px', position:'relative' },

    /* form: dùng position absolute để tránh mọi layout issue */
    searchForm: {
      display:'flex',
      flexDirection:'row',
      alignItems:'stretch',
      height:44,
      background:'#fff',
      borderRadius:12,
      overflow:'hidden',
      boxShadow:'0 2px 10px rgba(0,0,0,.14)',
      width:'100%',
    },
    searchInput: {
      /* Trick: width:0 + flex:1 = input tự stretch fill form */
      flex:'1 1 0px',
      width:0,
      minWidth:0,
      height:'100%',
      padding:'0 16px',
      fontSize:14,
      color:'#1f2937',
      border:'none',
      outline:'none',
      background:'transparent',
      fontFamily:'inherit',
      lineHeight:'44px',
      display:'block',
    },
    searchBtn: {
      width:50,
      minWidth:50,
      height:'100%',
      flexShrink:0,
      background:'#1d4ed8',
      border:'none',
      cursor:'pointer',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
    },

    /* actions – cố định 200px */
    actions: { width:200, minWidth:200, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 },

    /* action button */
    actBtn: { display:'flex', flexDirection:'column', alignItems:'center', gap:2, cursor:'pointer', padding:'3px 8px', background:'none', border:'none', textDecoration:'none', color:'#fff', fontFamily:'inherit' },
    circle: { width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,.18)', border:'1.5px solid rgba(255,255,255,.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' },
    actLbl: { fontSize:10, fontWeight:600, color:'#fff', lineHeight:1.3, whiteSpace:'nowrap', textAlign:'center' },

    /* cart badge */
    badge: { position:'absolute', top:-5, right:-5, minWidth:17, height:17, background:'#dc2626', color:'#fff', fontSize:9, fontWeight:800, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', boxShadow:'0 1px 4px rgba(0,0,0,.3)' },

    /* dropdown */
    drop: { position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'#fff', borderRadius:14, boxShadow:'0 12px 40px rgba(0,0,0,.18)', border:'1px solid #e5e7eb', zIndex:200, overflow:'hidden' },
    dropHit: { display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid #f9fafb' },

    /* user dropdown */
    udrop: { position:'absolute', right:0, top:'calc(100% + 10px)', width:218, background:'#fff', borderRadius:14, boxShadow:'0 12px 40px rgba(0,0,0,.18)', border:'1px solid #e5e7eb', zIndex:300, overflow:'hidden' },
    mlink: { display:'flex', alignItems:'center', gap:10, padding:'11px 16px', fontSize:13, color:'#374151', textDecoration:'none', fontFamily:'inherit', background:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left' },

    /* quick tags */
    quickRow: { display:'flex', alignItems:'center', gap:8, marginTop:10, paddingBottom:2, overflowX:'auto', scrollbarWidth:'none' },
    qtag: { flexShrink:0, fontSize:11, color:'rgba(255,255,255,.9)', background:'rgba(255,255,255,.14)', border:'1px solid rgba(255,255,255,.22)', borderRadius:999, padding:'3px 12px', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' },
  };

  return (
    <header style={S.header}>

      {/* ── TICKER ── */}
      <div style={S.ticker}>
        <div style={S.tickerInner}>
          <div style={S.tickerLeft}>
            {TICKERS.map((t, i) => (
              <span key={i} style={{ fontSize:12, whiteSpace:'nowrap', color:'#fff', opacity:i===tick?1:0.38, fontWeight:i===tick?600:400, transition:'opacity .5s' }}>{t}</span>
            ))}
          </div>
          <div style={S.tickerRight}>
            <button style={S.tickerBtn}><FontAwesomeIcon icon={faMapMarkerAlt} style={{fontSize:10}}/> Cửa hàng</button>
            <span style={S.tickerSep}>|</span>
            <Link to={path.historyOrder} style={S.tickerLink}><FontAwesomeIcon icon={faReceipt} style={{fontSize:10}}/> Tra cứu đơn</Link>
            <span style={S.tickerSep}>|</span>
            <a href="tel:18000515" style={{...S.tickerLink, fontWeight:700}}><FontAwesomeIcon icon={faPhone} style={{fontSize:10}}/> 1800 0515</a>
          </div>
        </div>
      </div>

      {/* ── MAIN BAR ── */}
      <div style={S.mainBar}>
        <div style={S.mainInner}>

          {/* ROW: Logo | Search | Actions */}
          <div style={S.row}>

            {/* LOGO */}
            <Link to={path.home} style={S.logoWrap}>
              <div style={S.logoBox}>
                <span style={S.logoQ}>Q</span>
              </div>
              <div>
                <div style={S.logoTxt}>Laptop<span style={{color:'#fde047'}}>QTK</span></div>
                <div style={S.logoSub}>Chính hãng · Uy tín</div>
              </div>
            </Link>

            {/* SEARCH */}
            <div style={S.searchOuter} ref={sRef}>
              <form
                onSubmit={go}
                style={S.searchForm}
              >
                <input
                  type="text"
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  onFocus={() => term && setShow(true)}
                  placeholder="Bạn muốn mua gì hôm nay?"
                  style={S.searchInput}
                />
                <button
                  type="submit"
                  style={S.searchBtn}
                  onMouseEnter={e => e.currentTarget.style.background='#1e3a8a'}
                  onMouseLeave={e => e.currentTarget.style.background='#1d4ed8'}
                >
                  <FontAwesomeIcon icon={faSearch} style={{color:'#fff', fontSize:15}}/>
                </button>
              </form>

              {/* Dropdown gợi ý */}
              {show && (
                <div style={S.drop}>
                  {empty ? (
                    <div style={{padding:'18px 16px', textAlign:'center', fontSize:13, color:'#9ca3af'}}>
                      Không tìm thấy "<b style={{color:'#374151'}}>{term}</b>"
                    </div>
                  ) : (
                    <>
                      <div style={{padding:'8px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between'}}>
                        <span style={{fontSize:11, color:'#9ca3af', fontWeight:500}}>Gợi ý tìm kiếm</span>
                        <span style={{fontSize:11, color:'#2563eb', fontWeight:600}}>{hits.length} sản phẩm</span>
                      </div>
                      {hits.map((p, i) => {
                        const img   = getImg(p.images?.[0]?.image_path) || FALLBACK[i % FALLBACK.length];
                        const v     = p.variations?.[0];
                        const price = parseFloat(v?.discount_price || v?.price || p.base_price || 0);
                        const old   = v?.discount_price ? parseFloat(v.price) : null;
                        return (
                          <div key={p.id}
                            style={S.dropHit}
                            onClick={() => { navigate(`/products/${p.id}`); setShow(false); setTerm(''); }}
                            onMouseEnter={e => e.currentTarget.style.background='#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}
                          >
                            <img src={img} alt={p.name}
                              style={{width:44, height:44, objectFit:'cover', borderRadius:8, background:'#f3f4f6', flexShrink:0}}
                              onError={e => { e.target.src = FALLBACK[i % FALLBACK.length]; }}/>
                            <div style={{flex:1, minWidth:0}}>
                              <p style={{fontSize:13, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0}}>{p.name}</p>
                              <div style={{display:'flex', alignItems:'center', gap:6, marginTop:2}}>
                                <span style={{fontSize:12, fontWeight:700, color:'#2563eb'}}>{vnd(price)}</span>
                                {old && <span style={{fontSize:11, color:'#9ca3af', textDecoration:'line-through'}}>{vnd(old)}</span>}
                              </div>
                            </div>
                            <svg width="14" height="14" fill="none" stroke="#d1d5db" viewBox="0 0 24 24" style={{flexShrink:0}}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                        );
                      })}
                      <div style={{padding:'10px 16px', background:'#f9fafb', textAlign:'center', borderTop:'1px solid #f3f4f6'}}>
                        <button onClick={go} style={{fontSize:12, color:'#2563eb', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit'}}>
                          Xem tất cả kết quả cho "{term}" →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div style={S.actions}>

              {/* User */}
              <div style={{position:'relative'}} ref={dRef}>
                {user ? (
                  <>
                    <button style={S.actBtn} onClick={() => setDrop(!drop)}>
                      <div style={S.circle}><FontAwesomeIcon icon={faUser} style={{fontSize:13, color:'#fff'}}/></div>
                      <span style={{...S.actLbl, maxWidth:68, overflow:'hidden', textOverflow:'ellipsis'}}>{user.name}</span>
                    </button>
                    {drop && (
                      <div style={S.udrop}>
                        <div style={{padding:'13px 16px', background:'linear-gradient(135deg,#eff6ff,#dbeafe)', borderBottom:'1px solid #e5e7eb'}}>
                          <p style={{fontWeight:700, fontSize:14, color:'#1e40af', margin:0}}>{user.name}</p>
                          <p style={{fontSize:12, color:'#6b7280', margin:'3px 0 0', overflow:'hidden', textOverflow:'ellipsis'}}>{user.email}</p>
                        </div>
                        <Link to={path.profile} onClick={() => setDrop(false)}
                          style={S.mlink}
                          onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <FontAwesomeIcon icon={faEdit} style={{color:'#2563eb', width:14}}/> Sửa thông tin
                        </Link>
                        <Link to={path.historyOrder} onClick={() => setDrop(false)}
                          style={S.mlink}
                          onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <FontAwesomeIcon icon={faHistory} style={{color:'#2563eb', width:14}}/> Lịch sử đặt hàng
                        </Link>
                        <button
                          style={{...S.mlink, color:'#ef4444', borderTop:'1px solid #f3f4f6'}}
                          onClick={() => { logout(); setDrop(false); }}
                          onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <FontAwesomeIcon icon={faSignOutAlt} style={{width:14}}/> Đăng xuất
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={path.login} style={S.actBtn}>
                    <div style={S.circle}><FontAwesomeIcon icon={faUser} style={{fontSize:13, color:'#fff'}}/></div>
                    <span style={S.actLbl}>Đăng nhập</span>
                  </Link>
                )}
              </div>

              {/* Cart */}
              <Link to={path.cart} style={S.actBtn}>
                <div style={S.circle}>
                  <FontAwesomeIcon icon={faShoppingCart} style={{fontSize:13, color:'#fff'}}/>
                  {cartN > 0 && <span style={S.badge}>{cartN > 99 ? '99+' : cartN}</span>}
                </div>
                <span style={S.actLbl}>Giỏ hàng</span>
              </Link>
            </div>
          </div>

          {/* Quick search */}
          <div style={S.quickRow}>
            <span style={{fontSize:11, color:'#93c5fd', flexShrink:0, fontWeight:600}}>Tìm nhanh:</span>
            {QUICK.map((q, i) => (
              <button key={i} style={S.qtag}
                onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.26)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.14)'}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}