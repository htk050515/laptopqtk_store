import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import attributeTypeApi from "../../../../api/AdminApi/AttributeTypeApi/attributeTypeApi";
import { getAccessTokenFromLS } from "../../../../utils/auth";
import attributeValueApi from "../../../../api/AdminApi/AttributeValueApi/AttributeValueApi";

function AddValueAttribute({ onClose, onSuccess }) {
    const [form, setForm] = useState({ attribute_type_id: "", value: "", display_value: "" });
    const [attributeTypes, setAttributeTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const access_token = getAccessTokenFromLS();

    useEffect(() => {
        fetchAttributeTypes();
    }, []);

    const fetchAttributeTypes = async () => {
        try {
            const response = await attributeTypeApi.getListAttributeTypes(access_token);
            console.log("typeAttribute", response)
            if (response.status === 200 && response.data && Array.isArray(response.data.data)) {
                setAttributeTypes(response.data.data);
            }
        } catch (error) {
            console.error("❌ Lỗi API lấy danh sách loại thuộc tính:", error);
        }
    };

    const validateForm = () => {
        let errors = {};
        if (!form.attribute_type_id) errors.attribute_type_id = "Vui lòng chọn loại thuộc tính!";
        if (!form.value.trim()) errors.value = "Giá trị không được để trống!";
        if (!form.display_value.trim()) errors.display_value = "Giá trị hiển thị không được để trống!";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            console.log("🚀 Gửi yêu cầu tạo giá trị thuộc tính:", form);
            const response = await attributeValueApi.createAttributeValue(access_token, form);
            console.log("✅ Phản hồi từ server:", response);
            Swal.fire("Thành công!", "Giá trị thuộc tính mới đã được thêm!", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi API:", error);
            Swal.fire("Lỗi!", "Thêm giá trị thuộc tính thất bại!", "error");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-1/3">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2 className="text-xl font-bold text-[#2563eb] mb-4">Thêm Giá Trị Thuộc Tính</h2>

                <div className="space-y-3">
                    <select
                        className="border p-2 rounded-md w-full"
                        value={form.attribute_type_id}
                        onChange={(e) => setForm({ ...form, attribute_type_id: e.target.value })}
                    >
                        <option value="">Chọn loại thuộc tính</option>
                        {attributeTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.display_name}</option>
                        ))}
                    </select>
                    {errors.attribute_type_id && <p className="text-red-500 text-sm">{errors.attribute_type_id}</p>}

                    <input
                        type="text"
                        placeholder="Giá Trị"
                        className="border p-2 rounded-md w-full"
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                    />
                    {errors.value && <p className="text-red-500 text-sm">{errors.value}</p>}

                    <input
                        type="text"
                        placeholder="Giá Trị Hiển Thị"
                        className="border p-2 rounded-md w-full"
                        value={form.display_value}
                        onChange={(e) => setForm({ ...form, display_value: e.target.value })}
                    />
                    {errors.display_value && <p className="text-red-500 text-sm">{errors.display_value}</p>}
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Hủy</button>
                    <button onClick={handleSubmit} className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Lưu</button>
                </div>
            </div>
        </div>
    );
}

export default AddValueAttribute;
