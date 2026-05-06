import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BASE = 'http://localhost:8000/storage/';
const FALLBACKS = [
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=75',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=75',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=75',
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=75',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=75',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=75',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=75',
  'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&q=75',
  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&q=75',
  'https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=400&q=75',
];

const getImg = (p) => {
  if (!p) return null;
  if (p.startsWith('https://')) return p;
  return `${BASE}${p.replace(/^\//, '')}`;
};

const vnd = (p) => new Intl.NumberFormat('vi-VN').format(Math.round(p)) + 'đ';

const CHIP_COLORS = [
  { bg: '#fee2e2', color: '#b91c1c' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#f3f4f6', color: '#374151' },
  { bg: '#d1fae5', color: '#065f46' },
];

export default function CardProduct({ product, index = 0 }) {
  const [variation, setVariation] = useState(null);
  const [liked,     setLiked]     = useState(false);
  const [imgErr,    setImgErr]    = useState(false);
  const [hovered,   setHovered]   = useState(false);

  useEffect(() => {
    if (product?.variations?.length) {
      setVariation(product.variations.find(v => v.is_default) || product.variations[0]);
    }
  }, [product]);

  if (!product?.variations?.length) return null;

  const price     = parseFloat(variation?.price || product.base_price);
  const discPrice = variation?.discount_price ? parseFloat(variation.discount_price) : null;
  const discPct   = discPrice ? Math.round((1 - discPrice / price) * 100) : null;

  const dbImg  = variation?.images?.[0]?.image_path || product?.images?.[0]?.image_path;
  const imgURL = !imgErr && dbImg ? getImg(dbImg) : FALLBACKS[index % FALLBACKS.length];

  /* top 3 attribute chips */
  const chips = (variation?.attributes || [])
    .slice(0, 3)
    .map(a => a.attribute_value?.display_value || a.attribute_value?.value)
    .filter(Boolean);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: `1.5px solid ${hovered ? '#bfdbfe' : '#e5e7eb'}`,
        boxShadow: hovered ? '0 8px 32px rgba(37,99,235,.13)' : '0 1px 4px rgba(0,0,0,.06)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow .25s, border-color .25s, transform .2s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge giảm giá */}
      {discPct && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, boxShadow: '0 1px 4px rgba(220,38,38,.4)' }}>
          Giảm {discPct}%
        </div>
      )}

      {/* Badge trả góp */}
      <div style={{ position: 'absolute', top: 10, right: 34, zIndex: 5, background: '#eff6ff', color: '#1d4ed8', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, border: '1px solid #bfdbfe' }}>
        Trả góp 0%
      </div>

      {/* Nút yêu thích */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 5, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.1)', transition: 'transform .15s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <svg width="14" height="14" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : '#9ca3af'} strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Ảnh */}
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: 200, overflow: 'hidden', background: '#f8fafc' }}>
          <img src={imgURL} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s ease', transform: hovered ? 'scale(1.07)' : 'scale(1)' }}
            onError={() => setImgErr(true)} />
        </div>
        {/* Hover overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(37,99,235,.06)', opacity: hovered ? 1 : 0, transition: 'opacity .25s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ background: '#fff', color: '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,.15)', opacity: hovered ? 1 : 0, transition: 'opacity .2s .05s' }}>
            Xem chi tiết
          </span>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1, gap: 6 }}>
        {/* Chips */}
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {chips.map((chip, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: CHIP_COLORS[i % CHIP_COLORS.length].bg, color: CHIP_COLORS[i % CHIP_COLORS.length].color }}>
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: hovered ? '#1d4ed8' : '#111827', lineHeight: 1.45, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.9em', transition: 'color .2s' }}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>
            {vnd(discPrice || price)}
          </span>
          {discPrice && (
            <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
              {vnd(price)}
            </span>
          )}
        </div>

        {/* Yêu thích btn */}
        <button
          onClick={() => setLiked(!liked)}
          style={{
            marginTop: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px', borderRadius: 10, border: `1px solid ${liked ? '#fca5a5' : '#e5e7eb'}`,
            background: liked ? '#fff5f5' : '#f9fafb', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            color: liked ? '#ef4444' : '#6b7280', transition: 'all .15s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { if (!liked) { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; } }}
          onMouseLeave={e => { if (!liked) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; } }}>
          <svg width="14" height="14" fill={liked ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {liked ? 'Đã yêu thích' : 'Yêu thích'}
        </button>
      </div>
    </div>
  );
}