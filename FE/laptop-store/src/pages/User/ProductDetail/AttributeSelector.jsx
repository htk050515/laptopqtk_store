// AttributeSelector.jsx — Chọn biến thể sản phẩm
import React from 'react';

// Map tên thuộc tính → icon emoji
const ATTR_ICONS = {
  'RAM': '', 'ram': '',
  'Ổ cứng': '', 'o cung': '', 'SSD': '',
  'CPU': '', 'Bộ xử lý': '',
  'Card đồ họa': '', 'GPU': '', 'VGA': '',
  'Màn hình': '', 'Screen': '',
  'Màu sắc': '', 'Color': '',
  'Kết nối': '',
  'Loại RAM': '',
  'Giao tiếp': '',
  'Độ phân giải': '',
  'Tần số quét': '',
};

const getIcon = (attrType) => {
  for (const [key, icon] of Object.entries(ATTR_ICONS)) {
    if (attrType.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '🔧';
};

const AttributeSelector = ({ attributeOptions, selectedAttributes, onAttributeSelect }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.keys(attributeOptions).map(attrType => (
        <div key={attrType}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 15 }}>{getIcon(attrType)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{attrType}</span>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
              — đang chọn: <b style={{ color: '#2563eb' }}>{selectedAttributes[attrType]}</b>
            </span>
          </div>

          {/* Option buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {attributeOptions[attrType].map((value, i) => {
              const isSelected = selectedAttributes[attrType] === value;
              return (
                <button
                  key={i}
                  onClick={() => onAttributeSelect(attrType, value)}
                  style={{
                    padding: '7px 16px',
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 8,
                    border: isSelected ? '2px solid #2563eb' : '1.5px solid #d1d5db',
                    background: isSelected ? '#eff6ff' : '#fff',
                    color: isSelected ? '#1d4ed8' : '#374151',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all .15s',
                    boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,.1)' : 'none',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#93c5fd';
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.background = '#f0f9ff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  {value}
                  {isSelected && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 14, height: 14, borderRadius: '50%',
                      background: '#2563eb', color: '#fff',
                      fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800,
                    }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttributeSelector;