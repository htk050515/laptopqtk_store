import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import path from "../../../constants/path";
import { faFileInvoice, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userApi from "../../../api/UserApi/userApi";
import { baseUrl } from "../../../constants/config";
import { getAccessTokenFromLS, setInvoinceNumberToLS, } from "../../../utils/auth";
import Swal from "sweetalert2"; // Import SweetAlert2
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

function HistoryOrder() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingOrderId, setProcessingOrderId] = useState(null);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const navigate = useNavigate();

    // Fetch orders data on component mount
    useEffect(() => {
        const fetchOrdersData = async () => {
            try {
                setLoading(true);
                const access_token = getAccessTokenFromLS();
                if (!access_token) {
                    navigate(path.login);
                    return;
                }

                const response = await userApi.getOrders(access_token);
                console.log("response", response)
                setOrders(response.data.orders || []);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrdersData();
    }, [navigate]);

    // Handle order payment
    const handlePayment = async (orderId) => {
        try {
            setProcessingOrderId(orderId);
            const access_token = getAccessTokenFromLS();
            console.log("access token", access_token);
            // Create invoice
            const invoiceResponse = await userApi.createInvoice(access_token, orderId);
            console.log(invoiceResponse)
            const invoiceId = invoiceResponse.data.invoice.id;
            setInvoinceNumberToLS(invoiceResponse.data.invoice.invoice_number)

            // Create payment for invoice
            const paymentResponse = await userApi.createInvoicePay(access_token, invoiceId);

            // Redirect to payment page if URL is returned
            if (paymentResponse && paymentResponse.data.redirect_url) {
                window.location.href = paymentResponse.data.redirect_url;
            } else {
                // If no URL, reload the page to update status
                window.location.reload();
            }
        } catch (err) {
            console.log(err)
            console.error("Failed to process payment:", err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể xử lý thanh toán. Vui lòng thử lại sau.',
            });
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Open cancel order modal
    const openCancelModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
        setCancelReason("");
    };

    // Close cancel order modal
    const closeCancelModal = () => {
        setShowCancelModal(false);
        setSelectedOrderId(null);
        setCancelReason("");
    };

    // Handle order cancellation
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            // Show error with SweetAlert2 when reason is empty
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng nhập lý do hủy đơn hàng',
            });
            return;
        }

        try {
            setCancellingOrderId(selectedOrderId);
            const access_token = getAccessTokenFromLS();

            await userApi.cancelOrder(access_token, selectedOrderId, cancelReason);

            // Update local order status
            setOrders(orders.map(order =>
                order.id === selectedOrderId
                    ? { ...order, status: 'cancelled' }
                    : order
            ));

            closeCancelModal();

            // Show success notification with SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Đơn hàng đã được hủy thành công',
            });

        } catch (err) {
            console.error("Failed to cancel order:", err);

            // Show error with SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể hủy đơn hàng. Vui lòng thử lại sau.',
            });
        } finally {
            setCancellingOrderId(null);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Convert order status to Vietnamese
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'shipped': 'Đã giao hàng',
            'delivered': 'Đã nhận hàng',
            'cancelled': 'Đã hủy',
            'completed': 'Hoàn thành'
        };
        return statusMap[status] || status;
    };

    // Convert payment status to Vietnamese
    const getPaymentStatusText = (status) => {
        const statusMap = {
            'pending': 'Chưa thanh toán',
            'paid': 'Đã thanh toán',
            'failed': 'Thanh toán thất bại',
            'refunded': 'Đã hoàn tiền'
        };
        return statusMap[status] || status;
    };

    // Check if order can be paid
    const canPayOrder = (order) => {
        return order.payment_status === 'pending' &&
            (order.status === 'pending' || order.status === 'processing');
    };

    // Check if order can be cancelled
    // Check if order can be cancelled
    const canCancelOrder = (order) => {
        return (order.status === 'pending' || order.status === 'processing') &&
            order.payment_status !== 'paid';
    };

    // Get status color class
    const getStatusColorClass = (status) => {
        if (status === 'delivered' || status === 'completed') {
            return 'bg-green-100 text-green-800';
        } else if (status === 'cancelled') {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-blue-100 text-blue-800';
    };

    // Get payment status color class
    const getPaymentStatusColorClass = (status) => {
        if (status === 'paid') {
            return 'bg-green-100 text-green-800';
        } else if (status === 'failed' || status === 'refunded') {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-yellow-100 text-yellow-800';
    };

    // Render order item
    const renderOrderItem = (item) => {
        const product = item.variation.product;
        const variation = item.variation;
        const rawImagePath = variation.images && variation.images.length > 0
            ? variation.images[0].image_path
            : null;

        return (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                <img
                    src={getImageUrl(rawImagePath)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                    }}
                />
                <div className="flex-grow">
                    <div className="text-[#2563eb] font-medium">{product.name}</div>
                    <div className="text-gray-500 text-sm">SKU: {variation.sku}</div>
                    {variation.attributes && variation.attributes.length > 0 && (
                        <div className="text-sm text-gray-500">
                            {variation.attributes.map(attr =>
                                <span key={attr.id} className="mr-2">
                                    {attr.attribute_value.display_value}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <div className="text-gray-500">Số lượng: {item.quantity}</div>
                    <div className="text-[#2563eb] font-bold">
                        {formatPrice(item.discount_price || item.price)}
                    </div>
                    {item.discount_price && parseFloat(item.discount_price) < parseFloat(item.price) && (
                        <div className="text-gray-500 line-through text-sm">
                            {formatPrice(item.price)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Header />
                <Navbar />
                <div className="container mx-auto mt-4 text-center py-10">
                    <div className="text-lg">Đang tải lịch sử đơn hàng...</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto mt-4 pb-8">
                {/* Navigation breadcrumbs */}
                <nav className="text-sm flex items-center gap-2">
                    <Link to={path.home} className="hover:text-[#2563eb]">
                        Trang chủ
                    </Link>
                    <span>&gt;</span>
                    <span>Lịch sử đơn hàng</span>
                </nav>

                {/* Display error if exists */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 relative">
                        <span className="block sm:inline">{error}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                            <button onClick={() => setError(null)} aria-label="Close">
                                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <title>Đóng</title>
                                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                                </svg>
                            </button>
                        </span>
                    </div>
                )}

                {/* Title */}
                <div className="text-2xl font-bold text-[#2563eb] uppercase mt-4">Lịch sử đơn hàng</div>
                <div className="my-3 border-b border-[#2563eb]"></div>

                {/* Order history content */}
                {orders.length > 0 ? (
                    <div className="mt-4">
                        {orders.map((order) => (
                            <div key={order.id} className="mb-8 border rounded-lg shadow-sm overflow-hidden">
                                {/* Order information */}
                                <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row justify-between">
                                    <div>
                                        <div className="font-medium text-gray-700">
                                            Mã đơn hàng: <span className="text-[#2563eb]">{order.order_number}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Ngày đặt: {formatDate(order.created_at)}
                                        </div>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex flex-col md:items-end">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Trạng thái đơn hàng:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-medium">Thanh toán:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColorClass(order.payment_status)}`}>
                                                {getPaymentStatusText(order.payment_status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product list */}
                                <div className="p-4">
                                    {order.items.map((item) => renderOrderItem(item))}
                                </div>

                                {/* Total amount and payment */}
                                <div className="bg-gray-50 p-4 border-t flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div>
                                        <div className="font-medium">Phương thức thanh toán: {order.payment_method}</div>
                                        {order.notes && (
                                            <div className="text-sm text-gray-600 mt-1">
                                                Ghi chú: {order.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 md:mt-0 flex flex-col items-end">
                                        <div className="text-lg font-bold text-[#2563eb]">
                                            Tổng tiền: {formatPrice(order.total_amount)}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {canCancelOrder(order) && (
                                                <button
                                                    onClick={() => openCancelModal(order.id)}
                                                    disabled={cancellingOrderId === order.id}
                                                    className={`bg-blue-500 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-red-600 transition-colors ${cancellingOrderId === order.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    <FontAwesomeIcon icon={faBan} />
                                                    {cancellingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                                </button>
                                            )}
                                            {canPayOrder(order) && (
                                                <button
                                                    onClick={() => handlePayment(order.id)}
                                                    disabled={processingOrderId === order.id}
                                                    className={`bg-[#2563eb] text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-[#1d4ed8] transition-colors ${processingOrderId === order.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    <FontAwesomeIcon icon={faFileInvoice} />
                                                    {processingOrderId === order.id ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 flex flex-col items-center">
                        <div className="text-center text-lg text-[#2563eb] mb-4">Bạn chưa có đơn hàng nào!</div>
                        <Link to={path.home} className="bg-[#2563eb] rounded-md text-white text-center px-8 py-3 font-bold transition-colors duration-300 hover:bg-[#1d4ed8]">
                            Mua sắm ngay
                        </Link>
                    </div>
                )}

                {/* Cancel Order Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Hủy đơn hàng</h3>
                            <p className="mb-4">Vui lòng nhập lý do hủy đơn hàng:</p>
                            <textarea
                                className="w-full border rounded-md p-2 mb-4 h-32"
                                placeholder="Lý do hủy đơn hàng..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeCancelModal}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Xác nhận hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default HistoryOrder;