import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import categoryApi from "../../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../../api/AdminApi/ProductApi/productApi";
import attributeValueApi from "../../../../api/AdminApi/AttributeValueApi/AttributeValueApi";
import { getAccessTokenFromLS } from "../../../../utils/auth";
import ImageUploadProduct from "../../../../components/ImgUploadProduct/ImgUploadProduct";
import { baseUrl } from "../../../../constants/config";

function EditProduct({ onClose, onSuccess, productId }) {
    const [name,            setName]            = useState("");
    const [description,     setDescription]     = useState("");
    const [basePrice,       setBasePrice]       = useState("");
    const [categoryId,      setCategoryId]      = useState("");
    const [categories,      setCategories]      = useState([]);
    const [images,          setImages]          = useState([]);
    const [variations,      setVariations]      = useState([]);
    const [attributeValues, setAttributeValues] = useState([]);
    const [attributeTypes,  setAttributeTypes]  = useState([]);
    const [isLoading,       setIsLoading]       = useState(true);
    const [aiLoading,       setAiLoading]       = useState(false); // ← AI state
    const access_token = getAccessTokenFromLS();
    const BASE_URL = "http://localhost:8000/storage/";

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
        if (imagePath.startsWith('https://')) return imagePath;
        if (imagePath.startsWith('/storage/')) return `${BASE_URL}${imagePath.substring(9)}`;
        if (imagePath.startsWith('/')) return `${BASE_URL}${imagePath.substring(1)}`;
        return `${BASE_URL}${imagePath}`;
    };

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [catRes, attrRes, productRes] = await Promise.all([
                categoryApi.getListCategories(),
                attributeValueApi.getListAttributeValues(),
                productApi.getProductById(productId)
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
            const product = productRes.data;
            if (product) {
                setName(product.name || "");
                setDescription(product.description || "");
                setBasePrice(product.base_price || "");
                setCategoryId(product.category_id?.toString() || "");
                setImages((product.images || []).map(img => ({ image_path: img.image_path })));
                if (product.variations?.length > 0) {
                    setVariations(product.variations.map(v => {
                        const attributeMap = {};
                        (v.attributes || []).forEach(attr => {
                            attributeMap[attr.attribute_value.attribute_type_id] = attr.attribute_value_id;
                        });
                        return {
                            id: v.id,
                            sku: v.sku || "",
                            price: v.price || "",
                            discount_price: v.discount_price || "",
                            stock_quantity: v.stock_quantity || "",
                            images: (v.images || []).map(img => ({ image_path: img.image_path })),
                            attributeMap,
                            attributes: Object.entries(attributeMap).map(([tid, vid]) => ({
                                attribute_type_id: parseInt(tid), attribute_value_id: vid
                            }))
                        };
                    }));
                }
            }
        } catch {
            Swal.fire("Lỗi!", "Không thể tải dữ liệu sản phẩm", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ── AI Generate Description ──────────────────────────────────
    const handleAIGenerate = async () => {
        if (!name.trim()) {
            Swal.fire("Thiếu thông tin!", "Vui lòng nhập tên sản phẩm trước.", "warning");
            return;
        }
        setAiLoading(true);
        try {
            const catName = categories.find(c => String(c.id) === String(categoryId))?.name || "";
            const specs = {};
            if (variations.length > 0) {
                const v = variations[0];
                if (v.price)          specs["Giá"]     = `${parseInt(v.price).toLocaleString('vi-VN')}đ`;
                if (v.discount_price) specs["Giá KM"]  = `${parseInt(v.discount_price).toLocaleString('vi-VN')}đ`;
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
                Swal.fire({ title: "✅ AI đã sinh mô tả!", text: "Bạn có thể chỉnh sửa thêm nếu cần.", icon: "success", timer: 2000, showConfirmButton: false });
            }
        } catch {
            Swal.fire("Lỗi!", "Không thể sinh mô tả AI. Kiểm tra API key.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    // ── Image handlers ───────────────────────────────────────────
    const handleImageUpload = (files) => {
        setImages(prev => [...prev, ...files.map(f => ({ image_path: f }))]);
    };
    const handleRemoveProductImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    const handleVariationImageUpload = (index, files) => {
        const updated = [...variations];
        updated[index].images = [...(updated[index].images || []), ...files.map(f => ({ image_path: f }))];
        setVariations(updated);
    };
    const handleRemoveVariationImage = (variationIndex, imageIndex) => {
        const updated = [...variations];
        updated[variationIndex].images.splice(imageIndex, 1);
        setVariations(updated);
    };

    // ── Variation handlers ───────────────────────────────────────
    const handleAddVariation = () => {
        setVariations([...variations, { sku:"", price:"", discount_price:"", stock_quantity:"", images:[], attributeMap:{}, attributes:[] }]);
    };
    const handleRemoveVariation = (index) => setVariations(variations.filter((_, i) => i !== index));
    const handleVariationChange = (index, field, value) => {
        const updated = [...variations];
        updated[index][field] = value;
        setVariations(updated);
    };
    const isDuplicateAttributeSet = (variationIndex, newAttributeMap) => {
        return variations.some((variation, idx) => {
            if (idx === variationIndex) return false;
            const cm = variation.attributeMap;
            if (Object.keys(cm).length !== Object.keys(newAttributeMap).length) return false;
            for (const tid in cm) { if (!newAttributeMap[tid] || cm[tid] !== newAttributeMap[tid]) return false; }
            return true;
        });
    };
    const handleSelectAttribute = (index, typeId, valueId) => {
        if (!valueId) return;
        const updated = [...variations];
        const cur = updated[index];
        const newMap = { ...cur.attributeMap, [typeId]: parseInt(valueId) };
        if (isDuplicateAttributeSet(index, newMap)) { Swal.fire("Lỗi!", "Đã tồn tại thuộc tính với cùng tập này!", "warning"); return; }
        cur.attributeMap = newMap;
        cur.attributes = Object.entries(newMap).map(([tid, vid]) => ({ attribute_type_id: parseInt(tid), attribute_value_id: vid }));
        setVariations(updated);
    };
    const removeAttribute = (variationIndex, typeId) => {
        const updated = [...variations];
        const cur = updated[variationIndex];
        const { [typeId]: _, ...newMap } = cur.attributeMap;
        cur.attributeMap = newMap;
        cur.attributes = Object.entries(newMap).map(([tid, vid]) => ({ attribute_type_id: parseInt(tid), attribute_value_id: vid }));
        setVariations(updated);
    };
    const getAttributeValueName = (valueId) => {
        const v = attributeValues.find(a => a.id === parseInt(valueId));
        return v ? v.display_value : "";
    };

    // ── Image render ─────────────────────────────────────────────
    const renderImage = (img, index) => {
        if (!img?.image_path) return null;
        const src = typeof img.image_path === 'string'
            ? getImageUrl(img.image_path)
            : URL.createObjectURL(img.image_path);
        return <img key={index} src={src} alt="" className="w-16 h-16 object-cover rounded-md border"
            onError={e => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}/>;
    };

    // ── Submit ───────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !basePrice || !categoryId || variations.length === 0) { Swal.fire("Lỗi!", "Vui lòng nhập đầy đủ thông tin.", "error"); return; }
        const validVariations = variations.filter(v => v.sku && v.price && v.stock_quantity && v.attributes.length > 0);
        if (validVariations.length === 0) { Swal.fire("Lỗi!", "Ít nhất phải có một thuộc tính hợp lệ.", "error"); return; }
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('base_price', basePrice);
            formData.append('category_id', categoryId);
            let ni = 0, ei = 0;
            images.forEach(img => {
                if (img.image_path instanceof File) { formData.append(`images[${ni++}]`, img.image_path); }
                else if (typeof img.image_path === 'string') { formData.append(`existing_images[${ei++}]`, img.image_path); }
            });
            variations.forEach((v, vi) => {
                if (v.id) formData.append(`variations[${vi}][id]`, v.id);
                formData.append(`variations[${vi}][sku]`, v.sku);
                formData.append(`variations[${vi}][price]`, v.price);
                formData.append(`variations[${vi}][discount_price]`, v.discount_price || '');
                formData.append(`variations[${vi}][stock_quantity]`, v.stock_quantity);
                v.attributes.forEach((attr, ai) => {
                    formData.append(`variations[${vi}][attributes][${ai}][attribute_value_id]`, attr.attribute_value_id);
                });
                let nvi = 0, evi = 0;
                (v.images || []).forEach(img => {
                    if (img.image_path instanceof File) { formData.append(`variations[${vi}][images][${nvi++}]`, img.image_path); }
                    else if (typeof img.image_path === 'string') { formData.append(`variations[${vi}][existing_images][${evi++}]`, img.image_path); }
                });
            });
            await productApi.updateProduct(access_token, productId, formData);
            Swal.fire("Thành công!", "Sản phẩm đã được cập nhật.", "success");
            onSuccess();
            onClose();
        } catch {
            Swal.fire("Lỗi!", "Cập nhật sản phẩm thất bại!", "error");
        }
    };

    if (isLoading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2563eb]"/>
                <span>Đang tải dữ liệu...</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 ml-60 overflow-y-auto max-h-[75%] mt-15">
                <h2 className="text-xl font-bold text-[#2563eb] mb-4">Chỉnh Sửa Sản Phẩm</h2>
                <form className="text-sm" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        {/* ── Cột trái ── */}
                        <div>
                            <input type="text" placeholder="Tên sản phẩm"
                                className="border p-2 rounded-md w-full mb-2"
                                value={name} onChange={e => setName(e.target.value)} required />

                            {/* ── Mô tả + AI Generate ── */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold text-gray-600">Mô tả sản phẩm</label>
                                    <button
                                        type="button"
                                        onClick={handleAIGenerate}
                                        disabled={aiLoading}
                                        style={{
                                            display:'flex', alignItems:'center', gap:5,
                                            background: aiLoading ? '#e5e7eb' : 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                            color: aiLoading ? '#9ca3af' : '#fff',
                                            border:'none', borderRadius:8, padding:'5px 12px',
                                            fontSize:12, fontWeight:600,
                                            cursor: aiLoading ? 'not-allowed' : 'pointer',
                                            transition:'opacity .2s',
                                        }}
                                    >
                                        {aiLoading ? (
                                            <>
                                                <svg style={{ animation:'spin 1s linear infinite', width:13, height:13 }}
                                                    fill="none" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="3"/>
                                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/>
                                                </svg>
                                                Đang sinh...
                                            </>
                                        ) : <>✨ AI Generate</>}
                                    </button>
                                </div>
                                <textarea
                                    placeholder="Nhập mô tả hoặc nhấn ✨ AI Generate để tự động sinh..."
                                    className="border p-2 rounded-md w-full"
                                    rows={5}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={{
                                        resize:'vertical', fontSize:13,
                                        borderColor: description && !aiLoading ? '#7c3aed' : undefined,
                                        outline:     description && !aiLoading ? '1px solid #7c3aed' : undefined,
                                    }}
                                />
                                <p className="text-xs text-gray-400 mt-0.5">
                                    💡 AI sẽ dùng tên SP + danh mục + giá + thuộc tính để sinh mô tả
                                </p>
                            </div>

                            <input type="number" placeholder="Giá gốc"
                                className="border p-2 rounded-md w-full mb-2"
                                value={basePrice} onChange={e => setBasePrice(e.target.value)} required />

                            <select className="border p-2 rounded-md w-full mb-2"
                                value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                                <option value="">Chọn danh mục</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>

                            {/* Product images */}
                            <div className="mb-4">
                                <p className="font-medium mb-2">Hình ảnh sản phẩm:</p>
                                {images.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                {renderImage(img, idx)}
                                                <button type="button" onClick={() => handleRemoveProductImage(idx)}
                                                    className="absolute top-0 right-0 bg-blue-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 italic mb-2">Chưa có hình ảnh</p>}
                                <ImageUploadProduct onImageChange={handleImageUpload} />
                            </div>
                        </div>

                        {/* ── Cột phải: variations ── */}
                        <div className="overflow-auto max-h-[500px] border p-4 rounded-md bg-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Thuộc tính</h3>
                            {variations.map((variation, index) => (
                                <div key={index} className="border p-3 rounded-md mb-2 bg-white">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Thuộc tính {index + 1}</span>
                                        <button type="button" onClick={() => handleRemoveVariation(index)}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs">Xóa</button>
                                    </div>
                                    <input type="text" placeholder="SKU" className="border p-2 rounded-md w-full mb-2"
                                        value={variation.sku} onChange={e => handleVariationChange(index, "sku", e.target.value)} />
                                    <input type="number" placeholder="Giá" className="border p-2 rounded-md w-full mb-2"
                                        value={variation.price} onChange={e => handleVariationChange(index, "price", e.target.value)} />
                                    <input type="number" placeholder="Giảm giá" className="border p-2 rounded-md w-full mb-2"
                                        value={variation.discount_price} onChange={e => handleVariationChange(index, "discount_price", e.target.value)} />
                                    <input type="number" placeholder="Số lượng" className="border p-2 rounded-md w-full mb-2"
                                        value={variation.stock_quantity} onChange={e => handleVariationChange(index, "stock_quantity", e.target.value)} />

                                    {/* Variation images */}
                                    <div className="mb-2">
                                        <p className="font-medium mb-1">Hình ảnh thuộc tính:</p>
                                        {variation.images?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {variation.images.map((img, idx) => (
                                                    <div key={idx} className="relative group">
                                                        {renderImage(img, idx)}
                                                        <button type="button" onClick={() => handleRemoveVariationImage(index, idx)}
                                                            className="absolute top-0 right-0 bg-blue-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-gray-500 italic mb-2">Chưa có hình ảnh</p>}
                                        <ImageUploadProduct onImageChange={files => handleVariationImageUpload(index, files)} />
                                    </div>

                                    {/* Selected attributes */}
                                    {Object.keys(variation.attributeMap || {}).length > 0 && (
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

                                    {/* Attribute selectors */}
                                    {attributeTypes.map(type => {
                                        if (variation.attributeMap?.[type.id]) return null;
                                        return (
                                            <div key={type.id} className="mb-2">
                                                <label className="block text-sm font-medium text-gray-700">{type.name}</label>
                                                <select className="border p-2 rounded-md w-full" value=""
                                                    onChange={e => handleSelectAttribute(index, type.id, e.target.value)}>
                                                    <option value="">Chọn {type.name}</option>
                                                    {attributeValues.filter(a => a.attribute_type_id === type.id)
                                                        .map(a => <option key={a.id} value={a.id}>{a.display_value}</option>)}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                            <button type="button" onClick={handleAddVariation}
                                className="bg-red-600 text-white px-3 py-1 rounded-md">+ Thêm thuộc tính</button>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Hủy</button>
                        <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Cập nhật</button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default EditProduct;