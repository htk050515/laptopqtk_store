import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/Home/logo1.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faShoppingCart, faSignOutAlt, faEdit, faHistory } from '@fortawesome/free-solid-svg-icons';
import path from '../../constants/path';
import useAuthActions from '../../hooks/useAuthActions';
import { useAuth } from '../../Contexts/AuthContext';
import userApi from '../../api/UserApi/userApi';
import productApi from '../../api/AdminApi/ProductApi/productApi';
import { baseUrl } from '../../constants/config';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const { user } = useAuth();
    const { logout } = useAuthActions();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const APP_URL = baseUrl;
    const STORAGE_URL = baseUrl ? `${baseUrl}/storage/` : "http://localhost:8000/storage/";

    // Helper function to get image URL - supports both CDN and local storage
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
        
        // If image path is already a full HTTPS URL (CDN), return as is
        if (imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // If image path starts with /storage/, remove it and use STORAGE_URL
        if (imagePath.startsWith('/storage/')) {
            return `${STORAGE_URL}${imagePath.substring(9)}`;
        }
        
        // If image path starts with /, it's a relative path from storage
        if (imagePath.startsWith('/')) {
            return `${STORAGE_URL}${imagePath.substring(1)}`;
        }
        
        // Otherwise, prepend STORAGE_URL
        return `${STORAGE_URL}${imagePath}`;
    };

    // Fetch cart data on component mount and whenever the cart might change
    const fetchCartCount = async () => {
        try {
            const access_token = localStorage.getItem("access_token");
            if (!access_token) return;

            const response = await userApi.getCart(access_token);
            if (response.data) {
                setCartItemCount(response.data.length);
            }
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
        }
    };

    useEffect(() => {
        fetchCartCount();

        // Listen for cart update events
        window.addEventListener('cart-updated', fetchCartCount);

        // Add click event listener to handle clicks outside search dropdown
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('cart-updated', fetchCartCount);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowSearchResults(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setShowSearchResults(false);
            setNoResults(false);
            return;
        }

        try {
            const response = await productApi.searchProducts({ name: searchTerm });
            console.log("response", response);
            if (response.data && response.data.length > 0) {
                setSearchResults(response.data);
                setShowSearchResults(true);
                setNoResults(false);
            } else {
                setSearchResults([]);
                setShowSearchResults(true);
                setNoResults(true);
            }
        } catch (error) {
            console.error("Search failed:", error);
            setNoResults(true);
            setShowSearchResults(true);
        }
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                handleSearch();
            } else {
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
        setShowSearchResults(false);
        setSearchTerm('');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setShowSearchResults(false);
        }
    };

    return (
        <div className='bg-[#2563eb]'>
        <div className="container mx-auto py-3 px-2">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex gap-x-3 items-center">
                    <Link to={path.home}>
                        <h1 className="text-white text-2xl md:text-3xl font-bold cursor-pointer tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                            LaptopQTK
                        </h1>
                    </Link>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="w-25rem relative" ref={searchRef}>
                    <form onSubmit={handleSearchSubmit} className="border border-white grid grid-cols-4 px-2 justify-between items-center rounded-md bg-white">
                        <input
                            className="text-sm p-1 py-2 outline-none col-span-3 bg-transparent rounded-md"
                            type="text"
                            placeholder="Nhập sản phẩm cần tìm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                if (searchTerm && (searchResults.length > 0 || noResults)) {
                                    setShowSearchResults(true);
                                }
                            }}
                        />
                        <button className='col-span-1 justify-end flex' type="submit">
                            <FontAwesomeIcon className="hover:text-[#ffdfe2] hover:cursor-pointer" icon={faSearch} />
                        </button>
                    </form>

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-y-auto" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {noResults ? (
                                <div className="p-3 text-center text-gray-500">Không tìm thấy sản phẩm</div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto">
                                    {searchResults.map((product) => (
                                        <div
                                            key={product.id}
                                            className="p-2 hover:bg-gray-100 cursor-pointer border-b flex items-center"
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            {product.images && product.images[0] && (
                                                <img
                                                    src={getImageUrl(product.images[0].image_path)}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover mr-3"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = Logo; // Fallback to logo if image fails to load
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1 overflow-hidden">
                                                <div className="font-medium text-sm truncate">{product.name}</div>
                                                <div className="text-[#fff] text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Đăng nhập / Người dùng */}
                <div className="flex gap-x-5 items-center relative">
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-x-2 text-[#fff] hover:text-[#ffdfe2] font-semibold">
                                <FontAwesomeIcon icon={faUser} className="text-lg" />
                                <span className="hidden md:inline">{user.name}</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                                    <Link to={path.profile} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faEdit} />
                                        Sửa thông tin
                                    </Link>
                                    <Link to={path.historyOrder} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHistory} />
                                        Lịch sử đặt hàng
                                    </Link>
                                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to={path.login} className="flex items-center gap-x-2 text-[#fff] hover:text-[#ffdfe2] font-semibold">
                            <FontAwesomeIcon icon={faUser} className="text-lg" />
                            <span className="">Đăng nhập</span>
                        </Link>
                    )}

                    {/* Giỏ hàng với số lượng */}
                    <Link to={path.cart} className="flex items-center gap-x-2 text-[#fff] hover:text-[#ffdfe2] font-semibold relative">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
                        <span className="hidden md:inline">Giỏ hàng</span>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-[#2563eb] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Header;