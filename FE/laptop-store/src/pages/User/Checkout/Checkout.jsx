import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import path from "../../../constants/path";
import Footer from "../../../components/Footer/Footer";
import BackToTopButton from "../../../components/BackToTopButton/BackToTopButton";
import Province from "../../../utils/province.json";
import District from "../../../utils/district.json";
import Wards from "../../../utils/ward.json";
import Swal from "sweetalert2";
import userApi from "../../../api/UserApi/userApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { baseUrl } from "../../../constants/config";
import { formatPrice } from "../../../utils/utils";

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

// Logger function
const logger = {
    info: (message, data) => {
        console.info(`[INFO] ${message}`, data || "");
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error || "");
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${message}`, data || "");
    },
    debug: (message, data) => {
        console.debug(`[DEBUG] ${message}`, data || "");
    }
};

function Checkout() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        city: "",
        district: "",
        ward: "",
        specificAddress: "",
        notes: ""
    });

    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [formattedCartItems, setFormattedCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shippingCost] = useState(35000);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch cart data on component mount
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                setIsLoading(true);
                logger.info("Fetching cart data...");

                const access_token = localStorage.getItem("access_token");
                if (!access_token) {
                    logger.warn("No access token found, redirecting to login");
                    Swal.fire({
                        title: "Chưa đăng nhập",
                        text: "Vui lòng đăng nhập để tiếp tục",
                        icon: "warning",
                        confirmButtonColor: "#2563eb"
                    }).then(() => {
                        navigate(path.login);
                    });
                    return;
                }

                const response = await userApi.getCart(access_token);
                if (response.data) {
                    logger.info("Cart data retrieved successfully", response.data);
                    setCartItems(response.data || []);

                    // Format cart items similar to Cart component
                    const formatted = (response.data || []).map(item => {
                        const variation = item.product_variation;
                        const product = variation.product;
                        const rawImagePath = variation.images && variation.images.length > 0
                            ? variation.images[0].image_path
                            : null;

                        return {
                            id: item.id,
                            name: product.name,
                            sku: variation.sku,
                            price: variation.discount_price ? parseFloat(variation.discount_price) : parseFloat(variation.price),
                            originalPrice: parseFloat(variation.price),
                            quantity: item.quantity,
                            image: getImageUrl(rawImagePath),
                            productId: product.id,
                            variationId: variation.id
                        };
                    });

                    setFormattedCartItems(formatted);

                    // Calculate subtotal
                    const total = formatted.reduce(
                        (sum, item) => sum + (item.price * item.quantity),
                        0
                    );
                    setSubtotal(total);
                    logger.debug("Subtotal calculated", total);
                } else {
                    logger.warn("Empty response from getCart API");
                }
            } catch (error) {
                logger.error("Failed to fetch cart data", error);
                setError("Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCartData();
    }, [navigate]);

    // Khi chọn tỉnh, cập nhật danh sách quận/huyện
    useEffect(() => {
        if (formData.city) {
            logger.debug("Province selected, updating districts", formData.city);
            const selectedProvince = Province.find(p => p.code === formData.city);
            if (selectedProvince) {
                const filteredDistricts = District.filter(d => d.code_province === selectedProvince.code);
                setDistricts(filteredDistricts);
                logger.debug("Districts updated", filteredDistricts.length);
                setFormData(prev => ({ ...prev, district: "", ward: "", specificAddress: "" })); // Reset khi chọn tỉnh mới
                setWards([]);
            }
        }
    }, [formData.city]);

    // Khi chọn quận/huyện, cập nhật danh sách xã/phường
    useEffect(() => {
        if (formData.district) {
            logger.debug("District selected, updating wards", formData.district);
            const selectedDistrict = District.find(d => d.code === formData.district);
            if (selectedDistrict) {
                const filteredWards = Wards.filter(w => w.code_district === selectedDistrict.code);
                setWards(filteredWards);
                logger.debug("Wards updated", filteredWards.length);
                setFormData(prev => ({ ...prev, ward: "", specificAddress: "" })); // Reset xã/phường khi chọn quận mới
            }
        }
    }, [formData.district]);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        logger.debug(`Form field '${name}' changed`, value);
    };

    // Validate form
    const validateForm = () => {
        if (!formData.fullName) {
            Swal.fire({
                title: "Thiếu thông tin",
                text: "Vui lòng nhập họ và tên",
                icon: "warning",
                confirmButtonColor: "#2563eb"
            });
            return false;
        }

        if (!formData.phoneNumber) {
            Swal.fire({
                title: "Thiếu thông tin",
                text: "Vui lòng nhập số điện thoại",
                icon: "warning",
                confirmButtonColor: "#2563eb"
            });
            return false;
        }

        if (!formData.city) {
            Swal.fire({
                title: "Thiếu thông tin",
                text: "Vui lòng chọn tỉnh/thành phố",
                icon: "warning",
                confirmButtonColor: "#2563eb"
            });
            return false;
        }

        if (!formData.district) {
            Swal.fire({
                title: "Thiếu thông tin",
                text: "Vui lòng chọn quận/huyện",
                icon: "warning",
                confirmButtonColor: "#2563eb"
            });
            return false;
        }

        if (!formData.ward) {
            Swal.fire({
                title: "Thiếu thông tin",
                text: "Vui lòng chọn xã/phường",
                icon: "warning",
                confirmButtonColor: "#2563eb"
            });
            return false;
        }

        if (!formData.specificAddress) {
            Swal.fire({
                title: "Thiếu thông tin",
                text: "Vui lòng nhập địa chỉ cụ thể",
                icon: "warning",
                confirmButtonColor: "#2563eb"
            });
            return false;
        }

        if (formattedCartItems.length === 0) {
            Swal.fire({
                title: "Giỏ hàng trống",
                text: "Giỏ hàng của bạn đang trống",
                icon: "warning",
                confirmButtonColor: "#2563eb"
            });
            return false;
        }

        return true;
    };

    // Xử lý Đặt hàng
    const handlePayment = async () => {
        try {
            logger.info("Payment process started");

            // Validate form
            if (!validateForm()) {
                logger.warn("Form validation failed");
                return;
            }

            // Show loading
            Swal.fire({
                title: "Đang xử lý",
                text: "Vui lòng đợi trong giây lát...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const selectedCity = Province.find(p => p.code === formData.city)?.name || "";
            const selectedDistrict = District.find(d => d.code === formData.district)?.name || "";
            const selectedWard = Wards.find(w => w.code === formData.ward)?.name || "";

            const fullAddress = `${formData.specificAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`;
            logger.debug("Full address constructed", fullAddress);

            // Get all cart item IDs
            const cartItemIds = formattedCartItems.map(item => item.id);
            logger.debug("Cart item IDs", cartItemIds);

            const requestBody = {
                cart_items: cartItemIds,
                shipping_address: fullAddress,
                shipping_phone: formData.phoneNumber,
                shipping_name: formData.fullName,
                payment_method: "VNPAY",
                notes: formData.notes,
            };

            logger.info("Sending order creation request", requestBody);

            const access_token = localStorage.getItem("access_token");
            if (!access_token) {
                logger.warn("No access token found during payment");
                Swal.close();
                Swal.fire({
                    title: "Chưa đăng nhập",
                    text: "Vui lòng đăng nhập để tiếp tục",
                    icon: "warning",
                    confirmButtonColor: "#2563eb"
                }).then(() => {
                    navigate(path.login);
                });
                return;
            }

            // Call API to create order
            const response = await userApi.createOrder(access_token, requestBody);
            console.log("responeOrder", response);
            if (response.data) {
                logger.info("Order created successfully", response.data);
                Swal.close();
                Swal.fire({
                    title: "Thành công!",
                    text: "Đơn hàng của bạn đã được tạo thành công!",
                    icon: "success",
                    confirmButtonColor: "#2563eb"
                }).then(() => {
                    // Redirect to payment gateway or confirmation page
                    // if (response.data.payment_url) {
                    //     logger.info("Redirecting to payment URL", response.data.payment_url);
                    //     window.location.href = response.data.payment_url;
                    // } else {
                    //     logger.info("Redirecting to profile page");
                    navigate(path.historyOrder);
                    // }
                });
            } else {
                logger.warn("Empty response from createOrder API");
                Swal.close();
                Swal.fire({
                    title: "Lỗi",
                    text: "Không thể tạo đơn hàng. Vui lòng thử lại sau.",
                    icon: "error",
                    confirmButtonColor: "#2563eb"
                });
            }
        } catch (error) {
            logger.error("Failed to create order", error);
            Swal.close();
            Swal.fire({
                title: "Lỗi",
                text: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
                icon: "error",
                confirmButtonColor: "#2563eb"
            });
        }
    };

    // Handler for returning to cart
    const handleReturnToCart = () => {
        logger.info("Returning to cart");
        navigate(path.cart);
    };

    // Calculate total price
    const totalPrice = subtotal + shippingCost;

    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto mt-4 ">
                <nav className="text-sm flex items-center gap-2">
                    <Link to={path.home} className="hover:text-[#2563eb]">Trang chủ</Link>
                    <span>&gt;</span>
                    <Link to={path.cart} className="hover:text-[#2563eb]">Giỏ hàng</Link>
                    <span>&gt;</span>
                    <span>Đặt hàng</span>
                </nav>

                <div className="text-2xl font-bold text-[#2563eb] uppercase mt-4">Đặt hàng</div>
                <div className="my-3 border-b border-[#2563eb]"></div>

                {/* Hiển thị lỗi nếu có */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 relative">
                        <span className="block sm:inline">{error}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                            <button onClick={() => setError(null)}>
                                <FontAwesomeIcon icon={faTimes} className="text-red-500" />
                            </button>
                        </span>
                    </div>
                )}
            </div>

            <div className="container mx-auto mt-4 text-[#2563eb]">
                {/* Return to cart button */}
                <button
                    onClick={handleReturnToCart}
                    className="mb-4 bg-[#2563eb] text-white px-4 py-2 rounded-md hover:bg-[#029e9c] flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Trở về giỏ hàng
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 border p-4 rounded">
                        <h3 className="text-lg font-bold mb-3">Thông tin Đặt hàng</h3>

                        <input type="text" name="fullName" value={formData.fullName}
                            onChange={handleChange} className="w-full border px-3 py-2 rounded-md "
                            placeholder="Nhập họ và tên" />

                        <input type="text" name="phoneNumber" value={formData.phoneNumber}
                            onChange={handleChange} className="w-full border px-3 py-2 rounded-md  mt-3"
                            placeholder="Nhập số điện thoại" />

                        {/* Chọn Tỉnh/Thành phố */}
                        <select name="city" value={formData.city} onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md  mt-3">
                            <option value="">Chọn tỉnh/thành phố</option>
                            {Province.map(province => (
                                <option key={province.code} value={province.code}>{province.name}</option>
                            ))}
                        </select>

                        {/* Chọn Quận/Huyện */}
                        <select name="district" value={formData.district} onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md  mt-3" disabled={!formData.city}>
                            <option value="">Chọn quận/huyện</option>
                            {districts.map(district => (
                                <option key={district.code} value={district.code}>{district.name}</option>
                            ))}
                        </select>

                        {/* Chọn Xã/Phường */}
                        <select name="ward" value={formData.ward} onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md  mt-3" disabled={!formData.district}>
                            <option value="">Chọn xã/phường</option>
                            {wards.map(ward => (
                                <option key={ward.code} value={ward.code}>{ward.name}</option>
                            ))}
                        </select>

                        {/* Nhập địa chỉ cụ thể */}
                        <input type="text" name="specificAddress" value={formData.specificAddress}
                            onChange={handleChange} className="w-full border px-3 py-2 rounded-md  mt-3"
                            placeholder="Nhập số nhà, tên đường..." />

                        {/* Ghi chú */}
                        <textarea name="notes" value={formData.notes} onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md  mt-3 h-20" placeholder="Nhập ghi chú (nếu có)"></textarea>
                    </div>

                    {/* Thông tin đơn hàng */}
                    <div className="col-span-1 border p-4 rounded">
                        <h3 className="text-lg font-bold mb-3">Thông tin đơn hàng</h3>

                        {isLoading ? (
                            <div className="text-center py-4">Đang tải dữ liệu...</div>
                        ) : formattedCartItems.length === 0 ? (
                            <div className="text-center py-4">Giỏ hàng của bạn đang trống</div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto mb-4">
                                {formattedCartItems.map((item) => (
                                    <div key={item.id} className="flex gap-2 py-2 border-b">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                            }}
                                        />
                                        <div className="flex-grow">
                                            <div>{item.name}</div>
                                            <div className="text-gray-500 text-sm">SKU: {item.sku}</div>
                                            <div className="flex justify-between">
                                                <span className="text-[#ff0000] font-bold">{formatPrice(item.price)} x {item.quantity}</span>
                                                <span className="text-[#ff0000] font-bold text-xl">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t my-2"></div>

                        <div className="flex justify-between mt-2">
                            <span>TẠM TÍNH</span>
                            <span className="font-bold">{formatPrice(subtotal)}</span>
                        </div>

                        <div className="flex justify-between mt-2">
                            <span>PHÍ GIAO HÀNG</span>
                            <span>{formatPrice(shippingCost)}</span>
                        </div>

                        <div className="flex justify-between font-bold text-lg mt-4 text-[#ff0000]">
                            <span>TỔNG CỘNG</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isLoading || formattedCartItems.length === 0}
                            className={`text-white w-full py-3 mt-4 font-bold rounded-md transition-colors ${isLoading || formattedCartItems.length === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#2563eb] hover:bg-[#1d4ed8]"
                                }`}
                        >
                            Đặt hàng
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
            <BackToTopButton />
        </>
    );
}

export default Checkout;