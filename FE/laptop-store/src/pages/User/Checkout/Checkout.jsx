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
import { faTimes, faTruck, faCreditCard, faMoneyBillWave, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { baseUrl } from "../../../constants/config";
import { formatPrice } from "../../../utils/utils";

const STORAGE_URL = baseUrl ? `${baseUrl}/storage/` : "http://localhost:8000/storage/";

const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
    if (imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/storage/')) return `${STORAGE_URL}${imagePath.substring(9)}`;
    if (imagePath.startsWith('/')) return `${STORAGE_URL}${imagePath.substring(1)}`;
    return `${STORAGE_URL}${imagePath}`;
};

const PAYMENT_METHODS = [
    {
        id: 'COD',
        label: 'Thanh toán khi nhận hàng',
        desc: 'Trả tiền mặt khi nhận hàng tại nhà',
        icon: faMoneyBillWave,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-400',
    },
    {
        id: 'VNPAY',
        label: 'Thanh toán qua VNPay',
        desc: 'ATM, Visa, MasterCard, QR Code',
        icon: faCreditCard,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-400',
    },
];

function Checkout() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "", phoneNumber: "", city: "",
        district: "", ward: "", specificAddress: "", notes: ""
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [formattedCartItems, setFormattedCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shippingCost] = useState(35000);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                setIsLoading(true);
                const access_token = localStorage.getItem("access_token");
                if (!access_token) {
                    Swal.fire({ title: "Chưa đăng nhập", text: "Vui lòng đăng nhập để tiếp tục", icon: "warning", confirmButtonColor: "#2563eb" })
                        .then(() => navigate(path.login));
                    return;
                }
                const response = await userApi.getCart(access_token);
                if (response.data) {
                    const formatted = (response.data || []).map(item => {
                        const variation = item.product_variation;
                        const product = variation.product;
                        const rawImagePath = variation.images?.[0]?.image_path || null;
                        return {
                            id: item.id,
                            name: product.name,
                            sku: variation.sku,
                            price: variation.discount_price ? parseFloat(variation.discount_price) : parseFloat(variation.price),
                            quantity: item.quantity,
                            image: getImageUrl(rawImagePath),
                        };
                    });
                    setFormattedCartItems(formatted);
                    setSubtotal(formatted.reduce((sum, item) => sum + item.price * item.quantity, 0));
                }
            } catch (err) {
                setError("Không thể tải thông tin giỏ hàng. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCartData();
    }, [navigate]);

    useEffect(() => {
        if (formData.city) {
            const prov = Province.find(p => p.code === formData.city);
            if (prov) {
                setDistricts(District.filter(d => d.code_province === prov.code));
                setFormData(prev => ({ ...prev, district: "", ward: "" }));
                setWards([]);
            }
        }
    }, [formData.city]);

    useEffect(() => {
        if (formData.district) {
            const dist = District.find(d => d.code === formData.district);
            if (dist) {
                setWards(Wards.filter(w => w.code_district === dist.code));
                setFormData(prev => ({ ...prev, ward: "" }));
            }
        }
    }, [formData.district]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const checks = [
            [!formData.fullName, "Vui lòng nhập họ và tên"],
            [!formData.phoneNumber, "Vui lòng nhập số điện thoại"],
            [!/^[0-9]{10,11}$/.test(formData.phoneNumber), "Số điện thoại không hợp lệ"],
            [!formData.city, "Vui lòng chọn tỉnh/thành phố"],
            [!formData.district, "Vui lòng chọn quận/huyện"],
            [!formData.ward, "Vui lòng chọn xã/phường"],
            [!formData.specificAddress, "Vui lòng nhập địa chỉ cụ thể"],
            [formattedCartItems.length === 0, "Giỏ hàng của bạn đang trống"],
        ];
        for (const [cond, msg] of checks) {
            if (cond) {
                Swal.fire({ title: "Thiếu thông tin", text: msg, icon: "warning", confirmButtonColor: "#2563eb" });
                return false;
            }
        }
        return true;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        Swal.fire({ title: "Đang xử lý...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const selectedCity = Province.find(p => p.code === formData.city)?.name || "";
            const selectedDistrict = District.find(d => d.code === formData.district)?.name || "";
            const selectedWard = Wards.find(w => w.code === formData.ward)?.name || "";
            const fullAddress = `${formData.specificAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`;

            const access_token = localStorage.getItem("access_token");
            if (!access_token) {
                Swal.close();
                navigate(path.login);
                return;
            }

            const requestBody = {
                cart_items: formattedCartItems.map(i => i.id),
                shipping_address: fullAddress,
                shipping_phone: formData.phoneNumber,
                shipping_name: formData.fullName,
                payment_method: paymentMethod,
                notes: formData.notes,
            };

            const response = await userApi.createOrder(access_token, requestBody);

            if (response.data) {
                Swal.close();

                if (paymentMethod === 'COD') {
                    // COD: Hiển thị thông báo thành công và chuyển về lịch sử đơn hàng
                    await Swal.fire({
                        title: "Đặt hàng thành công! 🎉",
                        html: `
                            <div style="text-align:left;padding:8px 0">
                                <p style="margin-bottom:8px">Cảm ơn bạn đã đặt hàng tại <b>LaptopQTK</b>!</p>
                                <p style="margin-bottom:4px;color:#555">Phương thức thanh toán: <b style="color:#16a34a">Tiền mặt khi nhận hàng</b></p>
                                <p style="color:#555">Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.</p>
                            </div>
                        `,
                        icon: "success",
                        confirmButtonColor: "#2563eb",
                        confirmButtonText: "Xem đơn hàng",
                    });
                    navigate(path.historyOrder);

                } else if (paymentMethod === 'VNPAY') {
                    // VNPay: Tạo invoice và redirect
                    const order = response.data.order;
                    if (order?.id) {
                        try {
                            const invoiceRes = await userApi.createInvoice(access_token, order.id);
                            if (invoiceRes.data?.invoice?.id) {
                                const payRes = await userApi.payWithVnpay(access_token, invoiceRes.data.invoice.id);
                                if (payRes.data?.redirect_url) {
                                    window.location.href = payRes.data.redirect_url;
                                    return;
                                }
                            }
                        } catch (invoiceErr) {
                            console.error("Invoice/VNPay error:", invoiceErr);
                        }
                    }
                    // Fallback nếu VNPay lỗi
                    await Swal.fire({
                        title: "Đặt hàng thành công!",
                        text: "Đơn hàng đã tạo nhưng không thể kết nối VNPay. Vui lòng thanh toán sau.",
                        icon: "warning",
                        confirmButtonColor: "#2563eb",
                    });
                    navigate(path.historyOrder);
                }
            }
        } catch (err) {
            console.error("Order error:", err);
            Swal.close();
            Swal.fire({
                title: "Lỗi",
                text: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
                icon: "error",
                confirmButtonColor: "#2563eb"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPrice = subtotal + shippingCost;

    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto mt-4">
                <nav className="text-sm flex items-center gap-2">
                    <Link to={path.home} className="hover:text-[#2563eb]">Trang chủ</Link>
                    <span>&gt;</span>
                    <Link to={path.cart} className="hover:text-[#2563eb]">Giỏ hàng</Link>
                    <span>&gt;</span>
                    <span>Đặt hàng</span>
                </nav>
                <div className="text-2xl font-bold text-[#2563eb] uppercase mt-4">Đặt hàng</div>
                <div className="my-3 border-b border-[#2563eb]"></div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 relative">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="absolute top-0 right-0 px-4 py-3">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                )}
            </div>

            <div className="container mx-auto mt-4 pb-10">
                <button onClick={() => navigate(path.cart)}
                    className="mb-4 bg-[#2563eb] text-white px-4 py-2 rounded-md hover:bg-[#1d4ed8] flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Trở về giỏ hàng
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CỘT TRÁI — Thông tin giao hàng + Phương thức thanh toán */}
                    <div className="space-y-4">
                        {/* Thông tin giao hàng */}
                        <div className="border rounded-xl p-5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <FontAwesomeIcon icon={faTruck} className="text-[#2563eb]" />
                                Thông tin giao hàng
                            </h3>
                            <div className="space-y-3">
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                                    placeholder="Họ và tên người nhận *" />
                                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                                    placeholder="Số điện thoại *" />
                                <select name="city" value={formData.city} onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563eb]">
                                    <option value="">Chọn tỉnh/thành phố *</option>
                                    {Province.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                </select>
                                <select name="district" value={formData.district} onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                                    disabled={!formData.city}>
                                    <option value="">Chọn quận/huyện *</option>
                                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                </select>
                                <select name="ward" value={formData.ward} onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                                    disabled={!formData.district}>
                                    <option value="">Chọn xã/phường *</option>
                                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                </select>
                                <input type="text" name="specificAddress" value={formData.specificAddress} onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                                    placeholder="Số nhà, tên đường *" />
                                <textarea name="notes" value={formData.notes} onChange={handleChange}
                                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563eb] h-20 resize-none"
                                    placeholder="Ghi chú đơn hàng (không bắt buộc)" />
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="border rounded-xl p-5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-[#2563eb]" />
                                Phương thức thanh toán
                            </h3>
                            <div className="space-y-3">
                                {PAYMENT_METHODS.map(method => (
                                    <label key={method.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            paymentMethod === method.id
                                                ? `${method.border} ${method.bg}`
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input type="radio" name="paymentMethod" value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={() => setPaymentMethod(method.id)}
                                            className="w-4 h-4 accent-blue-600" />
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.bg}`}>
                                            <FontAwesomeIcon icon={method.icon} className={`text-lg ${method.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold text-sm ${paymentMethod === method.id ? method.color : 'text-gray-800'}`}>
                                                {method.label}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                                        </div>
                                        {paymentMethod === method.id && (
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${method.color.replace('text', 'bg')} bg-opacity-20`}>
                                                <svg className={`w-3 h-3 ${method.color}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>

                            {/* Ghi chú phương thức */}
                            {paymentMethod === 'COD' && (
                                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                                    Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Nhân viên giao hàng sẽ thu tiền tại địa chỉ giao.
                                </div>
                            )}
                            {paymentMethod === 'VNPAY' && (
                                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
                                    Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch an toàn.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI — Tóm tắt đơn hàng */}
                    <div className="border rounded-xl p-5 h-fit sticky top-4">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Tóm tắt đơn hàng</h3>

                        {isLoading ? (
                            <div className="text-center py-8 text-gray-400">Đang tải...</div>
                        ) : formattedCartItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">Giỏ hàng trống</div>
                        ) : (
                            <div className="max-h-72 overflow-y-auto space-y-3 mb-4 pr-1">
                                {formattedCartItems.map(item => (
                                    <div key={item.id} className="flex gap-3 py-2 border-b last:border-0">
                                        <img src={item.image} alt={item.name}
                                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                            onError={e => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-500">x{item.quantity}</span>
                                                <span className="text-sm font-bold text-red-500">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2 border-t pt-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tạm tính</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Phí giao hàng</span>
                                <span>{formatPrice(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Thanh toán</span>
                                <span className={paymentMethod === 'COD' ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                                    {paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'VNPay'}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-red-500 border-t pt-2 mt-2">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        <button onClick={handlePayment}
                            disabled={isLoading || isSubmitting || formattedCartItems.length === 0}
                            className={`w-full py-3.5 mt-4 font-bold rounded-xl text-white transition-all text-sm ${
                                isLoading || isSubmitting || formattedCartItems.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : paymentMethod === 'COD'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                            }`}>
                            {isSubmitting ? 'Đang xử lý...' :
                                paymentMethod === 'COD' ? 'Đặt hàng (COD)' : 'Đặt hàng & Thanh toán VNPay'}
                        </button>

                        <p className="text-xs text-gray-400 text-center mt-3">
                            Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng của LaptopQTK
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
            <BackToTopButton />
        </>
    );
}

export default Checkout;