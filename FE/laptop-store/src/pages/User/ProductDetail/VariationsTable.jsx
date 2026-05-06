// VariationsTable.jsx — Bảng giá phiên bản đẹp hơn
import React, { useState } from 'react';

const VariationsTable = ({ attributeOptions, variationTableData, formatPrice }) => {
  const [hovered, setHovered] = useState(null);
  const attrKeys = Object.keys(attributeOptions);

  const discountPct = (price, disc) =>
    disc > 0 && disc < price ? Math.round((1 - disc / price) * 100) : 0;

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}> Bảng giá các phiên bản</span>
        <span style={{ color: '#bfdbfe', fontSize: 12 }}>{variationTableData.length} phiên bản</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {attrKeys.map(k => (
                <th key={k} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 12, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                  {k}
                </th>
              ))}
              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#374151', fontSize: 12, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>Giá bán</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#374151', fontSize: 12, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            {variationTableData.map((item, i) => {
              const pct  = discountPct(item.price, item.discount_price);
              const isHovered = hovered === i;
              return (
                <tr key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ background: isHovered ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6', transition: 'background .12s', cursor: 'default' }}>

                  {/* Attribute cells */}
                  {attrKeys.map(k => (
                    <td key={k} style={{ padding: '10px 14px', color: '#1f2937', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>
                        {item.attributes[k] || 'N/A'}
                      </span>
                    </td>
                  ))}

                  {/* Price cell */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {item.discount_price > 0 && item.discount_price < item.price ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>
                            {formatPrice(item.discount_price)}
                          </span>
                          {pct > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 800, background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: 4 }}>
                              -{pct}%
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through', textAlign: 'right', marginTop: 1 }}>
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1d4ed8' }}>
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </td>

                  {/* Stock cell */}
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    {item.stock > 0 ? (
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: 999, display: 'inline-block' }}>
                          ✓ Còn hàng
                        </span>
                        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{item.stock} sản phẩm</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 999, display: 'inline-block' }}>
                        ✗ Hết hàng
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #f3f4f6', fontSize: 11, color: '#9ca3af' }}>
        💡 Giá đã bao gồm VAT • Miễn phí giao hàng toàn quốc
      </div>
    </div>
  );
};

export default VariationsTable;