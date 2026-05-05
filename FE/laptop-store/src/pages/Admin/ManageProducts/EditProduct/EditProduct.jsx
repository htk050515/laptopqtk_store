import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import categoryApi from "../../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../../api/AdminApi/ProductApi/productApi";
import attributeValueApi from "../../../../api/AdminApi/AttributeValueApi/AttributeValueApi";
import { getAccessTokenFromLS } from "../../../../utils/auth";
import ImageUploadProduct from "../../../../components/ImgUploadProduct/ImgUploadProduct";

function EditProduct({ onClose, onSuccess, productId }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [variations, setVariations] = useState([]);
    const [attributeValues, setAttributeValues] = useState([]);
    const [attributeTypes, setAttributeTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const access_token = getAccessTokenFromLS();
    const BASE_URL = "http://localhost:8000/storage/";

    // Helper function to get image URL - supports both CDN and local storage
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
        
        // If image path is already a full HTTPS URL (CDN), return as is
        if (imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // If image path starts with /storage/, remove it and use BASE_URL
        if (imagePath.startsWith('/storage/')) {
            return `${BASE_URL}${imagePath.substring(9)}`;
        }
        
        // If image path starts with /, it's a relative path from storage
        if (imagePath.startsWith('/')) {
            return `${BASE_URL}${imagePath.substring(1)}`;
        }
        
        // Otherwise, prepend BASE_URL
        return `${BASE_URL}${imagePath}`;
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);

            // Fetch categories, attribute values, and product details in parallel
            const [catRes, attrRes, productRes] = await Promise.all([
                categoryApi.getListCategories(),
                attributeValueApi.getListAttributeValues(),
                productApi.getProductById(productId)
            ]);


            // Set categories
            setCategories(catRes.data || []);

            // Process attribute values
            const attrValues = attrRes.data.data || [];
            setAttributeValues(attrValues);

            // Extract unique attribute types
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

            // Set product details
            const product = productRes.data;
            if (product) {
                setName(product.name || "");
                setDescription(product.description || "");
                setBasePrice(product.base_price || "");
                setCategoryId(product.category_id?.toString() || "");

                // Handle product images
                const productImages = product.images ? product.images.map(img => ({
                    image_path: img.image_path
                })) : [];
                setImages(productImages);

                // Process variations with correct attribute structure
                if (product.variations && product.variations.length > 0) {
                    const processedVariations = product.variations.map(v => {
                        // Process variation images
                        const variationImages = v.images ? v.images.map(img => ({
                            image_path: img.image_path
                        })) : [];

                        // Create attributeMap for each variation
                        const attributeMap = {};
                        if (v.attributes && v.attributes.length > 0) {
                            v.attributes.forEach(attr => {
                                // Use the correct property paths based on your API response
                                attributeMap[attr.attribute_value.attribute_type_id] = attr.attribute_value_id;
                            });
                        }

                        // Format attributes for submission
                        const formattedAttributes = Object.entries(attributeMap).map(([typeId, valueId]) => ({
                            attribute_type_id: parseInt(typeId),
                            attribute_value_id: valueId
                        }));

                        return {
                            id: v.id,
                            sku: v.sku || "",
                            price: v.price || "",
                            discount_price: v.discount_price || "",
                            stock_quantity: v.stock_quantity || "",
                            images: variationImages,
                            attributeMap,
                            attributes: formattedAttributes
                        };
                    });

                    setVariations(processedVariations);
                }
            }
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể tải dữ liệu sản phẩm", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (files) => {
        // Thêm ảnh mới vào danh sách hiện có thay vì thay thế
        const newImages = files.map(file => ({
            image_path: file
        }));
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
    };

    const handleRemoveProductImage = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
    };

    const handleVariationImageUpload = (index, files) => {
        const updatedVariations = [...variations];
        // Thêm ảnh mới vào danh sách hiện có thay vì thay thế
        const newImages = files.map(file => ({
            image_path: file
        }));
        updatedVariations[index].images = [...(updatedVariations[index].images || []), ...newImages];
        setVariations(updatedVariations);
    };

    const handleRemoveVariationImage = (variationIndex, imageIndex) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].images.splice(imageIndex, 1);
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

    const handleRemoveVariation = (index) => {
        const updatedVariations = [...variations];
        updatedVariations.splice(index, 1);
        setVariations(updatedVariations);
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

    // Updated function to get attribute value display name
    const getAttributeValueName = (valueId) => {
        // Convert valueId to number for comparison (if it's a string)
        const numericValueId = parseInt(valueId);
        const value = attributeValues.find(attr => attr.id === numericValueId);
        return value ? value.display_value : "";
    };

    // Cache object URLs cho File objects để tránh tạo lại mỗi lần render
    const [productImageUrls, setProductImageUrls] = useState(new Map());
    const [variationImageUrls, setVariationImageUrls] = useState(new Map());

    // Update product image URLs khi images thay đổi
    useEffect(() => {
        const newUrls = new Map();
        images.forEach((img, idx) => {
            if (img.image_path instanceof File) {
                newUrls.set(idx, URL.createObjectURL(img.image_path));
            }
        });
        
        // Revoke old URLs trước khi set mới
        setProductImageUrls(prevUrls => {
            prevUrls.forEach(url => URL.revokeObjectURL(url));
            return newUrls;
        });
        
        return () => {
            newUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    // Update variation image URLs khi variations thay đổi
    useEffect(() => {
        const newUrls = new Map();
        variations.forEach((variation, vIdx) => {
            if (variation.images) {
                variation.images.forEach((img, idx) => {
                    if (img.image_path instanceof File) {
                        newUrls.set(`${vIdx}-${idx}`, URL.createObjectURL(img.image_path));
                    }
                });
            }
        });
        
        // Revoke old URLs trước khi set mới
        setVariationImageUrls(prevUrls => {
            prevUrls.forEach(url => URL.revokeObjectURL(url));
            return newUrls;
        });
        
        return () => {
            newUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [variations]);

    // Hàm xử lý việc hiển thị hình ảnh an toàn
    const renderImage = (img, index, variationIndex = null) => {
        if (!img || !img.image_path) return null;

        // Nếu là string (URL), sử dụng getImageUrl để xử lý CDN/local storage
        if (typeof img.image_path === 'string') {
            return (
                <img 
                    key={`img-${index}-${img.image_path}`}
                    src={getImageUrl(img.image_path)} 
                    alt="Product image" 
                    className="w-16 h-16 object-cover rounded-md border"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                    }}
                />
            );
        }

        // Nếu là File object
        if (img.image_path instanceof File) {
            const urlKey = variationIndex !== null ? `${variationIndex}-${index}` : index;
            const objectUrl = variationIndex !== null 
                ? variationImageUrls.get(urlKey) 
                : productImageUrls.get(index);
            
            if (!objectUrl) {
                // Fallback nếu chưa có URL
                return <div className="w-16 h-16 bg-gray-200 rounded-md border flex items-center justify-center">Loading...</div>;
            }

            return (
                <img 
                    key={`img-${index}-${img.image_path.name}-${img.image_path.lastModified}`}
                    src={objectUrl} 
                    alt="Product image" 
                    className="w-16 h-16 object-cover rounded-md border"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                    }}
                />
            );
        }

        // Fallback nếu không phải cả hai
        return <div key={`img-fallback-${index}`} className="w-16 h-16 bg-gray-200 rounded-md border flex items-center justify-center">?</div>;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            // Create FormData object to handle file uploads
            const formData = new FormData();

            // Append basic product info
            formData.append('name', name);
            formData.append('description', description);
            formData.append('base_price', basePrice);
            formData.append('category_id', categoryId);

            // Handle product images
            // Check if images are File objects or existing images
            let newImageIndex = 0;
            let existingImageIndex = 0;
            images.forEach((img) => {
                if (img.image_path instanceof File) {
                    // If it's a new file, append it to formData
                    formData.append(`images[${newImageIndex}]`, img.image_path);
                    newImageIndex++;
                } else if (typeof img.image_path === 'string') {
                    // If it's an existing image path, send the path
                    formData.append(`existing_images[${existingImageIndex}]`, img.image_path);
                    existingImageIndex++;
                }
            });

            // Handle variations with their images
            variations.forEach((variation, variationIndex) => {
                // Append variation basic info
                if (variation.id) {
                    formData.append(`variations[${variationIndex}][id]`, variation.id);
                }
                formData.append(`variations[${variationIndex}][sku]`, variation.sku);
                formData.append(`variations[${variationIndex}][price]`, variation.price);
                formData.append(`variations[${variationIndex}][discount_price]`, variation.discount_price || '');
                formData.append(`variations[${variationIndex}][stock_quantity]`, variation.stock_quantity);

                // Append variation attributes
                variation.attributes.forEach((attr, attrIndex) => {
                    formData.append(
                        `variations[${variationIndex}][attributes][${attrIndex}][attribute_value_id]`,
                        attr.attribute_value_id
                    );
                });

                // Handle variation images
                let newVarImageIndex = 0;
                let existingVarImageIndex = 0;
                variation.images.forEach((img) => {
                    if (img.image_path instanceof File) {
                        // If it's a new file, append it to formData
                        formData.append(`variations[${variationIndex}][images][${newVarImageIndex}]`, img.image_path);
                        newVarImageIndex++;
                    } else if (typeof img.image_path === 'string') {
                        // If it's an existing image path, send the path
                        formData.append(`variations[${variationIndex}][existing_images][${existingVarImageIndex}]`, img.image_path);
                        existingVarImageIndex++;
                    }
                });
            });

            // Use FormData with the API call
            const response = await productApi.updateProduct(access_token, productId, formData);
            
            // Sử dụng response từ backend để cập nhật state với dữ liệu mới nhất
            if (response.data && response.data.product) {
                const updatedProduct = response.data.product;
                
                // Cập nhật product images từ response
                if (updatedProduct.images) {
                    const productImages = updatedProduct.images.map(img => ({
                        image_path: img.image_path
                    }));
                    setImages(productImages);
                } else {
                    // Nếu response không có images, fetch lại
                    await fetchInitialData();
                }
                
                // Cập nhật variations với images mới
                if (updatedProduct.variations && updatedProduct.variations.length > 0) {
                    const updatedVariations = variations.map((variation, idx) => {
                        const updatedVariation = updatedProduct.variations.find(v => v.id === variation.id);
                        if (updatedVariation && updatedVariation.images) {
                            return {
                                ...variation,
                                images: updatedVariation.images.map(img => ({
                                    image_path: img.image_path
                                }))
                            };
                        }
                        return variation;
                    });
                    setVariations(updatedVariations);
                }
            } else {
                // Nếu response không có product, fetch lại
                await fetchInitialData();
            }
            
            Swal.fire("Thành công!", "Sản phẩm đã được cập nhật.", "success");
            
            // Luôn fetch lại dữ liệu để đảm bảo có ảnh mới nhất từ server
            await fetchInitialData();
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi cập nhật sản phẩm:", error);
            Swal.fire("Lỗi!", "Cập nhật sản phẩm thất bại!", "error");
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2563eb]"></div>
                        <span className="ml-3">Đang tải dữ liệu...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 ml-60 overflow-y-auto max-h-[75%] mt-15">
                <h2 className="text-xl font-bold text-[#2563eb] mb-4">Chỉnh Sửa Sản Phẩm</h2>
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

                            <div className="mb-4">
                                <p className="font-medium mb-2">Hình ảnh sản phẩm:</p>
                                {images && images.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {images.map((img, idx) => (
                                            <div key={`product-img-${idx}-${img.image_path instanceof File ? img.image_path.name : img.image_path}`} className="relative group">
                                                {renderImage(img, idx, null)}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProductImage(idx)}
                                                    className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-opacity hover:bg-red-600"
                                                    title="Xóa ảnh"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic mb-2">Chưa có hình ảnh</p>
                                )}
                                <ImageUploadProduct onImageChange={handleImageUpload} />
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[500px] border p-4 rounded-md bg-gray-100">
                            <h3 className="text-lg font-semibold mb-2">thuộc tính</h3>
                            {variations.map((variation, index) => (
                                <div key={index} className="border p-3 rounded-md mb-2 bg-white">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">thuộc tính {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariation(index)}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                    <input type="text" placeholder="SKU" className="border p-2 rounded-md w-full mb-2" value={variation.sku} onChange={(e) => handleVariationChange(index, "sku", e.target.value)} />
                                    <input type="number" placeholder="Giá" className="border p-2 rounded-md w-full mb-2" value={variation.price} onChange={(e) => handleVariationChange(index, "price", e.target.value)} />
                                    <input type="number" placeholder="Giảm giá" className="border p-2 rounded-md w-full mb-2" value={variation.discount_price} onChange={(e) => handleVariationChange(index, "discount_price", e.target.value)} />
                                    <input type="number" placeholder="Số lượng" className="border p-2 rounded-md w-full mb-2" value={variation.stock_quantity} onChange={(e) => handleVariationChange(index, "stock_quantity", e.target.value)} />

                                    <div className="mb-2">
                                        <p className="font-medium mb-1">Hình ảnh thuộc tính:</p>
                                        {variation.images && variation.images.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {variation.images.map((img, idx) => (
                                                    <div key={`variation-${index}-img-${idx}-${img.image_path instanceof File ? img.image_path.name : img.image_path}`} className="relative group">
                                                        {renderImage(img, idx, index)}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariationImage(index, idx)}
                                                            className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                            title="Xóa ảnh"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic mb-2">Chưa có hình ảnh</p>
                                        )}
                                    </div>

                                    <ImageUploadProduct onImageChange={(files) => handleVariationImageUpload(index, files)} />

                                    {/* Hiển thị các thuộc tính đã chọn */}
                                    {Object.keys(variation.attributeMap || {}).length > 0 && (
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
                                    {attributeTypes.map(type => {
                                        // Kiểm tra xem thuộc tính này đã được chọn chưa
                                        const isTypeSelected = variation.attributeMap?.[type.id];
                                        if (isTypeSelected) return null; // Không hiển thị nếu đã chọn

                                        return (
                                            <div key={type.id} className="mb-2">
                                                <label className="block text-sm font-medium text-gray-700">{type.name}</label>
                                                <select
                                                    className="border p-2 rounded-md w-full"
                                                    value=""
                                                    onChange={(e) => handleSelectAttribute(index, type.id, e.target.value)}
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
                                        );
                                    })}
                                </div>
                            ))}

                            <button type="button" onClick={handleAddVariation} className="bg-red-600 text-white px-3 py-1 rounded-md">+ Thêm thuộc tính</button>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Hủy</button>
                        <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Cập nhật</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProduct;