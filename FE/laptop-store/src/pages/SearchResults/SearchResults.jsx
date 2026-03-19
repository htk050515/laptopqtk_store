import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import path from '../../constants/path';
import productApi from '../../api/AdminApi/ProductApi/productApi';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';

function SearchResults() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    const BASE_URL = "http://localhost:8000/storage/";

    // Helper function to get image URL - supports both CDN and local storage
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300x300?text=No+Image';
        
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

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const response = await productApi.searchProducts({
                    search: searchQuery,
                    page: 1,
                    limit: 20
                });
                if (response && response.data) {
                    setProducts(response.data);
                    setError(null);
                } else {
                    setError('Không tìm thấy kết quả.');
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
                setError('Đã xảy ra lỗi khi tìm kiếm sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery) {
            fetchSearchResults();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [searchQuery]);

    // Format price with Vietnamese currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Get default or first variation image
    const getProductImage = (product) => {
        console.log("product", product)
        // Try to get default variation image first
        const defaultVariation = product.variations.find(v => v.is_default === 1);

        if (defaultVariation && defaultVariation.images && defaultVariation.images.length > 0) {
            return defaultVariation.images[0].image_path;
        }

        // If no default variation image, try first variation image
        if (product.variations && product.variations.length > 0 &&
            product.variations[0].images && product.variations[0].images.length > 0) {
            return product.variations[0].images[0].image_path;
        }

        // If no variation images, try product image
        if (product.images && product.images.length > 0) {
            return product.images[0].image_path;
        }

        // Fallback to placeholder
        return 'placeholder.jpg';
    };

    // Get best price (lowest discount_price or price)
    const getBestPrice = (product) => {
        if (!product.variations || product.variations.length === 0) {
            return product.base_price;
        }

        let bestPrice = Infinity;
        let originalPrice = 0;

        product.variations.forEach(variation => {
            const currentPrice = parseFloat(variation.discount_price) > 0 ?
                parseFloat(variation.discount_price) :
                parseFloat(variation.price);

            if (currentPrice < bestPrice) {
                bestPrice = currentPrice;
                originalPrice = parseFloat(variation.price);
            }
        });

        return {
            best: bestPrice,
            original: originalPrice,
            hasDiscount: bestPrice < originalPrice
        };
    };

    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold mb-6 text-[#2563eb]">
                    {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Tìm kiếm sản phẩm'}
                </h1>

                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-[#2563eb] text-lg">Đang tìm kiếm sản phẩm...</p>
                        <div className="mt-4 flex justify-center space-x-2">
                            <div className="w-3 h-3 bg-[#f48ea1] rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-[#f48ea1] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-[#f48ea1] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-8">
                        {error}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchQuery}".</p>
                        <p className="mt-2">Vui lòng thử lại với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => {
                            const priceInfo = getBestPrice(product);
                            const imageUrl = getProductImage(product);

                            return (
                                <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <Link to={`/products/${product.id}`} className="block">
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={getImageUrl(imageUrl)}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2 h-14">{product.name}</h3>
                                            <div className="flex items-baseline gap-2">
                                                {typeof priceInfo === 'object' ? (
                                                    <>
                                                        <span className="text-[#f48ea1] font-bold">{formatPrice(priceInfo.best)}</span>
                                                        {priceInfo.hasDiscount && (
                                                            <span className="text-gray-500 text-sm line-through">{formatPrice(priceInfo.original)}</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-[#f48ea1] font-bold">{formatPrice(priceInfo)}</span>
                                                )}
                                            </div>
                                            <div className="mt-3 flex justify-between items-center">
                                                <Link
                                                    to={`${path.product}/${product.slug}`}
                                                    className="text-sm text-[#2563eb] hover:underline"
                                                >
                                                    Xem chi tiết
                                                </Link>
                                                <button
                                                    className="p-2 rounded-full bg-[#f48ea1] text-white hover:bg-[#e47a90] transition-colors"
                                                    title="Thêm vào giỏ hàng"
                                                >
                                                    <FontAwesomeIcon icon={faCartPlus} />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default SearchResults;