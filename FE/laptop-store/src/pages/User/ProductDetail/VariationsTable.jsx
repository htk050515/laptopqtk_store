
// VariationsTable.jsx
import React from 'react';

const VariationsTable = ({ attributeOptions, variationTableData, formatPrice }) => {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#2563eb] text-white px-4 py-2 font-semibold">
                Bảng giá các phiên bản
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {Object.keys(attributeOptions).map(attrType => (
                                <th key={attrType} className="text-left p-3 text-sm font-semibold text-gray-700">{attrType}</th>
                            ))}
                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Giá bán</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variationTableData.map((item, index) => (
                            <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                                {Object.keys(attributeOptions).map(attrType => (
                                    <td key={attrType} className="p-3 text-sm font-medium text-gray-800">
                                        {item.attributes[attrType] || 'N/A'}
                                    </td>
                                ))}
                                <td className="p-3">
                                    {item.discount_price > 0 ? (
                                        <div className="space-y-1">
                                            <div className="text-sm font-bold text-[#2563eb]">
                                                {formatPrice(item.discount_price)}
                                            </div>
                                            <div className="text-xs text-gray-400 line-through">
                                                {formatPrice(item.price)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-bold text-[#2563eb]">
                                            {formatPrice(item.price)}
                                        </div>
                                    )}
                                </td>
                                <td className="p-3">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        item.stock > 0 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {item.stock > 0 ? `Còn ${item.stock}` : 'Hết hàng'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VariationsTable;
