import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "../../../components/SideBar/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
import { getAccessTokenFromLS } from "../../../utils/auth";
import { formatPrice } from "../../../utils/utils";
import EditProduct from "./EditProduct/EditProduct";
import AddProduct from "./AddProduct/AddProduct";
import productApi from "../../../api/AdminApi/ProductApi/productApi";

const BASE_URL = "http://localhost:8000/storage/";

// Helper function to get image URL - supports both CDN and local storage
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
    
    // If image path is already a full HTTPS URL (CDN), return as is
    if (imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If image path starts with /storage/, remove it and use BASE_URL
    if (imagePath.startsWith('/storage/')) {
        return `${BASE_URL}${imagePath.substring(9)}`;
    }
    
    // If image path starts with /, it's a relative path from storage
    if (imagePath.startsWith('/')) {
        return `${BASE_URL}${imagePath.substring(1)}`;
    }
    
    // Otherwise, prepend BASE_URL
    return `${BASE_URL}${imagePath}`;
};


function ManageProduct() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariations, setSelectedVariations] = useState(null);
    const access_token = getAccessTokenFromLS();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // debounce 500ms

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);
    useEffect(() => {
        if (debouncedSearchTerm.trim() === "") {
            fetchProducts(); // nếu input rỗng thì load tất cả
        } else {
            searchProducts(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    const searchProducts = async (term) => {
        setLoading(true);
        try {
            const response = await productApi.searchProducts({ name: term });
            if (response.status === 200) {
                setProducts(response.data || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Tìm kiếm thất bại", error);
            Swal.fire("Lỗi!", "Không thể tìm kiếm sản phẩm", "error");
            setProducts([]);
        }
        setLoading(false);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.getListProducts();
            if (response.status === 200) {
                setProducts(response.data || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể tải danh sách sản phẩm", "error");
            setProducts([]);
        }
        setLoading(false);
    };

    const handleDeleteProduct = (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await productApi.deleteProduct(access_token, id);
                    Swal.fire("Đã xóa!", "Sản phẩm đã bị xóa.", "success");
                    fetchProducts();
                } catch (error) {
                    Swal.fire("Lỗi!", "Xóa sản phẩm thất bại!", "error");
                }
            }
        });
    };

    return (
        <>
            <Sidebar />
            <div className="p-6 sm:ml-60 overflow-x-auto min-h-screen mt-20 bg-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#2563eb]">Quản lý Sản Phẩm</h2>
                    <button
                        className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-bold hover:bg-[#1d4ed8] transition"
                        onClick={() => setIsAdding(true)}
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        className="w-1/3 px-2 py-1 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}

                    />
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                </div>
                {loading ? (
                    <p className="text-center text-[#2563eb] text-lg font-semibold">Đang tải danh sách...</p>
                ) : products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                            <thead>
                                <tr className="bg-[#2563eb] text-white text-left">
                                    <th className="py-3 px-4 border">STT</th>
                                    <th className="py-3 px-4 border">Ảnh</th>
                                    <th className="py-3 px-4 border">Tên</th>
                                    <th className="py-3 px-4 border">Danh mục</th>
                                    <th className="py-3 px-4 border">Giá gốc</th>
                                    <th className="py-3 px-4 border">Giá giảm</th>
                                    <th className="py-3 px-4 border">thuộc tính</th>
                                    <th className="py-3 px-4 border">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product.id} className="text-center border bg-gray-50 hover:bg-gray-100">
                                        <td className="py-3 px-4">{index + 1}</td>
                                        {/* Hiển thị ảnh sản phẩm */}
                                        <td className="py-3 px-4">
                                            <img
                                                src={getImageUrl(product.images[0]?.image_path)}
                                                alt={product.name}
                                                className="w-16 h-16 object-cover rounded-md border"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                }}
                                            />
                                        </td>
                                        <td className="py-3 px-4 font-semibold">{product.name}</td>
                                        <td className="py-3 px-4">{product.categories?.name || "Không có danh mục"}</td>
                                        <td className="py-3 px-4 font-semibold">{formatPrice(product.base_price)}</td>
                                        <td className="py-3 px-4 text-red-500 font-semibold">
                                            {formatPrice(product.variations[0]?.discount_price || product.base_price)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {product.variations.length > 0 ? (
                                                <button
                                                    className="text-blue-500 font-semibold underline"
                                                    onClick={() => setSelectedVariations(product.variations)}
                                                >
                                                    Xem thuộc tính ({product.variations.length})
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">Không có</span>
                                            )}
                                        </td>
                                        <td className=" px-4  justify-center items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedProduct(product.id)}
                                                className=" text-[#2563eb] transition"
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className=" text-[#2563eb] rounded-md hover:text-blue-700 transition"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-[#2563eb] text-xl font-semibold mt-6">Chưa có sản phẩm nào</p>
                )}
            </div>

            {/* Popup Hiển thị thuộc tính */}
            {selectedVariations && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">Danh sách thuộc tính</h2>
                        {selectedVariations.map((v, i) => (
                            <>
                                <div key={i} className="pb-2 mb-2 flex gap-4">
                                    <img
                                        src={getImageUrl(v.images[0]?.image_path)}
                                        alt="Variation"
                                        className="w-16 h-16 object-cover rounded-md border mb-2"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                        }}
                                    />
                                    <div>
                                        <p>SKU: {v.sku}</p>
                                        <p>Giá: {formatPrice(v.price)}</p>
                                        <p>Giảm giá: {formatPrice(v.discount_price)}</p>
                                        <p>Số lượng: {v.stock_quantity}</p>

                                    </div>
                                </div>
                                <div>
                                    <strong>Thuộc tính:</strong> <br />
                                    <div className="grid grid-cols-3 my-2">
                                        {v.attributes.map(attr => (
                                            <div className="col-span-1">

                                                <span key={attr.id} className="bg-gray-100  rounded-md text-sm py-2 px-2">
                                                    {attr.attribute_value.attribute_type.display_name}: {attr.attribute_value.display_value}
                                                </span>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                                <div className="border-b my-2 border-[#2563eb] mt-4"></div>
                            </>
                        ))}
                        <div className="flex justify-end">
                            <button onClick={() => setSelectedVariations(null)} className="bg-[#2563eb] flex justify-end hover:bg-red-700 text-white px-4 py-2 rounded-md">
                                Đóng
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {isAdding && <AddProduct onClose={() => setIsAdding(false)} onSuccess={fetchProducts} />}
            {selectedProduct && <EditProduct productId={selectedProduct} onClose={() => setSelectedProduct(null)} onSuccess={fetchProducts} />}
        </>
    );
}

export default ManageProduct;
