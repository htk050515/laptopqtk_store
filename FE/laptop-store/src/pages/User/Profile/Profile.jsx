import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import path from "../../../constants/path";
import Footer from "../../../components/Footer/Footer";
import BackToTopButton from "../../../components/BackToTopButton/BackToTopButton";
import userApi from "../../../api/UserApi/userApi";
import { useAuth } from "../../../Contexts/AuthContext";
import { getAccessTokenFromLS } from "../../../utils/auth";

function Profile() {
    const { user, updateUser } = useAuth(); // ✅ Lấy `user` và `updateUser` từ AuthContext
    const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "", address: "" });
    const [isEditing, setIsEditing] = useState(false);
    const access_token = getAccessTokenFromLS()
    useEffect(() => {
        if (user) {
            setUserInfo(user);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({ ...userInfo, [name]: value });
    };

    const handleSave = async () => {
        try {
            const response = await userApi.updateProfile(access_token, userInfo);
            if (response.status === 200) {
                updateUser(response.data.user); // ✅ Cập nhật user trong AuthContext
                Swal.fire("Thành công!", "Thông tin cá nhân đã được cập nhật!", "success");
                setIsEditing(false);
            }
        } catch (error) {
            Swal.fire("Lỗi!", "Cập nhật thông tin thất bại!", "error");
        }
    };


    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto mt-6 mb-10">
                <nav className="text-sm flex items-center gap-2">
                    <Link to={path.home} className="hover:text-[#2563eb] transition">Trang chủ</Link>
                    <span>&gt;</span>
                    <span className="text-gray-600">Thông tin cá nhân</span>
                </nav>

                <div className="text-2xl font-bold text-[#2563eb] uppercase mt-6 text-center">
                    Thông tin cá nhân
                </div>
                <div className="my-4 border-b border-[#2563eb] w-24 mx-auto"></div>

                {/* Hiển thị thông tin cá nhân */}
                <div className="max-w-lg mx-auto bg-white shadow-lg p-6 rounded-xl border">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600">Họ và Tên</label>
                            <input
                                type="text"
                                name="name"
                                value={userInfo.name}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#2563eb] transition"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={userInfo.email}
                                className="w-full border px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500"
                                disabled // Không cho sửa email
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={userInfo.phone}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#2563eb] transition"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={userInfo.address}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#2563eb] transition"
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex justify-end gap-3 mt-6">
                        {isEditing ? (
                            <>
                                <button
                                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition"
                                    onClick={handleSave}
                                >
                                    Lưu
                                </button>
                            </>
                        ) : (
                            <button
                                className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition"
                                onClick={() => setIsEditing(true)}
                            >
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
            <BackToTopButton />
        </>
    );
}

export default Profile;
