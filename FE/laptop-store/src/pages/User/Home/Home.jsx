// Home.jsx
import React, { useState, useEffect } from "react";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import Banner from "./Banner/Banner";
import BannerProducts from "./BannerProducts/BannerProducts";
import ListProduct from "./ListProduct.jsx/ListProduct";
import ServiceShop from "./ServiceShop/ServiceShop";
import ComboTeddy from "./ComboTeddy/ComboTeddy";
import FeaturedProducts from "./FeaturedProducts/FeaturedProducts";
import Footer from "../../../components/Footer/Footer";
import BackToTopButton from "../../../components/BackToTopButton/BackToTopButton";
import categoryApi from "../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../api/AdminApi/ProductApi/productApi";

function Home() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const techStories = [
        {
            id: "ultrabook-2025",
            title: "Laptop ultrabook mỏng nhẹ cho dân văn phòng 2025",
            summary: "Thiết kế siêu mỏng dưới 1.2kg, pin trên 12 tiếng, màn hình 2.8K OLED cho trải nghiệm làm việc di động hoàn hảo.",
            imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=640&q=80",
            alt: "Ultrabook laptop for office work",
        },
        {
            id: "gaming-laptop",
            title: "Laptop gaming hiệu năng cao RTX 40 Series",
            summary: "Card đồ họa RTX 4070/4080, màn hình 165Hz, hệ thống tản nhiệt tiên tiến cho trải nghiệm chơi game mượt mà.",
            imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=640&q=80",
            alt: "Gaming laptop with RGB keyboard",
        },
        {
            id: "workstation",
            title: "Laptop workstation cho đồ họa & lập trình",
            summary: "CPU đa nhân mạnh mẽ, RAM 32GB+, màn hình chuẩn màu 100% sRGB phục vụ thiết kế và phát triển phần mềm.",
            imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=640&q=80",
            alt: "Workstation laptop for design and coding",
        },
        {
            id: "accessories",
            title: "Linh kiện & phụ kiện nâng cấp laptop",
            summary: "RAM, SSD, bàn phím cơ, chuột gaming, đế tản nhiệt và các phụ kiện giúp nâng cấp hiệu năng laptop.",
            imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=640&q=80",
            alt: "Laptop accessories and components",
        },
    ];

    useEffect(() => {
        fetchCategories();
        fetchFeatured();
    }, []);

    useEffect(() => {
        if (categories.length > 0) fetchAllProductsByCategory();
    }, [categories]);

    const fetchCategories = async () => {
        try {
            const res = await categoryApi.getListCategories();
            if (res.status === 200 && Array.isArray(res.data)) setCategories(res.data);
        } catch {
            setErrorMessage("Không thể tải danh mục sản phẩm");
        }
    };

    const fetchFeatured = async () => {
        try {
            const res = await productApi.getListProducts();
            if (res.status === 200 && Array.isArray(res.data))
                setFeaturedProducts(res.data.filter(p => p.featured));
        } catch {
            console.error("Lỗi tải sản phẩm nổi bật");
        }
    };

    const fetchAllProductsByCategory = async () => {
        setIsLoading(true);
        const map = {};
        try {
            for (const cat of categories) {
                const res = await productApi.searchProducts({ category_id: cat.id });
                if (res.status === 200 && Array.isArray(res.data)) map[cat.id] = res.data;
            }
            setProductsByCategory(map);
        } catch {
            setErrorMessage("Không thể tải sản phẩm");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Navbar />

            {/* 1. BANNER CHÍNH */}
            <Banner />

            {/* 2. LỌC THƯƠNG HIỆU + ƯU ĐÃI — đẩy lên đầu */}
            <BannerProducts />

            {/* 3. SẢN PHẨM NỔI BẬT */}
            <FeaturedProducts products={featuredProducts} isLoading={isLoading} />

            {/* 4. DANH SÁCH SẢN PHẨM THEO DANH MỤC */}
            <ListProduct
                categories={categories}
                productsByCategory={productsByCategory}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />

            {/* 5. DỊCH VỤ */}
            <ServiceShop />

            {/* 6. TIN CÔNG NGHỆ */}
            <section id="tech-stories">
                <div className="container mx-auto mt-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-8 bg-[#2563eb] rounded-full"></div>
                        <div className="text-2xl font-black text-[#2563eb]">Tin công nghệ nổi bật</div>
                    </div>
                    <div className="border-b-2 border-[#2563eb] my-5"></div>
                    <div className="mt-3 grid grid-cols-2 gap-6">
                        {techStories.map((story) => (
                            <article key={story.id} className="grid grid-cols-6 gap-4">
                                <img
                                    className="col-span-2 w-full h-auto rounded-lg object-cover"
                                    src={story.imageUrl}
                                    alt={story.alt}
                                    loading="lazy"
                                />
                                <div className="col-span-4 text-sm">
                                    <h3 className="uppercase font-semibold tracking-wide hover:text-[#2563eb] cursor-pointer">
                                        {story.title}
                                    </h3>
                                    <p className="mt-2 text-[#555] line-clamp-3">{story.summary}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                        <button className="uppercase flex items-center text-sm font-bold px-8 py-2 bg-[#2563eb] rounded-lg text-white hover:bg-[#1d4ed8] transition-colors">
                            Xem thêm
                        </button>
                    </div>
                </div>
            </section>

            {/* 7. COMBO */}
            <section id="combo">
                <ComboTeddy />
            </section>

            <ServiceShop />
            <Footer />
            <BackToTopButton />
        </>
    );
}

export default Home;