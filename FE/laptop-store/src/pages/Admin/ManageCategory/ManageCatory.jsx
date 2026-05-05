import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar/Sidebar";
import Swal from "sweetalert2";
import categoryApi from "../../../api/AdminApi/CategoryApi/categoryApi";
import { getAccessTokenFromLS } from "../../../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddCategory from "./AddCategory/AddCategory";
import EditCategory from "./EditCategory/EditCategory";

function ManageCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const access_token = getAccessTokenFromLS();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                fetchCategories();
            } else {
                handleSearch();
            }
        }, 500); // debounce delay 500ms

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryApi.getListCategories();
            setCategories(response.data);
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể tải thể loại", "error");
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await categoryApi.searchCategories(searchTerm);
            setCategories(response.data);
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể tìm kiếm thể loại", "error");
        }
        setLoading(false);
    };

    const handleDeleteCategory = (id) => {
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
                    await categoryApi.deleteCategory(access_token, id);
                    Swal.fire("Đã xóa!", "Thể loại đã bị xóa.", "success");
                    fetchCategories();
                } catch (error) {
                    Swal.fire("Lỗi!", "Xóa thể loại thất bại!", "error");
                }
            }
        });
    };

    return (
        <>
            <Sidebar />
            <div className="p-4 sm:ml-60 overflow-x-auto min-h-screen mt-20">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-2xl font-bold text-[#2563eb]">Quản lý thể loại</h2>
                    <button
                        className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-bold hover:bg-[#1d4ed8] transition"
                        onClick={() => setIsAdding(true)}
                    >
                        Thêm thể loại
                    </button>
                </div>
                <div className="my-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm thể loại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border px-3 py-1 rounded-md outline-none w-full sm:w-[300px]"
                    />
                </div>
                {loading ? (
                    <p className="text-center text-gray-500">Đang tải thể loại...</p>
                ) : (
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-[#2563eb] text-white">
                                <th className="py-2 px-4 border">STT</th>
                                <th className="py-2 px-4 border">Tên thể loại</th>
                                <th className="py-2 px-4 border">Mô tả</th>
                                <th className="py-2 px-4 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category, index) => (
                                <tr key={category.id} className="text-center border">
                                    <td className="py-2 px-4">{index + 1}</td>
                                    <td className="py-2 px-4">{category.name}</td>
                                    <td className="py-2 px-4">{category.description}</td>
                                    <td className="py-2 px-4 flex justify-center space-x-1">
                                        <button
                                            className="px-1 py-1 rounded flex items-center gap-1"
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            <FontAwesomeIcon className="text-[#2563eb] hover:text-blue-700" icon={faPen} />
                                        </button>
                                        <button
                                            className="px-1 py-1 rounded flex items-center gap-1"
                                            onClick={() => handleDeleteCategory(category.id)}
                                        >
                                            <FontAwesomeIcon className="text-red-500 hover:text-red-700" icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isAdding && <AddCategory onClose={() => setIsAdding(false)} onSuccess={fetchCategories} />}
            {selectedCategory && (
                <EditCategory
                    category={selectedCategory}
                    onClose={() => setSelectedCategory(null)}
                    onSuccess={fetchCategories}
                />
            )}
        </>
    );
}

export default ManageCategory;
