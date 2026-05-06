// src/pages/User/ProductDetail/SpecsPanel.jsx
// Hiển thị thông số kỹ thuật từ biến thể đang chọn
import React, { useState } from 'react';

const SPEC_ICONS = {
  'RAM':           {  color: '#3b82f6', bg: '#eff6ff' },
  'Ổ cứng':       {  color: '#8b5cf6', bg: '#f5f3ff' },
  'SSD':           {  color: '#8b5cf6', bg: '#f5f3ff' },
  'CPU':           {  color: '#f59e0b', bg: '#fffbeb' },
  'Bộ xử lý':     {  color: '#f59e0b', bg: '#fffbeb' },
  'Card đồ họa':  {  color: '#10b981', bg: '#ecfdf5' },
  'GPU':           {  color: '#10b981', bg: '#ecfdf5' },
  'Màn hình':     { color: '#06b6d4', bg: '#ecfeff' },
  'Màu sắc':      { color: '#ec4899', bg: '#fdf2f8' },
  'Loại RAM':     {  color: '#3b82f6', bg: '#eff6ff' },
  'Giao tiếp':    { color: '#6366f1', bg: '#eef2ff' },
  'Độ phân giải': { color: '#0ea5e9', bg: '#f0f9ff' },
  'Tần số quét':  { color: '#14b8a6', bg: '#f0fdfa' },
  'Kết nối':      { color: '#f97316', bg: '#fff7ed' },
};

const getSpec = (attrType) => {
  for (const [key, val] of Object.entries(SPEC_ICONS)) {
    if (attrType.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { icon: '🔧', color: '#6b7280', bg: '#f9fafb' };
};

const SpecsPanel = ({ selectedVariation, product }) => {
  const [expanded, setExpanded] = useState(false);

  if (!selectedVariation?.attributes?.length) return null;

  const specs = selectedVariation.attributes.map(attr => ({
    type:  attr.attribute_value?.attribute_type?.display_name || attr.attribute_value?.attribute_type?.name || '',
    value: attr.attribute_value?.display_value || '',
  })).filter(s => s.type && s.value);

  const visible = expanded ? specs : specs.slice(0, 6);

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', marginTop: 12 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a8a)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}> Thông số kỹ thuật</span>
        <span style={{ color: '#93c5fd', fontSize: 12 }}>Phiên bản đang chọn</span>
      </div>

      {/* Specs grid */}
      <div style={{ padding: '12px 14px', background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {visible.map((s, i) => {
            const style = getSpec(s.type);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: style.bg, border: `1px solid ${style.color}22` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{style.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.type}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: style.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {specs.length > 6 && (
          <button onClick={() => setExpanded(!expanded)}
            style={{ marginTop: 10, width: '100%', padding: '7px', borderRadius: 8, border: '1px dashed #d1d5db', background: 'transparent', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {expanded ? '▲ Thu gọn' : `▼ Xem thêm ${specs.length - 6} thông số`}
          </button>
        )}
      </div>

      {/* SKU & stock footer */}
      <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          SKU: <b style={{ color: '#374151' }}>{selectedVariation.sku || 'N/A'}</b>
        </span>
        <span style={{ fontSize: 11, fontWeight: 600,
          color: selectedVariation.stock_quantity > 0 ? '#059669' : '#dc2626' }}>
          {selectedVariation.stock_quantity > 0
            ? `✓ Còn ${selectedVariation.stock_quantity} sản phẩm`
            : '✗ Hết hàng'}
        </span>
      </div>
    </div>
  );
};

export default SpecsPanel;