import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import userApi from "../../../api/UserApi/userApi";
import Swal from "sweetalert2";
import path from "../../../constants/path";
import { getAccessTokenFromLS } from "../../../utils/auth";

function CheckPaymentStatus() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetched = useRef(false); // Dùng ref để tránh gọi API nhiều lần

    // Lấy invoice_number từ query params
    const queryParams = new URLSearchParams(location.search);
    const invoice_number = queryParams.get("invoice_number");

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            if (!invoice_number || hasFetched.current) return;

            hasFetched.current = true;

            try {
                const access_token = getAccessTokenFromLS();
                const response = await userApi.getPaymenStatus(access_token, invoice_number);

                const isSuccess = response.data.status === "success";
                const message = response.data.message || (isSuccess
                    ? "Giao dịch đã được xử lý."
                    : "Có lỗi xảy ra trong quá trình xử lý.");

                await Swal.fire({
                    icon: isSuccess ? "success" : "error",
                    text: message,
                    timer: 3000,
                    showConfirmButton: false
                });

                navigate(isSuccess ? path.historyOrder : path.historyOrder);

            } catch (error) {
                console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
                await Swal.fire({
                    icon: "error",
                    title: "Lỗi hệ thống!",
                    text: "Vui lòng thử lại sau.",
                    timer: 3000,
                    showConfirmButton: false
                });

                navigate(path.home);
            }
        };

        fetchPaymentStatus();
    }, [invoice_number, navigate]);

    return null; // Không cần render gì cả
}

export default CheckPaymentStatus;
