import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import categoryApi from "../../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../../api/AdminApi/ProductApi/productApi";
import attributeValueApi from "../../../../api/AdminApi/AttributeValueApi/AttributeValueApi";
import { getAccessTokenFromLS } from "../../../../utils/auth";
import ImageUploadProduct from "../../../../components/ImgUploadProduct/ImgUploadProduct";

function AddProduct({ onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [variations, setVariations] = useState([]);
    const [attributeValues, setAttributeValues] = useState([]);
    const [attributeTypes, setAttributeTypes] = useState([]);
    const access_token = getAccessTokenFromLS();

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [catRes, attrRes] = await Promise.all([
                categoryApi.getListCategories(),
                attributeValueApi.getListAttributeValues()
            ]);
            console.log("📢 Categories Response:", catRes);
            console.log("📢 Attribute Values Response:", attrRes);

            setCategories(catRes.data || []);

            const attrValues = attrRes.data.data || [];
            setAttributeValues(attrValues);

            // Trích xuất các loại thuộc tính duy nhất
            const uniqueTypes = [];
            const typeIds = new Set();

            attrValues.forEach(attr => {
                if (!typeIds.has(attr.attribute_type_id)) {
                    typeIds.add(attr.attribute_type_id);
                    uniqueTypes.push({
                        id: attr.attribute_type_id,
                        name: attr.attribute_type.display_name
                    });
                }
            });

            setAttributeTypes(uniqueTypes);
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể tải dữ liệu", "error");
        }
    };

    const handleImageUpload = (files) => {
        console.log("📢 Uploaded Product Images:", files);
        setImages(files);
    };

    const handleVariationImageUpload = (index, files) => {
        console.log(`📢 Uploaded Images for Variation ${index}:`, files);
        const updatedVariations = [...variations];
        updatedVariations[index].images = files;
        setVariations(updatedVariations);
    };

    const handleAddVariation = () => {
        // Khởi tạo thuộc tính mới với một map attributes để dễ quản lý
        setVariations([
            ...variations,
            {
                sku: "",
                price: "",
                discount_price: "",
                stock_quantity: "",
                images: [],
                attributeMap: {}, // Map để lưu trữ {attribute_type_id: attribute_value_id}
                attributes: [] // Mảng cuối cùng để submit
            }
        ]);
    };

    const handleVariationChange = (index, field, value) => {
        const updatedVariations = [...variations];
        updatedVariations[index][field] = value;
        setVariations(updatedVariations);
    };

    // Hàm này kiểm tra xem có thuộc tính nào có cùng tập hợp thuộc tính không
    const isDuplicateAttributeSet = (variationIndex, newAttributeMap) => {
        return variations.some((variation, idx) => {
            if (idx === variationIndex) return false;

            const currentMap = variation.attributeMap;

            // Kiểm tra các thuộc tính có các thuộc tính giống hệt nhau
            if (Object.keys(currentMap).length !== Object.keys(newAttributeMap).length) {
                return false;
            }

            for (const typeId in currentMap) {
                if (!newAttributeMap[typeId] || currentMap[typeId] !== newAttributeMap[typeId]) {
                    return false;
                }
            }

            return true;
        });
    };

    const handleSelectAttribute = (index, typeId, valueId) => {
        if (!valueId) return;

        const updatedVariations = [...variations];
        const currentVariation = updatedVariations[index];

        // Tạo bản sao của attributeMap để kiểm tra trùng lặp
        const newAttributeMap = { ...currentVariation.attributeMap, [typeId]: parseInt(valueId) };

        // Kiểm tra trùng lặp tập thuộc tính giữa các thuộc tính
        if (isDuplicateAttributeSet(index, newAttributeMap)) {
            Swal.fire("Lỗi!", "Đã tồn tại thuộc tính với cùng tập thuộc tính này!", "warning");
            return;
        }

        // Cập nhật attributeMap
        currentVariation.attributeMap = newAttributeMap;

        // Tái tạo mảng attributes từ attributeMap để API submit
        currentVariation.attributes = Object.entries(newAttributeMap).map(([typeId, valueId]) => ({
            attribute_type_id: parseInt(typeId),
            attribute_value_id: valueId
        }));

        setVariations(updatedVariations);
    };

    const removeAttribute = (variationIndex, typeId) => {
        const updatedVariations = [...variations];
        const currentVariation = updatedVariations[variationIndex];

        // Xóa từ attributeMap
        const { [typeId]: removed, ...newAttributeMap } = currentVariation.attributeMap;
        currentVariation.attributeMap = newAttributeMap;

        // Cập nhật lại mảng attributes
        currentVariation.attributes = Object.entries(newAttributeMap).map(([typeId, valueId]) => ({
            attribute_type_id: parseInt(typeId),
            attribute_value_id: valueId
        }));

        setVariations(updatedVariations);
    };

    // Lấy tên hiển thị của giá trị thuộc tính
    const getAttributeValueName = (valueId) => {
        const value = attributeValues.find(attr => attr.id === valueId);
        return value ? value.display_value : "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("📢 Submitting Product:", { name, description, basePrice, categoryId, images, variations });

        if (!name || !basePrice || !categoryId || variations.length === 0) {
            Swal.fire("Lỗi!", "Vui lòng nhập đầy đủ thông tin.", "error");
            return;
        }

        // Kiểm tra mỗi thuộc tính có đầy đủ thông tin
        const validVariations = variations.filter(v =>
            v.sku && v.price && v.stock_quantity && v.attributes.length > 0
        );

        if (validVariations.length === 0) {
            Swal.fire("Lỗi!", "Ít nhất phải có một thuộc tính hợp lệ với đầy đủ thông tin.", "error");
            return;
        }

        try {
            // Chuẩn bị dữ liệu để gửi đi, loại bỏ attributeMap
            const dataToSubmit = {
                name,
                description,
                base_price: basePrice,
                category_id: categoryId,
                images,
                variations: variations.map(v => ({
                    sku: v.sku,
                    price: v.price,
                    discount_price: v.discount_price,
                    stock_quantity: v.stock_quantity,
                    images: v.images,
                    attributes: v.attributes
                }))
            };

            await productApi.createProduct(access_token, dataToSubmit);
            Swal.fire("Thành công!", "Sản phẩm đã được thêm.", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi thêm sản phẩm:", error);
            Swal.fire("Lỗi!", "Thêm sản phẩm thất bại!", "error");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 ml-60 overflow-y-auto max-h-[75%] mt-15">
                <h2 className="text-xl font-bold text-[#2563eb] mb-4">Thêm Sản Phẩm</h2>
                <form className="text-sm" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <input type="text" placeholder="Tên sản phẩm" className="border p-2 rounded-md w-full mb-2" value={name} onChange={(e) => setName(e.target.value)} required />
                            <textarea placeholder="Mô tả" className="border p-2 rounded-md w-full mb-2" value={description} onChange={(e) => setDescription(e.target.value)} />
                            <input type="number" placeholder="Giá gốc" className="border p-2 rounded-md w-full mb-2" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />

                            <select className="border p-2 rounded-md w-full mb-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                                <option value="">Chọn danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <ImageUploadProduct onImageChange={handleImageUpload} />
                        </div>

                        <div className="overflow-auto max-h-[500px] border p-4 rounded-md bg-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Thuộc tính</h3>
                            {variations.map((variation, index) => (
                                <div key={index} className="border p-3 rounded-md mb-2 bg-white">
                                    <input type="text" placeholder="SKU" className="border p-2 rounded-md w-full mb-2" value={variation.sku} onChange={(e) => handleVariationChange(index, "sku", e.target.value)} />
                                    <input type="number" placeholder="Giá" className="border p-2 rounded-md w-full mb-2" value={variation.price} onChange={(e) => handleVariationChange(index, "price", e.target.value)} />
                                    <input type="number" placeholder="Giảm giá" className="border p-2 rounded-md w-full mb-2" value={variation.discount_price} onChange={(e) => handleVariationChange(index, "discount_price", e.target.value)} />
                                    <input type="number" placeholder="Số lượng" className="border p-2 rounded-md w-full mb-2" value={variation.stock_quantity} onChange={(e) => handleVariationChange(index, "stock_quantity", e.target.value)} />

                                    <ImageUploadProduct onImageChange={(files) => handleVariationImageUpload(index, files)} />

                                    {/* Hiển thị các thuộc tính đã chọn */}
                                    {Object.entries(variation.attributeMap || {}).length > 0 && (
                                        <div className="mb-2 p-2 border rounded bg-gray-50">
                                            <p className="font-medium mb-1">Thuộc tính đã chọn:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(variation.attributeMap).map(([typeId, valueId]) => {
                                                    const typeName = attributeTypes.find(t => t.id === parseInt(typeId))?.name || "";
                                                    return (
                                                        <div key={typeId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                                                            <span>{typeName}: {getAttributeValueName(valueId)}</span>
                                                            <button
                                                                type="button"
                                                                className="ml-1 text-blue-500 hover:text-blue-700"
                                                                onClick={() => removeAttribute(index, typeId)}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* UI để chọn thuộc tính theo từng loại */}
                                    {attributeTypes.map(type => (
                                        <div key={type.id} className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700">{type.name}</label>
                                            <select
                                                className="border p-2 rounded-md w-full"
                                                value={variation.attributeMap?.[type.id] || ""}
                                                onChange={(e) => handleSelectAttribute(index, type.id, e.target.value)}
                                                disabled={variation.attributeMap?.[type.id]}
                                            >
                                                <option value="">Chọn {type.name}</option>
                                                {attributeValues
                                                    .filter(attr => attr.attribute_type_id === type.id)
                                                    .map(attr => (
                                                        <option key={attr.id} value={attr.id}>
                                                            {attr.display_value}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            <button type="button" onClick={handleAddVariation} className="bg-red-600 text-white px-3 py-1 rounded-md">+ Thêm thuộc tính</button>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Hủy</button>
                        <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;