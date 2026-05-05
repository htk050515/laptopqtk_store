import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../../components/SideBar/Sidebar";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import AddTypeAttribute from "./AddTypeAttributes/AddTypeAttributes";
import EditTypeAttribute from "./EditTypeAttributes/EditTypeAttributes";
import attributeTypeApi from "../../../api/AdminApi/AttributeTypeApi/attributeTypeApi";
import { getAccessTokenFromLS } from "../../../utils/auth";

function ManageTypeAttributes() {
    const [typeAttributes, setTypeAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const access_token = getAccessTokenFromLS();

    // Fetch attributes on initial load
    useEffect(() => {
        fetchTypeAttributes("");
    }, []);

    const fetchTypeAttributes = async (term = "") => {
        setLoading(true);
        try {
            let response;
            if (term) {
                response = await attributeTypeApi.searchAttributeTypes(term);
            } else {
                response = await attributeTypeApi.getListAttributeTypes(access_token);
            }

            console.log("🚀 API Response:", response);

            if (response.status === 200 && response.data && Array.isArray(response.data.data)) {
                setTypeAttributes(response.data.data);
            } else {
                setTypeAttributes([]);
            }
        } catch (error) {
            console.error("❌ Lỗi API:", error);
            Swal.fire("Lỗi!", "Không thể tải danh sách loại thuộc tính", "error");
            setTypeAttributes([]);
        }
        setLoading(false);
    };


    const handleSearchChange = (e) => {
        const value = e.target.value;

        // Clear any existing timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set search term immediately for UI feedback
        setSearchTerm(value);

        // Create a new timeout for the actual API call
        const timeout = setTimeout(() => {
            fetchTypeAttributes(value);
        }, 300);

        // Save the timeout ID to clear it if needed
        setDebounceTimeout(timeout);
    };

    const handleDeleteAttribute = (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
            customClass: {
                confirmButton: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition",
                cancelButton: "bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition",
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await attributeTypeApi.deleteAttributeType(access_token, id);
                    Swal.fire("Đã xóa!", "Loại thuộc tính đã bị xóa.", "success");
                    fetchTypeAttributes(searchTerm); // Refresh with current search term
                } catch (error) {
                    Swal.fire("Lỗi!", "Xóa loại thuộc tính thất bại!", "error");
                }
            }
        });
    };
    return (
        <>
            <Sidebar />
            <div className="p-4 sm:ml-60 overflow-x-auto min-h-screen mt-20">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-[#2563eb]">Quản lý Loại Thuộc Tính</h2>
                    <button
                        className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-bold hover:bg-[#1d4ed8] transition"
                        onClick={() => setIsAdding(true)}
                    >
                        Thêm loại thuộc tính
                    </button>
                </div>

                {/* Search input */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc tên hiển thị..."
                        className="w-1/3 px-2 py-1 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                        onChange={handleSearchChange}
                        defaultValue={searchTerm}
                    />
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                </div>

                {loading ? (
                    <p className="text-center text-[#2563eb]">Đang tải danh sách...</p>
                ) : typeAttributes.length === 0 ? (
                    <p className="text-center text-[#2563eb]">
                        {searchTerm ? "Không tìm thấy thuộc tính nào phù hợp với tìm kiếm." : "Không có thuộc tính nào."}
                    </p>
                ) : (
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-[#2563eb] text-white">
                                <th className="py-2 px-4 border">STT</th>
                                <th className="py-2 px-4 border">Tên</th>
                                <th className="py-2 px-4 border">Tên Hiển Thị</th>
                                <th className="py-2 px-4 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {typeAttributes.map((attribute, index) => (
                                <tr key={attribute.id} className="text-center border">
                                    <td className="py-2 px-4">{index + 1}</td>
                                    <td className="py-2 px-4">{attribute.name}</td>
                                    <td className="py-2 px-4">{attribute.display_name}</td>
                                    <td className="py-2 px-4 flex justify-center space-x-1">
                                        <button className="px-1 py-1 rounded flex items-center gap-1" onClick={() => setSelectedAttribute(attribute)}>
                                            <FontAwesomeIcon className="text-[#2563eb] hover:text-blue-700" icon={faPen} />
                                        </button>
                                        <button className="px-1 py-1 rounded flex items-center gap-1" onClick={() => handleDeleteAttribute(attribute.id)}>
                                            <FontAwesomeIcon className="text-red-500 hover:text-red-700" icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Hiển thị modal thêm loại thuộc tính */}
            {isAdding && <AddTypeAttribute onClose={() => setIsAdding(false)} onSuccess={() => fetchTypeAttributes(searchTerm)} />}

            {/* Hiển thị modal chỉnh sửa loại thuộc tính */}
            {selectedAttribute && (
                <EditTypeAttribute
                    attribute={selectedAttribute}
                    onClose={() => setSelectedAttribute(null)}
                    onSuccess={() => fetchTypeAttributes(searchTerm)}
                />
            )}
        </>
    );
}

export default ManageTypeAttributes;