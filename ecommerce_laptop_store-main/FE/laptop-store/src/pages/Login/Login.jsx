import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEnvelope, faPhone, faMapMarkerAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./Login.module.css";
import path from "../../constants/path";
import { useAuth } from "../../Contexts/AuthContext";
import publicApi from "../../api/PublicApi/publicApi";

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        address: "",
    });
    const navigate = useNavigate();
    const { login } = useAuth();

    // Xử lý thay đổi dữ liệu input
    const handleChange = (e, type) => {
        const { name, value } = e.target;
        if (type === "login") {
            setLoginData({ ...loginData, [name]: value });
        } else {
            setRegisterData({ ...registerData, [name]: value });
        }
    };

    // Hiển thị thông báo tự động đóng
    const showAlert = (icon, title) => {
        Swal.fire({
            icon: icon,
            title: title,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
        });
    };

    // Xử lý đăng nhập
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(loginData);
            if (result.success) {
                showAlert("success", "Đăng nhập thành công!");
                if (result.user.role === "admin") {
                    setTimeout(() => navigate(path.dashboard), 1500);
                } else {
                    setTimeout(() => navigate(path.home), 1500);
                }
            } else {
                if (result.status === 401) {
                    showAlert("error", "Sai email hoặc mật khẩu!");
                } else {
                    showAlert("error", "Lỗi hệ thống! Vui lòng thử lại.");
                }
            }
        } catch (error) {
            showAlert("error", "Đã xảy ra lỗi khi đăng nhập!");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.password_confirmation) {
            showAlert("warning", "Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await publicApi.register(registerData);
            if (response.status === 201) {
                showAlert("success", "Đăng ký thành công!");
                setIsSignUp(false); // Chuyển về form đăng nhập
            }
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response && err.response.data && err.response.data.email) {
                showAlert("error", err.response.data.email[0]);
            } else {
                showAlert("error", "Đã xảy ra lỗi khi đăng ký!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Component nút với trạng thái loading
    const LoadingButton = ({ isLoading, text, type = "submit" }) => (
        <button
            type={type}
            className="px-8 mt-2 font-bold rounded-3xl py-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
        >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Đang xử lý...
                </span>
            ) : (
                text
            )}
        </button>
    );

    return (
        <div className="login-container">
            <div className={`${styles.container} ${isSignUp ? styles["sign-up-mode"] : ""}`}>
                <div className={styles["forms-container"]}>
                    <div className={styles["signin-signup"]}>
                        {/* Form Đăng nhập */}
                        <form className={styles["sign-in-form"]} onSubmit={handleLogin}>
                            <h2 className={styles.title}>Đăng nhập</h2>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-xl mx-auto" icon={faEnvelope} />
                                <input
                                    type="email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={(e) => handleChange(e, "login")}
                                    placeholder="Email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-xl mx-auto" icon={faLock} />
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={(e) => handleChange(e, "login")}
                                    placeholder="Mật khẩu"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <LoadingButton isLoading={isLoading && !isSignUp} text="Đăng nhập" />
                        </form>

                        {/* Form Đăng ký */}
                        <form className={styles["sign-up-form"]} onSubmit={handleRegister}>
                            <h2 className={styles.title}>Đăng ký</h2>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-lg mx-auto" icon={faUser} />
                                <input
                                    type="text"
                                    name="name"
                                    value={registerData.name}
                                    onChange={(e) => handleChange(e, "register")}
                                    placeholder="Họ và tên"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-lg mx-auto" icon={faEnvelope} />
                                <input
                                    type="email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={(e) => handleChange(e, "register")}
                                    placeholder="Email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-lg mx-auto" icon={faLock} />
                                <input
                                    type="password"
                                    name="password"
                                    value={registerData.password}
                                    onChange={(e) => handleChange(e, "register")}
                                    placeholder="Mật khẩu"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-lg mx-auto" icon={faLock} />
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={registerData.password_confirmation}
                                    onChange={(e) => handleChange(e, "register")}
                                    placeholder="Xác nhận mật khẩu"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-lg mx-auto" icon={faPhone} />
                                <input
                                    type="text"
                                    name="phone"
                                    value={registerData.phone}
                                    onChange={(e) => handleChange(e, "register")}
                                    placeholder="Số điện thoại"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles["input-field"]}>
                                <FontAwesomeIcon className="text-lg mx-auto" icon={faMapMarkerAlt} />
                                <input
                                    type="text"
                                    name="address"
                                    value={registerData.address}
                                    onChange={(e) => handleChange(e, "register")}
                                    placeholder="Địa chỉ"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <LoadingButton isLoading={isLoading && isSignUp} text="Đăng ký" />
                        </form>
                    </div>
                </div>
                {/* Panels */}
                <div className={styles["panels-container"]}>
                    <div className={`${styles.panel} ${styles["left-panel"]}`}>
                        <div className={styles.content}>
                            <h3>Bạn chưa có tài khoản?</h3>
                            <p>Hãy đăng ký ngay để nhận nhiều ưu đãi khi mua hàng tại LaptopQTK!</p>
                            <button
                                className={`${styles.btn} ${styles.transparent}`}
                                onClick={() => setIsSignUp(true)}
                                disabled={isLoading}
                                type="button"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>

                    <div className={`${styles.panel} ${styles["right-panel"]}`}>
                        <div className={styles.content}>
                            <h3>Bạn đã có tài khoản?</h3>
                            <p>Đăng nhập ngay để tiếp tục mua sắm tại LaptopQTK!</p>
                            <button
                                className={`${styles.btn} ${styles.transparent}`}
                                onClick={() => setIsSignUp(false)}
                                disabled={isLoading}
                                type="button"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;