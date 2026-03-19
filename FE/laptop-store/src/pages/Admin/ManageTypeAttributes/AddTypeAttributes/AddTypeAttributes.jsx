import { useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import attributeTypeApi from "../../../../api/AdminApi/AttributeTypeApi/attributeTypeApi";
import { getAccessTokenFromLS } from "../../../../utils/auth";

function AddTypeAttribute({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: "", display_name: "" });
    const [errors, setErrors] = useState({});
    const access_token = getAccessTokenFromLS();

    const validateForm = () => {
        let errors = {};
        if (!form.name.trim()) errors.name = "Tên không được để trống!";
        if (!form.display_name.trim()) errors.display_name = "Tên hiển thị không được để trống!";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            console.log("🚀 Gửi yêu cầu tạo loại thuộc tính:", form);
            const response = await attributeTypeApi.createAttributeType(access_token, form);
            console.log("✅ Phản hồi từ server:", response);
            Swal.fire("Thành công!", "Loại thuộc tính mới đã được thêm!", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi API:", error);
            Swal.fire("Lỗi!", "Thêm loại thuộc tính thất bại!", "error");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-1/3 ml-60">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2 className="text-xl font-bold text-[#2563eb] mb-4">Thêm Loại Thuộc Tính</h2>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Tên"
                        className="border p-2 rounded-md w-full"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

                    <input
                        type="text"
                        placeholder="Tên Hiển Thị"
                        className="border p-2 rounded-md w-full"
                        value={form.display_name}
                        onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                    />
                    {errors.display_name && <p className="text-red-500 text-sm">{errors.display_name}</p>}
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Hủy</button>
                    <button onClick={handleSubmit} className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Lưu</button>
                </div>
            </div>
        </div>
    );
}

export default AddTypeAttribute;
