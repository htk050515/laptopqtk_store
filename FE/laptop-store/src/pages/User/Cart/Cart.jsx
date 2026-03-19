import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import path from "../../../constants/path";
import { faMinus, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../../../components/Footer/Footer";
import userApi from "../../../api/UserApi/userApi";
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

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [discountCode, setDiscountCode] = useState("");
    const [shippingCost] = useState(35000);
    const [discount, setDiscount] = useState(0);
    const navigate = useNavigate();
    // Fetch cart data on component mount
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                setLoading(true);
                const access_token = localStorage.getItem("access_token");
                if (!access_token) {
                    navigate(path.login);
                    return;
                }

                const response = await userApi.getCart(access_token);
                console.log("response", response.data)
                setCartItems(response.data || []);
            } catch (err) {
                console.error("Failed to fetch cart items:", err);
                setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, [navigate]);

    // Xử lý cập nhật số lượng sản phẩm
    const updateQuantity = async (id, type) => {
        try {
            const access_token = localStorage.getItem("access_token");
            const item = cartItems.find(item => item.id === id);

            if (!item) return;

            const newQuantity = type === "increase"
                ? item.quantity + 1
                : Math.max(item.quantity - 1, 1);

            // Update locally first for better UX
            setCartItems(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );

            // Then send update to server
            await userApi.updateCart(access_token, id, {
                quantity: newQuantity
            });

            // Dispatch event to notify Header component about cart update
            window.dispatchEvent(new CustomEvent('cart-updated'));

        } catch (err) {
            console.error("Failed to update item quantity:", err);
            setError("Không thể cập nhật số lượng. Vui lòng thử lại.");
        }
    };

    // Xử lý xóa sản phẩm
    const removeItem = async (id) => {
        try {
            const access_token = localStorage.getItem("access_token");

            // Remove locally first for better UX
            setCartItems(prev => prev.filter(item => item.id !== id));

            // Then send delete request to server
            await userApi.deleteCart(access_token, id);

            // Dispatch event to notify Header component about cart update
            window.dispatchEvent(new CustomEvent('cart-updated'));

        } catch (err) {
            console.error("Failed to remove item:", err);
            setError("Không thể xóa sản phẩm. Vui lòng thử lại.");
        }
    };
    // Format/transform cart items for UI display
    const formattedCartItems = cartItems.map(item => {
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
    // Tính tổng tiền tạm tính
    const subtotal = formattedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Xử lý áp dụng mã giảm giá
    const applyDiscount = async () => {
        try {
            if (discountCode) {
                // Mock for now
                if (discountCode === "SALE50") {
                    setDiscount(50000);
                } else {
                    setDiscount(0);
                    setError("Mã giảm giá không hợp lệ");
                }
            }
        } catch (err) {
            console.error("Failed to apply discount code:", err);
            setError("Không thể áp dụng mã giảm giá. Vui lòng thử lại.");
        }
    };

    // Xử lý thanh toán
    const proceedToCheckout = () => {
        navigate(path.checkout);
    };

    // Tổng tiền sau khi áp dụng mã giảm giá
    const total = subtotal + shippingCost - discount;

    if (loading) {
        return (
            <>
                <Header />
                <Navbar />
                <div className="container mx-auto mt-4 text-center py-10">
                    <div className="text-lg">Đang tải giỏ hàng...</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto mt-4 min-h-[calc(100vh-570px)]">
                {/* Điều hướng */}
                <nav className="text-sm flex items-center gap-2">
                    <Link to={path.home} className="hover:text-[#2563eb]">
                        Trang chủ
                    </Link>
                    <span>&gt;</span>
                    <span>Giỏ hàng</span>
                </nav>

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

                {/* Tiêu đề */}
                <div className="text-2xl font-bold text-[#2563eb] uppercase mt-4">Giỏ hàng</div>
                <div className="my-3 border-b border-[#2563eb]"></div>

                {/* Nội dung giỏ hàng */}
                {formattedCartItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-6 py-6">
                        {/* Danh sách sản phẩm */}
                        <div className="col-span-1 md:col-span-5">
                            <table className="w-full text-left text-[#2563eb]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-center">SẢN PHẨM</th>
                                        <th className="py-2">GIÁ</th>
                                        <th className="py-2">SỐ LƯỢNG</th>
                                        <th className="py-2">TẠM TÍNH</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formattedCartItems.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-4 flex items-center gap-3">
                                                <button onClick={() => removeItem(item.id)}>
                                                    <FontAwesomeIcon icon={faTimes} className="text-gray-500 hover:text-red-500" />
                                                </button>
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-16 h-16 object-cover rounded"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                    }}
                                                />
                                                <div>
                                                    <div>{item.name}</div>
                                                    <div className="text-gray-500 text-sm">SKU: {item.sku}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-[#ff0000] font-bold">
                                                {formatPrice(item.price)}
                                                {item.price < item.originalPrice && (
                                                    <div className="text-gray-500 line-through text-sm">
                                                        {formatPrice(item.originalPrice)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 flex items-center">
                                                <button onClick={() => updateQuantity(item.id, "decrease")}>
                                                    <FontAwesomeIcon icon={faMinus} className="text-gray-500 hover:text-[#2563eb]" />
                                                </button>
                                                <span className="mx-3">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, "increase")}>
                                                    <FontAwesomeIcon icon={faPlus} className="text-gray-500 hover:text-[#2563eb]" />
                                                </button>
                                            </td>
                                            <td className="py-4 font-bold text-[#ff0000]">{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4 flex flex-col md:flex-row justify-between gap-4">
                                <Link to={path.home} className="border rounded-md border-[#2563eb] px-4 py-2 text-center md:text-left text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-colors duration-100">
                                    ← TIẾP TỤC XEM SẢN PHẨM
                                </Link>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Mã ưu đãi"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        className="border px-3 py-2 rounded-md flex-grow"
                                    />
                                    <button onClick={applyDiscount} className="rounded-md bg-[#2563eb] text-white transition-colors duration-300 hover:bg-[#1d4ed8] px-4 py-2">
                                        ÁP DỤNG
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tóm tắt đơn hàng */}
                        <div className="col-span-1 md:col-span-3 border p-4 text-[#2563eb]">
                            <div className="text-lg font-semibold text-[#2563eb]">CỘNG GIỎ HÀNG</div>
                            <div className="flex justify-between mt-4">
                                <span>TẠM TÍNH</span>
                                <span className="font-bold ">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span>GIAO HÀNG</span>
                                <span>{formatPrice(shippingCost)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between mt-2 text-green-500">
                                    <span>Giảm giá</span>
                                    <span>-{formatPrice(discount)}</span>
                                </div>
                            )}
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between text-xl font-bold">
                                <span className="text-[#ff0000]">TỔNG</span>
                                <span className="text-[#ff0000]">{formatPrice(total)}</span>
                            </div>
                            <button
                                onClick={proceedToCheckout}
                                className="bg-[#2563eb] rounded-md text-white w-full py-3 mt-4 font-bold transition-colors duration-300 hover:bg-[#1d4ed8]"
                            >
                                Tiếp theo
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 flex flex-col items-center">
                        <div className="text-center text-lg text-[#2563eb] mb-4">Giỏ hàng của bạn đang trống!</div>
                        <Link to={path.home} className="bg-[#2563eb] rounded-md text-white text-center px-8 py-3 font-bold transition-colors duration-300 hover:bg-[#1d4ed8]">
                            Quay lại cửa hàng
                        </Link>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default Cart;