import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartLine,
    faTags,
    faBoxOpen,
    faUser,
    faComments,
    faFileInvoiceDollar,
    faSignOutAlt,
    faCogs,
    faList,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Home/logo1.png";
import { useLocation } from "react-router-dom";
import path from "../../constants/path";
import { clearLS } from "../../utils/auth";

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (targetPath) => location.pathname === targetPath;

    const handleLogOut = () => {
        clearLS();
        navigate(path.login);
    };

    return (
        <>
            {/* Navbar */}
            <nav className="fixed top-0 z-40 w-full bg-[#2563eb]">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start">
                            <Link to={path.dashboard} className="flex items-center cursor-pointer">
                                <img className="w-24" src={Logo} alt="Logo" />
                                {/* <div className="text-[24px] text-white font-black uppercase">PHONE STORE</div> */}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside className="fixed top-0 left-0 z-30 w-60 h-screen pt-20 bg-white border-r border-gray-200 shadow-sm sm:translate-x-0" aria-label="Sidebar">
                <div className="h-full px-3 py-6 overflow-y-auto">
                    <ul className="space-y-1 font-medium">
                        {/* Thống kê */}
                        <li>
                            <Link 
                                to={path.dashboard} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.dashboard) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faChartLine} 
                                    className={`mr-3 w-5 ${isActive(path.dashboard) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Thống kê</span>
                            </Link>
                        </li>

                        {/* Quản lý thể loại */}
                        <li>
                            <Link 
                                to={path.manageCategory} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.manageCategory) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faTags} 
                                    className={`mr-3 w-5 ${isActive(path.manageCategory) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Quản lý thể loại</span>
                            </Link>
                        </li>

                        {/* Quản lý sản phẩm */}
                        <li>
                            <Link 
                                to={path.manageProducts} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.manageProducts) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faBoxOpen} 
                                    className={`mr-3 w-5 ${isActive(path.manageProducts) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Quản lý sản phẩm</span>
                            </Link>
                        </li>

                        {/* Quản lý loại thuộc tính */}
                        <li>
                            <Link 
                                to={path.manageTypeAttributes} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.manageTypeAttributes) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faCogs} 
                                    className={`mr-3 w-5 ${isActive(path.manageTypeAttributes) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Quản lý loại thuộc tính</span>
                            </Link>
                        </li>

                        {/* Quản lý giá trị thuộc tính */}
                        <li>
                            <Link 
                                to={path.manageValueAttributes} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.manageValueAttributes) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faList} 
                                    className={`mr-3 w-5 ${isActive(path.manageValueAttributes) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Quản lý giá trị thuộc tính</span>
                            </Link>
                        </li>

                        {/* Quản lý người dùng */}
                        <li>
                            <Link 
                                to={path.manageUsers} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.manageUsers) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faUser} 
                                    className={`mr-3 w-5 ${isActive(path.manageUsers) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Quản lý khách hàng</span>
                            </Link>
                        </li>

                        {/* Quản lý nhận xét */}
                        <li>
                            <Link 
                                to={path.manageReviews} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.manageReviews) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faComments} 
                                    className={`mr-3 w-5 ${isActive(path.manageReviews) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Quản lý nhận xét</span>
                            </Link>
                        </li>

                        {/* Quản lý hóa đơn */}
                        <li>
                            <Link 
                                to={path.manageInvoices} 
                                className={`flex items-center p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isActive(path.manageInvoices) 
                                        ? "bg-[#2563eb] text-white shadow-md" 
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#2563eb]"
                                }`}
                            >
                                <FontAwesomeIcon 
                                    icon={faFileInvoiceDollar} 
                                    className={`mr-3 w-5 ${isActive(path.manageInvoices) ? "text-white" : "text-[#2563eb]"}`} 
                                />
                                <span>Quản lý đơn hàng</span>
                            </Link>
                        </li>

                        {/* Đăng xuất */}
                        <li className="mt-4 pt-4 border-t border-gray-200">
                            <button 
                                onClick={handleLogOut} 
                                className="w-full flex items-center p-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#2563eb] transition-all duration-200"
                            >
                                <FontAwesomeIcon 
                                    icon={faSignOutAlt} 
                                    className="mr-3 w-5 text-[#2563eb]" 
                                />
                                <span>Đăng xuất</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
