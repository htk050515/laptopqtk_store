// App.js - Thiết lập cấu trúc router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import path from './constants/path';
import Error from './pages/ErrorPage/ErrorPage';
import { AdminRoute, CustomerRoute, PublicRoute } from './components/PrivateRouter/PrivateRouter';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import Cart from './pages/User/Cart/Cart';
import Checkout from './pages/User/Checkout/Checkout';
import { AuthProvider } from './Contexts/AuthContext';
import Home from "./pages/User/Home/Home"
import Login from './pages/Login/Login';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import Profile from './pages/User/Profile/Profile';
import ManageCategory from './pages/Admin/ManageCategory/ManageCatory';
import ManageReviews from './pages/Admin/ManagReviews/ManageReviews';
import ManageProducts from './pages/Admin/ManageProducts/ManageProducts';
import ManageUsers from './pages/Admin/ManageUsers/ManageUsers';
import ManageTypeAttributes from './pages/Admin/ManageTypeAttributes/ManageTypeAttributes';
import ManageValueAttributes from './pages/Admin/ManageValueAttributes/ManageValueAttributes';
import ManageInvoices from './pages/Admin/ManageInvoices/ManageInvoices';
import ProductDetail from './pages/User/ProductDetail/ProductDetail';
import SearchResults from './pages/SearchResults/SearchResults';
import HistoryOrder from './pages/User/HistoryOrder/HistoryOrder';
import CheckPaymentStatus from './pages/User/CheckPaymentStatus/CheckPaymentStatus';
import ProductByCategory from './pages/User/ProductByCatgory/ProductByCategory';
import ChatWidget from './components/ChatWidget/ChatWidget';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Ai cũng truy cập được */}
          <Route element={<PublicRoute />}>
            <Route path={path.home} element={<Home />} />
            <Route path={path.login} element={<Login />} />
            <Route path={path.error} element={<ErrorPage />} />
            <Route path={path.productDetail} element={<ProductDetail />} />
            <Route path={path.search} element={<SearchResults />} />
            <Route path={path.category} element={<ProductByCategory />} />
          </Route>

          {/* Customer Routes - Chỉ khách hàng đã đăng nhập */}
          <Route element={<CustomerRoute />}>
            <Route path={path.cart} element={<Cart />} />
            <Route path={path.checkout} element={<Checkout />} />
            <Route path={path.profile} element={<Profile />} />
            <Route path={path.historyOrder} element={<HistoryOrder />} />
            <Route path={path.checkPaymentStatus} element={<CheckPaymentStatus />} />
          </Route>

          {/* Admin Routes - Chỉ admin */}
          <Route element={<AdminRoute />}>
            <Route path={path.dashboard} element={<Dashboard />} />
            <Route path={path.manageCategory} element={<ManageCategory />} />
            <Route path={path.manageInvoices} element={<ManageInvoices />} />
            <Route path={path.manageProducts} element={<ManageProducts />} />
            <Route path={path.manageTypeAttributes} element={<ManageTypeAttributes />} />
            <Route path={path.manageValueAttributes} element={<ManageValueAttributes />} />
            <Route path={path.manageReviews} element={<ManageReviews />} />
            <Route path={path.manageUsers} element={<ManageUsers />} />
          </Route>

        </Routes>
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;