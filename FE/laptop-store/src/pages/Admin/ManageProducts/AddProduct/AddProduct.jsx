import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import categoryApi from "../../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../../api/AdminApi/ProductApi/productApi";
import attributeValueApi from "../../../../api/AdminApi/AttributeValueApi/AttributeValueApi";
import { getAccessTokenFromLS } from "../../../../utils/auth";
import ImageUploadProduct from "../../../../components/ImgUploadProduct/ImgUploadProduct";
import { baseUrl } from "../../../../constants/config";

function AddProduct({ onClose, onSuccess }) {
    const [name,           setName]           = useState("");
    const [description,    setDescription]    = useState("");
    const [basePrice,      setBasePrice]      = useState("");
    const [categoryId,     setCategoryId]     = useState("");
    const [categories,     setCategories]     = useState([]);
    const [images,         setImages]         = useState([]);
    const [variations,     setVariations]     = useState([]);
    const [attributeValues,setAttributeValues]= useState([]);
    const [attributeTypes, setAttributeTypes] = useState([]);
    const [aiLoading,      setAiLoading]      = useState(false);  // ← trạng thái AI
    const access_token = getAccessTokenFromLS();

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            const [catRes, attrRes] = await Promise.all([
                categoryApi.getListCategories(),
                attributeValueApi.getListAttributeValues()
            ]);
            setCategories(catRes.data || []);
            const attrValues = attrRes.data.data || [];
            setAttributeValues(attrValues);
            const uniqueTypes = [];
            const typeIds = new Set();
            attrValues.forEach(attr => {
                if (!typeIds.has(attr.attribute_type_id)) {
                    typeIds.add(attr.attribute_type_id);
                    uniqueTypes.push({ id: attr.attribute_type_id, name: attr.attribute_type.display_name });
                }
            });
            setAttributeTypes(uniqueTypes);
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể tải dữ liệu", "error");
        }
    };

    // ── AI Generate Description ─────────────────────────────────
    const handleAIGenerate = async () => {
        if (!name.trim()) {
            Swal.fire("Thiếu thông tin!", "Vui lòng nhập tên sản phẩm trước.", "warning");
            return;
        }

        setAiLoading(true);
        try {
            const catName = categories.find(c => String(c.id) === String(categoryId))?.name || "";

            // Thu thập thông số từ các variation đã thêm
            const specs = {};
            if (variations.length > 0) {
                const v = variations[0];
                if (v.price)          specs["Giá"]        = `${parseInt(v.price).toLocaleString('vi-VN')}đ`;
                if (v.discount_price) specs["Giá KM"]     = `${parseInt(v.discount_price).toLocaleString('vi-VN')}đ`;
                if (v.stock_quantity) specs["Tồn kho"]    = v.stock_quantity;
                // Thêm thuộc tính vào specs
                Object.entries(v.attributeMap || {}).forEach(([typeId, valueId]) => {
                    const typeName  = attributeTypes.find(t => t.id === parseInt(typeId))?.name || "";
                    const valueName = attributeValues.find(a => a.id === valueId)?.display_value || "";
                    if (typeName && valueName) specs[typeName] = valueName;
                });
            }

            const res = await axios.post(
                `${baseUrl}/api/admin/product/ai-description`,
                { name, specs, category: catName, price: basePrice },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );

            const desc = res.data?.description || "";
            if (desc) {
                setDescription(desc);
                Swal.fire({
                    title: "✅ AI đã sinh mô tả!",
                    text: "Bạn có thể chỉnh sửa thêm nếu cần.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (err) {
            Swal.fire("Lỗi!", "Không thể sinh mô tả AI. Kiểm tra API key.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    // ── Image handlers ──────────────────────────────────────────
    const handleImageUpload = (files) => setImages(files);
    const handleVariationImageUpload = (index, files) => {
        const updated = [...variations];
        updated[index].images = files;
        setVariations(updated);
    };

    // ── Variation handlers ──────────────────────────────────────
    const handleAddVariation = () => {
        setVariations([...variations, {
            sku: "", price: "", discount_price: "", stock_quantity: "",
            images: [], attributeMap: {}, attributes: []
        }]);
    };

    const handleVariationChange = (index, field, value) => {
        const updated = [...variations];
        updated[index][field] = value;
        setVariations(updated);
    };

    const isDuplicateAttributeSet = (variationIndex, newAttributeMap) => {
        return variations.some((variation, idx) => {
            if (idx === variationIndex) return false;
            const currentMap = variation.attributeMap;
            if (Object.keys(currentMap).length !== Object.keys(newAttributeMap).length) return false;
            for (const typeId in currentMap) {
                if (!newAttributeMap[typeId] || currentMap[typeId] !== newAttributeMap[typeId]) return false;
            }
            return true;
        });
    };

    const handleSelectAttribute = (index, typeId, valueId) => {
        if (!valueId) return;
        const updated = [...variations];
        const cur = updated[index];
        const newMap = { ...cur.attributeMap, [typeId]: parseInt(valueId) };
        if (isDuplicateAttributeSet(index, newMap)) {
            Swal.fire("Lỗi!", "Đã tồn tại thuộc tính với cùng tập thuộc tính này!", "warning");
            return;
        }
        cur.attributeMap = newMap;
        cur.attributes = Object.entries(newMap).map(([tid, vid]) => ({
            attribute_type_id: parseInt(tid), attribute_value_id: vid
        }));
        setVariations(updated);
    };

    const removeAttribute = (variationIndex, typeId) => {
        const updated = [...variations];
        const cur = updated[variationIndex];
        const { [typeId]: _, ...newMap } = cur.attributeMap;
        cur.attributeMap = newMap;
        cur.attributes = Object.entries(newMap).map(([tid, vid]) => ({
            attribute_type_id: parseInt(tid), attribute_value_id: vid
        }));
        setVariations(updated);
    };

    const getAttributeValueName = (valueId) => {
        const v = attributeValues.find(a => a.id === valueId);
        return v ? v.display_value : "";
    };

    // ── Submit ──────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !basePrice || !categoryId || variations.length === 0) {
            Swal.fire("Lỗi!", "Vui lòng nhập đầy đủ thông tin.", "error");
            return;
        }
        const validVariations = variations.filter(v =>
            v.sku && v.price && v.stock_quantity && v.attributes.length > 0
        );
        if (validVariations.length === 0) {
            Swal.fire("Lỗi!", "Ít nhất phải có một thuộc tính hợp lệ với đầy đủ thông tin.", "error");
            return;
        }
        try {
            await productApi.createProduct(access_token, {
                name, description, base_price: basePrice, category_id: categoryId, images,
                variations: variations.map(v => ({
                    sku: v.sku, price: v.price, discount_price: v.discount_price,
                    stock_quantity: v.stock_quantity, images: v.images, attributes: v.attributes
                }))
            });
            Swal.fire("Thành công!", "Sản phẩm đã được thêm.", "success");
            onSuccess();
            onClose();
        } catch {
            Swal.fire("Lỗi!", "Thêm sản phẩm thất bại!", "error");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 ml-60 overflow-y-auto max-h-[75%] mt-15">
                <h2 className="text-xl font-bold text-[#2563eb] mb-4">Thêm Sản Phẩm</h2>
                <form className="text-sm" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        {/* ── Cột trái ── */}
                        <div>
                            <input
                                type="text" placeholder="Tên sản phẩm"
                                className="border p-2 rounded-md w-full mb-2"
                                value={name} onChange={e => setName(e.target.value)} required
                            />

                            {/* Mô tả + nút AI */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold text-gray-600">Mô tả sản phẩm</label>
                                    <button
                                        type="button"
                                        onClick={handleAIGenerate}
                                        disabled={aiLoading}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            background: aiLoading ? '#e5e7eb' : 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                            color: aiLoading ? '#9ca3af' : '#fff',
                                            border: 'none', borderRadius: 8, padding: '5px 12px',
                                            fontSize: 12, fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer',
                                            transition: 'opacity .2s',
                                        }}
                                    >
                                        {aiLoading ? (
                                            <>
                                                <svg style={{ animation: 'spin 1s linear infinite', width: 13, height: 13 }}
                                                    fill="none" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="3"/>
                                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/>
                                                </svg>
                                                Đang sinh...
                                            </>
                                        ) : (
                                            <>✨ AI Generate</>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    placeholder="Nhập mô tả hoặc nhấn ✨ AI Generate để tự động sinh..."
                                    className="border p-2 rounded-md w-full"
                                    rows={5}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={{ resize: 'vertical', fontSize: 13,
                                        borderColor: description && !aiLoading ? '#7c3aed' : undefined,
                                        outline: description && !aiLoading ? '1px solid #7c3aed' : undefined,
                                    }}
                                />
                                <p className="text-xs text-gray-400 mt-0.5">
                                    💡 Điền tên SP + danh mục + giá trước khi nhấn AI Generate để kết quả tốt hơn
                                </p>
                            </div>

                            <input
                                type="number" placeholder="Giá gốc"
                                className="border p-2 rounded-md w-full mb-2"
                                value={basePrice} onChange={e => setBasePrice(e.target.value)} required
                            />
                            <select
                                className="border p-2 rounded-md w-full mb-2"
                                value={categoryId} onChange={e => setCategoryId(e.target.value)} required
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ImageUploadProduct onImageChange={handleImageUpload} />
                        </div>

                        {/* ── Cột phải: variations ── */}
                        <div className="overflow-auto max-h-[500px] border p-4 rounded-md bg-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Thuộc tính</h3>
                            {variations.map((variation, index) => (
                                <div key={index} className="border p-3 rounded-md mb-2 bg-white">
                                    <input type="text" placeholder="SKU"
                                        className="border p-2 rounded-md w-full mb-2"
                                        value={variation.sku}
                                        onChange={e => handleVariationChange(index, "sku", e.target.value)} />
                                    <input type="number" placeholder="Giá"
                                        className="border p-2 rounded-md w-full mb-2"
                                        value={variation.price}
                                        onChange={e => handleVariationChange(index, "price", e.target.value)} />
                                    <input type="number" placeholder="Giảm giá"
                                        className="border p-2 rounded-md w-full mb-2"
                                        value={variation.discount_price}
                                        onChange={e => handleVariationChange(index, "discount_price", e.target.value)} />
                                    <input type="number" placeholder="Số lượng"
                                        className="border p-2 rounded-md w-full mb-2"
                                        value={variation.stock_quantity}
                                        onChange={e => handleVariationChange(index, "stock_quantity", e.target.value)} />

                                    <ImageUploadProduct onImageChange={files => handleVariationImageUpload(index, files)} />

                                    {Object.entries(variation.attributeMap || {}).length > 0 && (
                                        <div className="mb-2 p-2 border rounded bg-gray-50">
                                            <p className="font-medium mb-1">Thuộc tính đã chọn:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(variation.attributeMap).map(([typeId, valueId]) => {
                                                    const typeName = attributeTypes.find(t => t.id === parseInt(typeId))?.name || "";
                                                    return (
                                                        <div key={typeId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                                                            <span>{typeName}: {getAttributeValueName(valueId)}</span>
                                                            <button type="button" className="ml-1 text-blue-500 hover:text-blue-700"
                                                                onClick={() => removeAttribute(index, typeId)}>×</button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {attributeTypes.map(type => (
                                        <div key={type.id} className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700">{type.name}</label>
                                            <select
                                                className="border p-2 rounded-md w-full"
                                                value={variation.attributeMap?.[type.id] || ""}
                                                onChange={e => handleSelectAttribute(index, type.id, e.target.value)}
                                                disabled={variation.attributeMap?.[type.id]}
                                            >
                                                <option value="">Chọn {type.name}</option>
                                                {attributeValues
                                                    .filter(attr => attr.attribute_type_id === type.id)
                                                    .map(attr => (
                                                        <option key={attr.id} value={attr.id}>{attr.display_value}</option>
                                                    ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <button type="button" onClick={handleAddVariation}
                                className="bg-red-600 text-white px-3 py-1 rounded-md">
                                + Thêm thuộc tính
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Hủy</button>
                        <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Lưu</button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default AddProduct;