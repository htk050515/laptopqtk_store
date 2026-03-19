import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import CardProduct from "../../../components/CardProduct/CardProduct";
import productApi from '../../../api/AdminApi/ProductApi/productApi';
import path from '../../../constants/path';

function ProductByCategory() {
    console.log("1231231"); // Debug log
    const { categoryId } = useParams(); // Get the category ID from the URL
    console.log('Category ID from URL:', categoryId); // Debug log
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productApi.getProductByCategory(categoryId);
                console.log('API Response:', response); // Debug log
                if (response.status === 200) {
                    setProducts(response.data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <Header />
            <Navbar />
            <div className="container mx-auto my-10">
                <nav className="text-sm flex items-center gap-2">
                    <Link to={path.home} className="hover:text-[#2563eb]">Trang chủ</Link>
                    <span>&gt;</span>
                    <Link to={`/category/${categoryId}`} className="hover:text-[#2563eb]">{categoryId}</Link>
                    {/* <span>{product?.name}</span> */}
                </nav>
            </div>
            <div className="container mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => (
                        <CardProduct key={product.id} product={product} />
                    ))}
                </div>

            </div>
        </>
    );
}

export default ProductByCategory;