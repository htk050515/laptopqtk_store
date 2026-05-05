import { useEffect, useState } from "react";
import Sidebar from "../../../components/SideBar/Sidebar";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShoppingCart,
    faFileInvoiceDollar,
    faBoxes,
    faUsers,
    faChartLine,
    faCalendarWeek,
    faCheckCircle,
    faTimesCircle,
    faExclamationTriangle,
    faTag
} from "@fortawesome/free-solid-svg-icons";
import adminApi from "../../../api/AdminApi/adminApi";
import { getAccessTokenFromLS } from "../../../utils/auth";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const access_token = getAccessTokenFromLS();

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const response = await adminApi.getDashboard(access_token);
                setDashboardData(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu dashboard:", error);
            }
        }
        fetchDashboardData();
    }, []);

    if (!dashboardData) {
        return <div className="text-center text-lg font-semibold mt-10">Đang tải dữ liệu...</div>;
    }

    const { orders, invoices, variants, users, revenue } = dashboardData;
    console.log("dashboardData", dashboardData)
    
    function formatCurrency(value) {
        if (!value) return '0 đ';
        return Number(value).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    const orderChartData = {
        labels: ["Tổng đơn hàng", "Đã hủy"],
        datasets: [
            {
                label: "Số lượng đơn hàng",
                data: [orders.total, orders.canceled],
                backgroundColor: ["#2563eb", "#ef4444"],
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const variantChartData = {
        labels: ["Tổng thuộc tính", "Hết hàng", "Còn hàng", "Đang giảm giá"],
        datasets: [
            {
                label: "Số lượng",
                data: [variants.total, variants.out_of_stock, variants.in_stock, variants.discounted],
                backgroundColor: ["#2563eb", "#ef4444", "#10b981", "#f59e0b"],
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const statCards = [
        {
            title: "Tổng đơn hàng",
            value: orders.total,
            icon: faShoppingCart,
            bgGradient: "from-red-500 to-red-600",
            iconBg: "bg-red-100",
            iconColor: "text-red-600"
        },
        {
            title: "Hóa đơn đã thanh toán",
            value: formatCurrency(invoices.total_paid),
            icon: faFileInvoiceDollar,
            bgGradient: "from-green-500 to-green-600",
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            title: "Tổng thuộc tính",
            value: variants.total,
            icon: faBoxes,
            bgGradient: "from-blue-500 to-blue-600",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            title: "Người dùng",
            value: users.total,
            icon: faUsers,
            bgGradient: "from-purple-500 to-purple-600",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            title: "Doanh thu tháng",
            value: formatCurrency(revenue.monthly),
            icon: faChartLine,
            bgGradient: "from-orange-500 to-orange-600",
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600"
        },
        {
            title: "Doanh thu tuần",
            value: formatCurrency(revenue.weekly),
            icon: faCalendarWeek,
            bgGradient: "from-indigo-500 to-indigo-600",
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600"
        },
    ];

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="p-6 sm:ml-60 w-full min-h-screen mt-20">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Tổng quan hoạt động kinh doanh LaptopQTK</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className={`bg-gradient-to-br ${card.bgGradient} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative`}
                        >
                            <div className="p-5 relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`${card.iconBg} ${card.iconColor} p-3 rounded-lg`}>
                                        <FontAwesomeIcon icon={card.icon} className="text-xl" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-white/90 mb-1">{card.title}</h3>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                Thống kê đơn hàng
                            </h2>
                        </div>
                        <div className="h-64">
                            <Bar 
                                data={orderChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            padding: 12,
                                            titleFont: {
                                                size: 14,
                                                weight: 'bold'
                                            },
                                            bodyFont: {
                                                size: 13
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)'
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-gray-600">Tổng đơn hàng: {orders.total}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                <span className="text-gray-600">Đã hủy: {orders.canceled}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBoxes} className="text-blue-500" />
                                Thống kê thuộc tính sản phẩm
                            </h2>
                        </div>
                        <div className="h-64">
                            <Bar 
                                data={variantChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            padding: 12,
                                            titleFont: {
                                                size: 14,
                                                weight: 'bold'
                                            },
                                            bodyFont: {
                                                size: 13
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)'
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                <span className="text-gray-600">Tổng: {variants.total}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <span className="text-gray-600">Hết hàng: {variants.out_of_stock}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-gray-600">Còn hàng: {variants.in_stock}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-gray-600">Giảm giá: {variants.discounted}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
