import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { clearLS } from "../utils/auth";
import path from "../constants/path";
import { useAuth } from "../Contexts/AuthContext";

const useAuthActions = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate(); // ✅ Được dùng bên trong <Router>

    const logout = () => {
        Swal.fire({
            icon: "success",
            title: "Đã đăng xuất!",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
        });

        clearLS();
        setUser(null);

        setTimeout(() => {
            navigate(path.login); // ✅ Không lỗi vì trong hook
        }, 1500);
    };

    return { logout };
};

export default useAuthActions;
