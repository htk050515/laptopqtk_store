import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Import SweetAlert

import Header from '../../../components/Header/Header';
import Navbar from '../../../components/Navbar/Navbar';
import QuantitySelector from './QualitySelctor/QualitySelector';
import ServiceShop from '../Home/ServiceShop/ServiceShop';
import ListProduct from '../Home/ListProduct.jsx/ListProduct';
import Footer from '../../../components/Footer/Footer';
import productApi from '../../../api/AdminApi/ProductApi/productApi';
import userApi from '../../../api/UserApi/userApi';
import Breadcrumb from './Breadcrumb';
import ProductImageGallery from './ProductImageGallery/ProductImageGallery ';
import ProductRating from './ProductRating';
import VariationsTable from './VariationsTable';
import AttributeSelector from './AttributeSelector';
import StoreLocations from './StoreLocations';
import ProductTabs from './ProductTabs';
import ProductFeatures from './ProductFeatures';
import { getAccessTokenFromLS } from '../../../utils/auth';
import { formatPrice } from '../../../utils/utils';

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const { productId } = useParams();

    // Get access token from localStorage
    const getAccessToken = () => {
        return getAccessTokenFromLS();
    };

    useEffect(() => {
        fetchProductById();
    }, [productId]);

    const fetchProductById = async () => {
        try {
            setLoading(true);
            const response = await productApi.getProductById(productId);
            setProduct(response.data);

            // Extract all available attribute types from variations
            const attributeTypes = {};
            if (response.data.variations && response.data.variations.length > 0) {
                response.data.variations.forEach(variation => {
                    variation.attributes.forEach(attr => {
                        const typeName = attr.attribute_value.attribute_type.display_name || attr.attribute_value.attribute_type.name;
                        if (!attributeTypes[typeName]) {
                            attributeTypes[typeName] = [];
                        }

                        // Add attribute value if not already in the list
                        const value = attr.attribute_value.display_value;
                        if (!attributeTypes[typeName].includes(value)) {
                            attributeTypes[typeName].push(value);
                        }
                    });
                });
            }

            // Initialize selectedAttributes with the first value of each attribute type
            const initialSelectedAttributes = {};
            Object.keys(attributeTypes).forEach(type => {
                initialSelectedAttributes[type] = attributeTypes[type][0];
            });
            setSelectedAttributes(initialSelectedAttributes);

            // Find the matching variation based on initial selected attributes
            const matchingVariation = findMatchingVariation(response.data.variations, initialSelectedAttributes);
            if (matchingVariation) {
                setSelectedVariation(matchingVariation);
            } else if (response.data.variations && response.data.variations.length > 0) {
                // Fallback to first variation if no match
                setSelectedVariation(response.data.variations[0]);
            }
        } catch (error) {
            console.error("❌ Lỗi tải sản phẩm:", error);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể tải thông tin sản phẩm.',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setLoading(false);
        }
    };

    // Find a variation that matches all selected attributes
    const findMatchingVariation = (variations, selectedAttrs) => {
        if (!variations) return null;

        return variations.find(variation => {
            // Check if all selected attributes match this variation
            return Object.keys(selectedAttrs).every(attrType => {
                const attrValue = selectedAttrs[attrType];
                return variation.attributes.some(attr =>
                    attr.attribute_value.attribute_type.display_name || attr.attribute_value.attribute_type.name === attrType &&
                    attr.attribute_value.display_value === attrValue
                );
            });
        });
    };

    // Handle attribute selection
    const handleAttributeSelect = (attributeType, value) => {
        const newSelectedAttributes = { ...selectedAttributes, [attributeType]: value };
        setSelectedAttributes(newSelectedAttributes);

        // Find matching variation based on updated attributes
        const matchingVariation = findMatchingVariation(product.variations, newSelectedAttributes);
        if (matchingVariation) {
            setSelectedVariation(matchingVariation);
        }
    };

    const handleAddToCart = async () => {
        try {
            // Get access token
            const access_token = getAccessToken();

            // Check if user is logged in
            if (!access_token) {
                Swal.fire({
                    title: 'Thông báo',
                    text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                    icon: 'info',
                    confirmButtonColor: '#2563eb'
                });
                return;
            }

            if (!selectedVariation) {
                Swal.fire({
                    title: 'Thông báo',
                    text: 'Vui lòng chọn phiên bản sản phẩm',
                    icon: 'warning',
                    confirmButtonColor: '#2563eb'
                });
                return;
            }

            // Show loading state
            Swal.fire({
                title: 'Đang xử lý...',
                text: 'Vui lòng đợi trong giây lát',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Pass access_token to the addToCart function
            const response = await userApi.addToCart(access_token, {
                product_variation_id: selectedVariation.id,
                quantity: quantity
            });

            // Dispatch event to notify Header component about cart update
            window.dispatchEvent(new CustomEvent('cart-updated'));

            // Close loading and show success
            Swal.fire({
                title: 'Thành công!',
                text: 'Đã thêm sản phẩm vào giỏ hàng',
                icon: 'success',
                confirmButtonColor: '#2563eb'
            });

            console.log('Thêm vào giỏ hàng thành công:', response.data);
        } catch (error) {
            Swal.fire({
                title: 'Lỗi!',
                text: "Không thể thêm vào giỏ hàng: " + (error.response?.data?.message || "Đã xảy ra lỗi"),
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl">Đang tải...</p>
            </div>
        );
    }

    // Get all available attribute types and their values
    const getAttributeOptions = () => {
        if (!product || !product.variations) return {};

        const attributeOptions = {};

        product.variations.forEach(variation => {
            variation.attributes.forEach(attr => {
                const typeName = attr.attribute_value.attribute_type.display_name || attr.attribute_value.attribute_type.name;
                const value = attr.attribute_value.display_value;

                if (!attributeOptions[typeName]) {
                    attributeOptions[typeName] = [];
                }

                if (!attributeOptions[typeName].includes(value)) {
                    attributeOptions[typeName].push(value);
                }
            });
        });

        return attributeOptions;
    };

    const attributeOptions = getAttributeOptions();

    // Get relevant images for the current variation
    const getProductImages = () => {
        if (!product) return [];

        // Start with main product images
        const mainImages = product.images?.map(img => img.image_path) || [];

        // Add specific variation images if a variation is selected
        const variationImages = selectedVariation?.images?.map(img => img.image_path) || [];

        // Combine and remove duplicates
        const allImages = [...mainImages, ...variationImages];
        return allImages.filter((img, index) => allImages.indexOf(img) === index);
    };

    const productImages = getProductImages();

    // Create variation table data
    const getVariationTableData = () => {
        if (!product || !product.variations) return [];

        return product.variations.map(variation => {
            const attributes = variation.attributes.reduce((acc, attr) => {
                acc[attr.attribute_value.attribute_type.display_name || attr.attribute_value.attribute_type.name] = attr.attribute_value.display_value;
                return acc;
            }, {});

            return {
                variation,
                attributes,
                price: parseFloat(variation.price),
                discount_price: parseFloat(variation.discount_price || 0),
                stock: variation.stock_quantity
            };
        });
    };

    const variationTableData = getVariationTableData();

    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto mt-4">
                <Breadcrumb product={product} />
            </div>
            <ServiceShop />
            <div className="container mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProductImageGallery
                    images={productImages.length > 0 ? productImages : ['/api/placeholder/400/300']}
                />
                <div className="space-y-4">
                    {/* Product name */}
                    <div>
                        <h1 className="font-bold text-2xl md:text-3xl text-gray-800 leading-tight">{product?.name}</h1>
                        <ProductRating />
                    </div>

                    {/* Price display - Cải thiện hiển thị giá */}
                    {selectedVariation && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {selectedVariation.discount_price && selectedVariation.discount_price < selectedVariation.price ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-3xl text-[#2563eb]">
                                            {formatPrice((selectedVariation.discount_price || 0) * quantity)}
                                        </span>
                                        {selectedVariation.discount_price < selectedVariation.price && (
                                            <span className="bg-[#2563eb] text-white text-xs font-bold px-2 py-1 rounded-full">
                                                -{Math.round((1 - selectedVariation.discount_price / selectedVariation.price) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 line-through text-lg">
                                            {formatPrice((selectedVariation.price || 0) * quantity)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="font-bold text-3xl text-[#2563eb]">
                                    {formatPrice((selectedVariation.price || 0) * quantity)}
                                </div>
                            )}
                            {selectedVariation.stock_quantity > 0 ? (
                                <div className="mt-2 text-sm text-green-600 font-medium">
                                    ✓ Còn hàng ({selectedVariation.stock_quantity} sản phẩm)
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-red-600 font-medium">
                                    ✗ Hết hàng
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attribute selector */}
                    <div className="border-t border-b border-gray-200 py-4">
                        <AttributeSelector
                            attributeOptions={attributeOptions}
                            selectedAttributes={selectedAttributes}
                            onAttributeSelect={handleAttributeSelect}
                        />
                    </div>

                    {/* Variations Table - Compact */}
                    <div className="bg-white">
                        <VariationsTable
                            attributeOptions={attributeOptions}
                            variationTableData={variationTableData}
                            formatPrice={formatPrice}
                        />
                    </div>

                    {/* Quantity selector */}
                    <div className='flex gap-4 items-center py-3 border-t border-b border-gray-200'>
                        <span className="font-semibold text-gray-700 min-w-[100px]">Số lượng:</span>
                        <QuantitySelector
                            quantity={quantity}
                            onIncrease={() => setQuantity(prev => prev + 1)}
                            onDecrease={() => setQuantity(prev => Math.max(1, prev - 1))}
                            max={selectedVariation?.stock_quantity || 0}
                        />
                    </div>

                    {/* Add to cart button */}
                    <button
                        onClick={handleAddToCart}
                        className="uppercase font-semibold text-white bg-[#2563eb] py-4 w-full text-center transition-all duration-300 hover:bg-[#1d4ed8] flex items-center justify-center gap-2 rounded-lg shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!selectedVariation || selectedVariation.stock_quantity <= 0}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} /> Thêm vào giỏ hàng
                    </button>

                    {/* Product Features */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <ProductFeatures />
                    </div>

                    {/* Store Locations */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <StoreLocations />
                    </div>
                </div>
            </div>

            <ProductTabs
                product={product}
                selectedVariation={selectedVariation}
                variationTableData={variationTableData}
                formatPrice={formatPrice}
            />

            {/* Related products and services */}
            <div className="container mx-auto mt-4">
                <div>
                    <ListProduct />
                </div>
                <div className='my-8'>
                    <ServiceShop />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductDetail;