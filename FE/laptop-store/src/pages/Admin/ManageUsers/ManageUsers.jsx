import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "../../../components/SideBar/Sidebar";
import adminApi from "../../../api/AdminApi/adminApi";
import { getAccessTokenFromLS } from "../../../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

function ManageUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const access_token = getAccessTokenFromLS();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getListUser(access_token);
            if (response.status === 200) {
                setUsers(response.data || []);
            } else {
                setUsers([]);
            }
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể tải danh sách người dùng", "error");
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        try {
            const response = await adminApi.searchUser(searchTerm, access_token);
            if (response.status === 200) {
                setUsers(response.data || []);
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Bạn có chắc muốn xóa?",
            text: "Thao tác này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await adminApi.deleteUser(id, access_token);
                    Swal.fire("Đã xóa!", "Người dùng đã được xóa.", "success");
                    fetchUsers();
                } catch (error) {
                    Swal.fire("Lỗi!", "Xóa không thành công.", "error");
                }
            }
        });
    };

    return (
        <>
            <Sidebar />
            <div className="p-6 sm:ml-60 min-h-screen mt-20 bg-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-[#2563eb]">Quản lý Người Dùng</h2>
                    <button onClick={() => setShowAddModal(true)} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        + Thêm người dùng
                    </button>
                </div>

                <div className="flex mb-4">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded-l-md w-full max-w-md"
                    />
                    <button onClick={handleSearch} className="bg-[#2563eb] text-white px-4 rounded-r-md">
                        Tìm
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-[#2563eb] font-semibold">Đang tải danh sách...</p>
                ) : users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                            <thead>
                                <tr className="bg-[#2563eb] text-white text-left">
                                    <th className="py-3 px-4 border">STT</th>
                                    <th className="py-3 px-4 border">Họ và Tên</th>
                                    <th className="py-3 px-4 border">Email</th>
                                    <th className="py-3 px-4 border">Số điện thoại</th>
                                    <th className="py-3 px-4 border">Địa chỉ</th>
                                    <th className="py-3 px-4 border">Vai trò</th>
                                    <th className="py-3 px-4 border">Trạng thái</th>
                                    <th className="py-3 px-4 border">Ngày tạo</th>
                                    <th className="py-3 px-4 border">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.id} className="text-center border bg-gray-50 hover:bg-gray-100">
                                        <td className="py-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4">{user.name || "Chưa cập nhật"}</td>
                                        <td className="py-3 px-4">{user.email}</td>
                                        <td className="py-3 px-4">{user.phone || "N/A"}</td>
                                        <td className="py-3 px-4">{user.address || "Chưa cập nhật"}</td>
                                        <td className="py-3 px-4">{user.role}</td>
                                        <td className="py-3 px-4">
                                            {user.status ? (
                                                <span className="text-green-500 font-bold">Hoạt động</span>
                                            ) : (
                                                <span className="text-gray-500 font-bold">Khóa</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-center items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentUser(user);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-[#2563eb] hover:text-blue-700 transition"
                                                    title="Sửa"
                                                >
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-[#2563eb] hover:text-blue-700 transition"
                                                    title="Xóa"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-[#2563eb] font-semibold mt-6">Không có người dùng nào</p>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Thêm người dùng</h3>
                            <input type="text" placeholder="Tên" className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} />

                            <input type="email" placeholder="Email" className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} />
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                            />

                            <input type="text" placeholder="Số điện thoại" className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })} />
                            <input type="text" placeholder="Địa chỉ" className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })} />
                            <select className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}>
                                <option value="customer">customer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="flex justify-end mt-4 space-x-2">
                                <button onClick={() => setShowAddModal(false)} className="bg-gray-300 px-4 py-2 rounded">
                                    Đóng
                                </button>
                                <button onClick={async () => {
                                    try {
                                        await adminApi.createUser(currentUser, access_token);
                                        fetchUsers();
                                        setShowAddModal(false);
                                        Swal.fire("Thành công!", "Đã thêm người dùng", "success");
                                    } catch (e) {
                                        console.error("Error adding user:", e);
                                        Swal.fire("Lỗi!", "Thêm người dùng thất bại", "error");
                                    }
                                }} className="bg-[#2563eb] text-white px-4 py-2 rounded-md">Lưu</button>
                            </div>

                        </div>
                    </div>
                )}


                {/* Modal Sửa người dùng (demo) */}
                {showEditModal && currentUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Chỉnh sửa người dùng</h3>
                            <input type="text" value={currentUser.name || ""} className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} />

                            <input type="email" value={currentUser.email || ""} className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} />
                            <input
                                type="password"
                                placeholder="Mật khẩu mới (để trống nếu không đổi)"
                                className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                            />
                            <input type="text" value={currentUser.phone || ""} className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })} />
                            <input type="text" value={currentUser.address || ""} className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })} />
                            <select value={currentUser.role || "user"} className="w-full p-2 mb-2 border rounded"
                                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}>
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="flex justify-end mt-4 space-x-2">
                                <button onClick={() => setShowEditModal(false)} className="bg-gray-300 px-4 py-2 rounded">
                                    Đóng
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await adminApi.editUser(currentUser.id, currentUser, access_token);
                                            fetchUsers();
                                            setShowEditModal(false);
                                            Swal.fire("Thành công!", "Người dùng đã được cập nhật", "success");
                                        } catch {
                                            Swal.fire("Lỗi!", "Cập nhật thất bại", "error");
                                        }
                                    }}
                                    className="bg-[#2563eb] text-white px-4 py-2 rounded-md"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default ManageUser;
