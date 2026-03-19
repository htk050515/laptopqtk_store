

// Home.jsx
import React, { useState, useEffect } from "react";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import Banner from "./Banner/Banner";
import BannerProducts from "./BannerProducts/BannerProducts";
import ListProduct from "./ListProduct.jsx/ListProduct";
import ServiceShop from "./ServiceShop/ServiceShop";
import ComboTeddy from "./ComboTeddy/ComboTeddy";
import Footer from "../../../components/Footer/Footer";
import BackToTopButton from "../../../components/BackToTopButton/BackToTopButton";
import categoryApi from "../../../api/AdminApi/CategoryApi/categoryApi";
import productApi from "../../../api/AdminApi/ProductApi/productApi";

function Home() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
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
            summary: "Card đồ họa RTX 4070/4080, màn hình 165Hz, hệ thống tản nhiệt tiên tiến cho trải nghiệm chơi game mượt mà ở mọi tựa game.",
            imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=640&q=80",
            alt: "Gaming laptop with RGB keyboard",
        },
        {
            id: "workstation",
            title: "Laptop workstation cho đồ họa & lập trình",
            summary: "CPU đa nhân mạnh mẽ, RAM 32GB+, màn hình chuẩn màu 100% sRGB phục vụ thiết kế, dựng video và phát triển phần mềm chuyên nghiệp.",
            imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=640&q=80",
            alt: "Workstation laptop for design and coding",
        },
        {
            id: "accessories",
            title: "Linh kiện & phụ kiện nâng cấp laptop",
            summary: "RAM, SSD, bàn phím cơ, chuột gaming, đế tản nhiệt và các phụ kiện giúp nâng cấp hiệu năng và trải nghiệm sử dụng laptop.",
            imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=640&q=80",
            alt: "Laptop accessories and components",
        },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            fetchAllProductsByCategory();
        }
    }, [categories]);

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getListCategories();
            console.log("📢 Fetched Categories:", response);

            if (response.status === 200 && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("❌ Lỗi tải danh mục:", error);
            setErrorMessage("Không thể tải danh mục sản phẩm");
        }
    };

    const fetchAllProductsByCategory = async () => {
        setIsLoading(true);
        const productMap = {};

        try {
            // Fetch products for each category
            for (const category of categories) {
                const response = await productApi.searchProducts({ category_id: category.id });

                if (response.status === 200 && Array.isArray(response.data)) {
                    productMap[category.id] = response.data;
                }
            }

            setProductsByCategory(productMap);
        } catch (error) {
            console.error("❌ Lỗi tải sản phẩm:", error);
            setErrorMessage("Không thể tải sản phẩm");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Navbar />
            <Banner />
            <ListProduct
                categories={categories}
                productsByCategory={productsByCategory}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />
            <ServiceShop />
            <BannerProducts />
            <section id="tech-stories">
                <div className="container mx-auto mt-10">
                    <div className="text-center text-2xl font-black text-[#2563eb]">Tin công nghệ nổi bật</div>
                    <div className="border-b-2 border-[#2563eb] my-5"></div>
                    <div className="mt-3 grid grid-cols-2 gap-6">
                        {techStories.map((story) => (
                            <article key={story.id} className="grid grid-cols-6 gap-4">
                                <img
                                    className="col-span-2 w-full h-auto rounded-lg object-cover"
                                    src={story.imageUrl}
                                    alt={story.alt}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="col-span-4 text-sm">
                                    <h3 className="uppercase font-semibold tracking-wide hover:text-[#2563eb]">
                                        {story.title}
                                    </h3>
                                    <p className="mt-2 text-[#555] line-clamp-3">{story.summary}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                        <button className="uppercase flex items-center text-sm font-bold px-8 py-2 bg-[#2563eb] rounded-lg text-white transition-colors duration-300 hover:bg-[#1d4ed8] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb]">
                            <span>Xem thêm</span>
                        </button>
                    </div>
                </div>
            </section>
            <section id="combo-dien-thoai">
                <ComboTeddy />
            </section>

            <ServiceShop />

            <Footer />
            <BackToTopButton />
        </>
    );
}

export default Home;