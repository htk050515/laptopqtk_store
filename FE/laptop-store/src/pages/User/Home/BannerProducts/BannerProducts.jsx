import React from 'react';
import { Link } from 'react-router-dom';

const brands = [
    { name: "Dell", slug: "dell" },
    { name: "HP", slug: "hp" },
    { name: "Lenovo", slug: "lenovo" },
    { name: "ASUS", slug: "asus" },
    { name: "Acer", slug: "acer" },
    { name: "Apple", slug: "apple" },
    { name: "MSI", slug: "msi" },
    { name: "LG", slug: "lg" },
    { name: "Samsung", slug: "samsung" },
    { name: "Gigabyte", slug: "gigabyte" },
    { name: "Intel", slug: "intel" },
    { name: "AMD", slug: "amd" }
];

const promotions = [
    {
        id: "installment",
        title: "Trả góp 0% lãi suất",
        desc: "Qua thẻ tín dụng, duyệt nhanh trong 5 phút",
        cta: "Xem chi tiết",
        href: "/promotions/installment",
        image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&auto=format&fit=crop&w=1200&h=800&fm=webp",
        badge: "-0% APR"
    },
    {
        id: "student",
        title: "Ưu đãi sinh viên -5%",
        desc: "Giảm thêm cho email .edu hoặc thẻ SV hợp lệ",
        cta: "Nhận ưu đãi",
        href: "/promotions/student",
        image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&auto=format&fit=crop&w=1200&h=800&fm=webp",
        badge: "-5%"
    },
    {
        id: "tradein",
        title: "Thu cũ đổi mới",
        desc: "Đổi laptop cũ lấy máy mới, hỗ trợ định giá nhanh",
        cta: "Định giá ngay",
        href: "/promotions/trade-in",
        image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&auto=format&fit=crop&w=1200&h=800&fm=webp",
        badge: "Trade-in"
    },
    {
        id: "bundle",
        title: "Combo phụ kiện -20%",
        desc: "Chuột, bàn phím, tai nghe, balo khi mua kèm laptop",
        cta: "Mua kèm rẻ hơn",
        href: "/promotions/bundle",
        image: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?q=80&auto=format&fit=crop&w=1200&h=800&fm=webp",
        badge: "-20%"
    },
    {
        id: "warranty",
        title: "Tặng bảo hành 24 tháng",
        desc: "Áp dụng model chọn lọc, 1 đổi 1 trong 30 ngày",
        cta: "Điều kiện áp dụng",
        href: "/promotions/warranty",
        image: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?q=80&auto=format&fit=crop&w=1200&h=800&fm=webp",
        badge: "24M"
    },
    {
        id: "shipping",
        title: "Freeship toàn quốc",
        desc: "Đơn từ 5 triệu, giao nhanh 2h nội thành",
        cta: "Kiểm tra khu vực",
        href: "/promotions/free-ship",
        image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&auto=format&fit=crop&w=1200&h=800&fm=webp",
        badge: "Free"
    }
];

function BannerProducts() {
    return (
        <div className="container mx-auto mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {brands.map((brand) => (
                    <Link
                        key={brand.slug}
                        to={`/search?q=${encodeURIComponent(brand.name)}`}
                        className="group"
                    >
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:shadow-md hover:-translate-y-0.5">
                            <img
                                src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${brand.slug}.svg`}
                                alt={`${brand.name} logo`}
                                className="h-6 w-6 object-contain"
                                style={{ filter: 'invert(11%) sepia(93%) saturate(6083%) hue-rotate(350deg) brightness(84%) contrast(116%)' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="font-semibold text-gray-800 group-hover:text-[#2563eb]">{brand.name}</div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Ưu đãi hấp dẫn</h2>
                    <Link to="/promotions" className="text-sm font-medium text-[#2563eb] hover:underline">Xem tất cả</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                    {promotions.map((p) => (
                        <Link
                            key={p.id}
                            to={p.href}
                            className="group relative overflow-hidden rounded-xl"
                            aria-label={p.title}
                        >
                            <img
                                src={p.image}
                                alt={p.title}
                                className="h-32 sm:h-40 lg:h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-md bg-[#fee2e2]/90 px-2 py-0.5 text-xs font-semibold text-[#b91c1c]">
                                        {p.badge}
                                    </span>
                                    <h3 className="text-sm sm:text-base font-semibold text-white drop-shadow">
                                        {p.title}
                                    </h3>
                                </div>
                                <p className="mt-1 hidden text-xs text-gray-100/90 sm:block">{p.desc}</p>
                                <span className="mt-2 inline-flex items-center text-xs font-medium text-[#ffd5db] sm:text-sm">
                                    {p.cta}
                                    <svg
                                        className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BannerProducts;