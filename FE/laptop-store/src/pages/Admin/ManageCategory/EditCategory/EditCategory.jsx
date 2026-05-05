import { useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { getAccessTokenFromLS } from "../../../../utils/auth";
import categoryApi from "../../../../api/AdminApi/CategoryApi/categoryApi";
import ImageUpload from "../../../../components/ImageUpload/ImageUpload";
import { baseUrl } from "../../../../constants/config";

const APP_URL = baseUrl; // ✅ Lấy từ .env
const STORAGE_URL = baseUrl ? `${baseUrl}/storage/` : "http://localhost:8000/storage/";

// Helper function to get image URL - supports both CDN and local storage
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150?text=No+Image';
    
    // If image path is already a full HTTPS URL (CDN), return as is
    if (imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If image path starts with /storage/, remove it and use STORAGE_URL
    if (imagePath.startsWith('/storage/')) {
        return `${STORAGE_URL}${imagePath.substring(9)}`;
    }
    
    // If image path starts with /, it's a relative path from storage
    if (imagePath.startsWith('/')) {
        return `${STORAGE_URL}${imagePath.substring(1)}`;
    }
    
    // Otherwise, prepend STORAGE_URL
    return `${STORAGE_URL}${imagePath}`;
};

function EditCategory({ category, onClose, onSuccess }) {
    const [updatedCategory, setUpdatedCategory] = useState(category);
    const [errors, setErrors] = useState({});
    const access_token = getAccessTokenFromLS();

    // ✅ Hiển thị ảnh cũ nếu có, hoặc ảnh mặc định
    const imageUrl = updatedCategory.image instanceof File
        ? URL.createObjectURL(updatedCategory.image)
        : getImageUrl(updatedCategory.image);

    const validateForm = () => {
        let errors = {};
        if (!updatedCategory.name.trim()) errors.name = "Tên thể loại không được để trống!";
        if (!updatedCategory.description.trim()) errors.description = "Mô tả không được để trống!";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        // Kiểm tra nếu dữ liệu không thay đổi thì không gửi request
        if (
            updatedCategory.name === category.name &&
            updatedCategory.description === category.description &&
            updatedCategory.image === category.image
        ) {
            Swal.fire("Không có thay đổi!", "Bạn chưa thay đổi thông tin nào.", "info");
            return;
        }

        try {
            let formData = new FormData();
            formData.append("name", updatedCategory.name);
            formData.append("description", updatedCategory.description);

            // Chỉ thêm ảnh vào form nếu người dùng chọn ảnh mới
            if (updatedCategory.image instanceof File) {
                formData.append("image", updatedCategory.image);
            }

            console.log("✅ Submitting Category Data:");
            console.log("FormData:", Object.fromEntries(formData.entries()));

            const response = await categoryApi.updateCategory(access_token, updatedCategory.id, formData);

            console.log("✅ API Response:", response);

            Swal.fire("Thành công!", "Thể loại đã được cập nhật!", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ API Error:", error.response ? error.response.data : error.message);

            // Xử lý lỗi trùng tên thể loại
            if (error.response?.data?.errors?.name) {
                setErrors(prev => ({
                    ...prev,
                    name: "Tên thể loại đã tồn tại, vui lòng chọn tên khác!"
                }));
                Swal.fire("Lỗi!", "Tên thể loại đã tồn tại, vui lòng chọn tên khác!", "error");
            } else {
                Swal.fire("Lỗi!", `Chỉnh sửa thể loại thất bại! Lỗi: ${error.response?.data?.message || error.message}`, "error");
            }
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ml-60">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-1/3">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2 className="text-xl font-bold text-[#2563eb] mb-4">Chỉnh sửa thể loại</h2>

                {/* ✅ Hiển thị ảnh hiện tại */}
                <div className="flex justify-center mb-3">
                    <img 
                        src={imageUrl} 
                        alt="Category" 
                        className="w-32 h-32 object-cover rounded"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                    />
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Tên thể loại"
                        className="border p-2 rounded-md w-full"
                        value={updatedCategory.name}
                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, name: e.target.value })}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

                    <input
                        type="text"
                        placeholder="Mô tả"
                        className="border p-2 rounded-md w-full"
                        value={updatedCategory.description}
                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, description: e.target.value })}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

                    <ImageUpload onImageChange={(file) => setUpdatedCategory({ ...updatedCategory, image: file })} />
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Hủy</button>
                    <button onClick={handleSubmit} className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Lưu</button>
                </div>
            </div>
        </div>
    );
}

export default EditCategory;