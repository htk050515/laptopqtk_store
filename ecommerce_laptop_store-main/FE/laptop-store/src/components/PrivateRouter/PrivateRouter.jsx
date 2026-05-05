// RouteComponents.js - Các component bảo vệ route
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import path from '../../constants/path';

// Route công khai - ai cũng truy cập được
export const PublicRoute = () => {
    return <Outlet />;
};

// Route dành cho khách hàng đã đăng nhập
export const CustomerRoute = () => {
    const { user, loading } = useAuth();
    if (loading) {
        return <div>Đang tải...</div>;
    }

    // Kiểm tra đã đăng nhập chưa
    if (!user) {
        return <Navigate to={path.login} replace />;
    }

    // Kiểm tra có phải khách hàng không
    if (user.role === 'customer' || user.role === 'admin') {
        return <Outlet />;
    }

    return <Navigate to={path.error} replace />;
};

// Route chỉ dành cho admin
export const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Đang tải...</div>;
    }

    // Kiểm tra đã đăng nhập chưa
    if (!user) {
        return <Navigate to={path.login} replace />;
    }

    // Kiểm tra có phải admin không
    if (user.role === 'admin') {
        return <Outlet />;
    }

    return <Navigate to={path.error} replace />;
};