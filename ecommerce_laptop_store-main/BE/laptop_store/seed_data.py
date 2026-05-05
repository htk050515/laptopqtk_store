"""
Script nạp data mẫu laptop thực tế vào database LaptopQTK
Chạy: python seed_data.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'laptop_store.settings')
django.setup()

from apps.catalog.models import Category, Product, ProductVariation, AttributeType, AttributeValue, VariationAttribute

print("🚀 Bắt đầu nạp data...")

# ============================================================
# 1. TẠO DANH MỤC
# ============================================================
categories_data = [
    {"name": "Laptop Gaming",       "slug": "laptop-gaming"},
    {"name": "Laptop Văn Phòng",    "slug": "laptop-van-phong"},
    {"name": "Laptop Đồ Họa",       "slug": "laptop-do-hoa"},
    {"name": "Laptop Mỏng Nhẹ",     "slug": "laptop-mong-nhe"},
    {"name": "MacBook",             "slug": "macbook"},
]

categories = {}
for c in categories_data:
    obj, created = Category.objects.get_or_create(
        slug=c["slug"],
        defaults={"name": c["name"]}
    )
    categories[c["slug"]] = obj
    print(f"  {'✅ Tạo' if created else '⚠️  Đã có'} danh mục: {c['name']}")

# ============================================================
# 2. TẠO ATTRIBUTE TYPES & VALUES
# ============================================================
attr_data = {
    "RAM": ["8GB", "16GB", "32GB", "64GB"],
    "Ổ cứng": ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
    "Màn hình": ['13.3"', '14"', '15.6"', '16"', '17.3"'],
    "CPU": ["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M2", "Apple M3", "Apple M3 Pro"],
    "Card đồ họa": ["Intel Iris Xe", "NVIDIA RTX 3050", "NVIDIA RTX 3060", "NVIDIA RTX 4060", "NVIDIA RTX 4070", "NVIDIA RTX 4080", "AMD Radeon", "Apple GPU"],
}

attr_types = {}
attr_values = {}
for attr_name, values in attr_data.items():
    atype, _ = AttributeType.objects.get_or_create(
        name=attr_name,
        defaults={"display_name": attr_name}
    )
    attr_types[attr_name] = atype
    attr_values[attr_name] = {}
    for val in values:
        aval, _ = AttributeValue.objects.get_or_create(
            attribute_type=atype,
            value=val,
            defaults={"display_value": val}
        )
        attr_values[attr_name][val] = aval

print(f"  ✅ Đã tạo {len(attr_data)} loại thuộc tính")

# ============================================================
# 3. DATA SẢN PHẨM
# ============================================================
products_data = [
    # ===== GAMING =====
    {
        "name": "ASUS ROG Strix G16 G614JV",
        "slug": "asus-rog-strix-g16-g614jv",
        "category": "laptop-gaming",
        "base_price": 28990000,
        "featured": True,
        "description": "Laptop gaming hiệu năng cao với CPU Intel Core i7-13650HX và GPU NVIDIA RTX 4060. Màn hình 16\" 165Hz cho trải nghiệm chơi game mượt mà. Hệ thống tản nhiệt ROG thế hệ mới đảm bảo hiệu năng ổn định.",
        "variations": [
            {"sku": "ROG-G614-16-512", "price": 28990000, "stock": 10, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i7", "Card đồ họa": "NVIDIA RTX 4060", "Màn hình": '16"'}},
            {"sku": "ROG-G614-32-1TB", "price": 33990000, "stock": 5, "is_default": False,
             "attrs": {"RAM": "32GB", "Ổ cứng": "1TB SSD", "CPU": "Intel Core i7", "Card đồ họa": "NVIDIA RTX 4060", "Màn hình": '16"'}},
        ]
    },
    {
        "name": "MSI Cyborg 15 B13VF",
        "slug": "msi-cyborg-15-b13vf",
        "category": "laptop-gaming",
        "base_price": 22490000,
        "featured": True,
        "description": "Laptop gaming tầm trung với thiết kế trong suốt độc đáo. Trang bị RTX 4060 và màn hình 144Hz, đây là lựa chọn tuyệt vời cho game thủ ngân sách vừa phải.",
        "variations": [
            {"sku": "MSI-CYB15-16-512", "price": 22490000, "stock": 8, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i7", "Card đồ họa": "NVIDIA RTX 4060", "Màn hình": '15.6"'}},
        ]
    },
    {
        "name": "Lenovo LOQ 15IRX9",
        "slug": "lenovo-loq-15irx9",
        "category": "laptop-gaming",
        "base_price": 19990000,
        "featured": False,
        "description": "Laptop gaming entry-level từ Lenovo với GPU RTX 3050, phù hợp cho game thủ mới bắt đầu. Thiết kế chắc chắn, bàn phím RGB, tản nhiệt tốt.",
        "variations": [
            {"sku": "LOQ-15-8-512", "price": 19990000, "stock": 12, "is_default": True,
             "attrs": {"RAM": "8GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i5", "Card đồ họa": "NVIDIA RTX 3050", "Màn hình": '15.6"'}},
            {"sku": "LOQ-15-16-512", "price": 22490000, "stock": 6, "is_default": False,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i5", "Card đồ họa": "NVIDIA RTX 3050", "Màn hình": '15.6"'}},
        ]
    },
    {
        "name": "ASUS TUF Gaming F15 FX507VU",
        "slug": "asus-tuf-gaming-f15-fx507vu",
        "category": "laptop-gaming",
        "base_price": 24990000,
        "featured": True,
        "description": "Laptop gaming bền bỉ chuẩn MIL-STD-810H với RTX 4050, màn hình 144Hz. Thiết kế tản nhiệt Anti-Dust giúp máy hoạt động bền bỉ theo năm tháng.",
        "variations": [
            {"sku": "TUF-F15-16-512", "price": 24990000, "stock": 7, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i7", "Card đồ họa": "NVIDIA RTX 3060", "Màn hình": '15.6"'}},
        ]
    },
    {
        "name": "Acer Predator Helios 16 PH16-71",
        "slug": "acer-predator-helios-16-ph16-71",
        "category": "laptop-gaming",
        "base_price": 45990000,
        "featured": False,
        "description": "Laptop gaming cao cấp với RTX 4080 và màn hình Mini-LED 240Hz. Hiệu năng đỉnh cao cho những tựa game nặng nhất. Hệ thống tản nhiệt AerBlade 5th Gen.",
        "variations": [
            {"sku": "PRED-H16-32-1TB", "price": 45990000, "stock": 3, "is_default": True,
             "attrs": {"RAM": "32GB", "Ổ cứng": "1TB SSD", "CPU": "Intel Core i9", "Card đồ họa": "NVIDIA RTX 4080", "Màn hình": '16"'}},
        ]
    },

    # ===== VĂN PHÒNG =====
    {
        "name": "Dell Inspiron 15 3530",
        "slug": "dell-inspiron-15-3530",
        "category": "laptop-van-phong",
        "base_price": 14990000,
        "featured": True,
        "description": "Laptop văn phòng phổ thông với thiết kế đơn giản, bền bỉ. Hiệu năng đủ dùng cho công việc văn phòng, học tập. Pin 54Wh dùng cả ngày.",
        "variations": [
            {"sku": "DELL-INS15-8-256", "price": 14990000, "stock": 15, "is_default": True,
             "attrs": {"RAM": "8GB", "Ổ cứng": "256GB SSD", "CPU": "Intel Core i5", "Card đồ họa": "Intel Iris Xe", "Màn hình": '15.6"'}},
            {"sku": "DELL-INS15-16-512", "price": 17990000, "stock": 8, "is_default": False,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i5", "Card đồ họa": "Intel Iris Xe", "Màn hình": '15.6"'}},
        ]
    },
    {
        "name": "HP 240 G10",
        "slug": "hp-240-g10",
        "category": "laptop-van-phong",
        "base_price": 12490000,
        "featured": False,
        "description": "Laptop văn phòng giá rẻ, hiệu năng tốt cho công việc cơ bản. Thiết kế gọn nhẹ, dễ mang theo. Lý tưởng cho sinh viên và nhân viên văn phòng.",
        "variations": [
            {"sku": "HP-240G10-8-256", "price": 12490000, "stock": 20, "is_default": True,
             "attrs": {"RAM": "8GB", "Ổ cứng": "256GB SSD", "CPU": "Intel Core i5", "Card đồ họa": "Intel Iris Xe", "Màn hình": '14"'}},
        ]
    },
    {
        "name": "Lenovo ThinkPad E14 Gen 5",
        "slug": "lenovo-thinkpad-e14-gen5",
        "category": "laptop-van-phong",
        "base_price": 19490000,
        "featured": True,
        "description": "Laptop doanh nhân cao cấp với bàn phím ThinkPad huyền thoại. Bảo mật vân tay, webcam IR, chuẩn MIL-STD-810H. Lý tưởng cho môi trường doanh nghiệp.",
        "variations": [
            {"sku": "TP-E14-16-512", "price": 19490000, "stock": 10, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "AMD Ryzen 7", "Card đồ họa": "AMD Radeon", "Màn hình": '14"'}},
            {"sku": "TP-E14-32-512", "price": 23490000, "stock": 4, "is_default": False,
             "attrs": {"RAM": "32GB", "Ổ cứng": "512GB SSD", "CPU": "AMD Ryzen 7", "Card đồ họa": "AMD Radeon", "Màn hình": '14"'}},
        ]
    },
    {
        "name": "ASUS VivoBook 15 X1504VA",
        "slug": "asus-vivobook-15-x1504va",
        "category": "laptop-van-phong",
        "base_price": 13990000,
        "featured": False,
        "description": "Laptop sinh viên giá tốt với màn hình OLED Full HD sắc nét. Hiệu năng ổn định cho học tập và làm việc. Thiết kế nhỏ gọn, nhiều màu sắc trẻ trung.",
        "variations": [
            {"sku": "VB15-8-512", "price": 13990000, "stock": 18, "is_default": True,
             "attrs": {"RAM": "8GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i5", "Card đồ họa": "Intel Iris Xe", "Màn hình": '15.6"'}},
        ]
    },

    # ===== ĐỒ HỌA =====
    {
        "name": "ASUS ProArt Studiobook 16 H7604",
        "slug": "asus-proart-studiobook-16-h7604",
        "category": "laptop-do-hoa",
        "base_price": 52990000,
        "featured": True,
        "description": "Laptop workstation chuyên nghiệp cho nhà thiết kế. Màn hình OLED 4K 120Hz với độ chính xác màu Delta E < 2. RTX 4070 cho render nhanh chóng.",
        "variations": [
            {"sku": "PROART-32-1TB", "price": 52990000, "stock": 3, "is_default": True,
             "attrs": {"RAM": "32GB", "Ổ cứng": "1TB SSD", "CPU": "Intel Core i9", "Card đồ họa": "NVIDIA RTX 4070", "Màn hình": '16"'}},
            {"sku": "PROART-64-2TB", "price": 67990000, "stock": 2, "is_default": False,
             "attrs": {"RAM": "64GB", "Ổ cứng": "2TB SSD", "CPU": "Intel Core i9", "Card đồ họa": "NVIDIA RTX 4080", "Màn hình": '16"'}},
        ]
    },
    {
        "name": "Dell Precision 5570",
        "slug": "dell-precision-5570",
        "category": "laptop-do-hoa",
        "base_price": 47990000,
        "featured": False,
        "description": "Laptop workstation mỏng nhẹ cho chuyên gia sáng tạo. Màn hình OLED 3.5K chuẩn màu chuyên nghiệp, hiệu năng ổn định suốt ngày làm việc.",
        "variations": [
            {"sku": "PREC-5570-32-1TB", "price": 47990000, "stock": 2, "is_default": True,
             "attrs": {"RAM": "32GB", "Ổ cứng": "1TB SSD", "CPU": "Intel Core i7", "Card đồ họa": "NVIDIA RTX 3060", "Màn hình": '15.6"'}},
        ]
    },

    # ===== MỎNG NHẸ =====
    {
        "name": "ASUS Zenbook 14 OLED UX3405",
        "slug": "asus-zenbook-14-oled-ux3405",
        "category": "laptop-mong-nhe",
        "base_price": 24990000,
        "featured": True,
        "description": "Laptop mỏng nhẹ cao cấp với màn hình OLED 2.8K 120Hz rực rỡ. Chỉ nặng 1.2kg, pin 75Wh dùng cả ngày. Hiệu năng Intel Core Ultra mạnh mẽ.",
        "variations": [
            {"sku": "ZB14-16-512", "price": 24990000, "stock": 8, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i7", "Card đồ họa": "Intel Iris Xe", "Màn hình": '14"'}},
            {"sku": "ZB14-32-1TB", "price": 29990000, "stock": 4, "is_default": False,
             "attrs": {"RAM": "32GB", "Ổ cứng": "1TB SSD", "CPU": "Intel Core i7", "Card đồ họa": "Intel Iris Xe", "Màn hình": '14"'}},
        ]
    },
    {
        "name": "LG Gram 14 2024",
        "slug": "lg-gram-14-2024",
        "category": "laptop-mong-nhe",
        "base_price": 27990000,
        "featured": True,
        "description": "Laptop nhẹ nhất phân khúc chỉ 980g, chuẩn MIL-STD-810H 7 tiêu chí. Pin 72Wh sử dụng hơn 20 tiếng. Màn hình IPS 2560x1600.",
        "variations": [
            {"sku": "GRAM14-16-512", "price": 27990000, "stock": 5, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Intel Core i7", "Card đồ họa": "Intel Iris Xe", "Màn hình": '14"'}},
        ]
    },
    {
        "name": "HP Spectre x360 14",
        "slug": "hp-spectre-x360-14",
        "category": "laptop-mong-nhe",
        "base_price": 32990000,
        "featured": False,
        "description": "Laptop 2-in-1 cao cấp có thể gập 360 độ, dùng được như máy tính bảng. Màn hình OLED cảm ứng 2.8K, bút stylus đi kèm, thiết kế sang trọng.",
        "variations": [
            {"sku": "SPX360-16-1TB", "price": 32990000, "stock": 4, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "1TB SSD", "CPU": "Intel Core i7", "Card đồ họa": "Intel Iris Xe", "Màn hình": '14"'}},
        ]
    },

    # ===== MACBOOK =====
    {
        "name": "Apple MacBook Air 13 M3 2024",
        "slug": "apple-macbook-air-13-m3-2024",
        "category": "macbook",
        "base_price": 28990000,
        "featured": True,
        "description": "MacBook Air mỏng nhẹ với chip M3 mạnh mẽ. Không quạt tản nhiệt, hoàn toàn im lặng. Pin lên đến 18 tiếng, màn hình Liquid Retina 13.6\" sắc nét.",
        "variations": [
            {"sku": "MBA13-M3-8-256", "price": 28990000, "stock": 10, "is_default": True,
             "attrs": {"RAM": "8GB", "Ổ cứng": "256GB SSD", "CPU": "Apple M3", "Card đồ họa": "Apple GPU", "Màn hình": '13.3"'}},
            {"sku": "MBA13-M3-16-512", "price": 36990000, "stock": 6, "is_default": False,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Apple M3", "Card đồ họa": "Apple GPU", "Màn hình": '13.3"'}},
        ]
    },
    {
        "name": "Apple MacBook Air 15 M3 2024",
        "slug": "apple-macbook-air-15-m3-2024",
        "category": "macbook",
        "base_price": 34990000,
        "featured": True,
        "description": "MacBook Air màn hình lớn 15.3\" với chip M3. Hiệu năng vượt trội, pin 18 tiếng, loa 6 driver chất lượng cao. Lý tưởng cho người dùng cần màn hình rộng.",
        "variations": [
            {"sku": "MBA15-M3-8-256", "price": 34990000, "stock": 7, "is_default": True,
             "attrs": {"RAM": "8GB", "Ổ cứng": "256GB SSD", "CPU": "Apple M3", "Card đồ họa": "Apple GPU", "Màn hình": '16"'}},
            {"sku": "MBA15-M3-16-512", "price": 42990000, "stock": 4, "is_default": False,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Apple M3", "Card đồ họa": "Apple GPU", "Màn hình": '16"'}},
        ]
    },
    {
        "name": "Apple MacBook Pro 14 M3 Pro",
        "slug": "apple-macbook-pro-14-m3-pro",
        "category": "macbook",
        "base_price": 52990000,
        "featured": True,
        "description": "MacBook Pro chuyên nghiệp với chip M3 Pro 11 nhân. Màn hình Liquid Retina XDR 120Hz ProMotion. Dành cho lập trình viên, nhà thiết kế và nhà làm phim.",
        "variations": [
            {"sku": "MBP14-M3PRO-18-512", "price": 52990000, "stock": 5, "is_default": True,
             "attrs": {"RAM": "16GB", "Ổ cứng": "512GB SSD", "CPU": "Apple M3 Pro", "Card đồ họa": "Apple GPU", "Màn hình": '14"'}},
            {"sku": "MBP14-M3PRO-36-1TB", "price": 67990000, "stock": 2, "is_default": False,
             "attrs": {"RAM": "32GB", "Ổ cứng": "1TB SSD", "CPU": "Apple M3 Pro", "Card đồ họa": "Apple GPU", "Màn hình": '14"'}},
        ]
    },
]

# ============================================================
# 4. TẠO SẢN PHẨM + VARIATION + ATTRIBUTES
# ============================================================
product_count = 0
variation_count = 0

for pd in products_data:
    cat = categories[pd["category"]]

    product, created = Product.objects.get_or_create(
        slug=pd["slug"],
        defaults={
            "name": pd["name"],
            "category": cat,
            "base_price": pd["base_price"],
            "featured": pd["featured"],
            "status": True,
            "description": pd["description"],
        }
    )

    if created:
        product_count += 1
        print(f"  ✅ Tạo sản phẩm: {pd['name']}")
    else:
        print(f"  ⚠️  Đã có: {pd['name']}")

    for var in pd["variations"]:
        variation, var_created = ProductVariation.objects.get_or_create(
            sku=var["sku"],
            defaults={
                "product": product,
                "price": var["price"],
                "stock_quantity": var["stock"],
                "is_default": var["is_default"],
                "status": True,
                "discount_price": None,
            }
        )

        if var_created:
            variation_count += 1
            for attr_name, attr_val in var["attrs"].items():
                if attr_name in attr_values and attr_val in attr_values[attr_name]:
                    VariationAttribute.objects.get_or_create(
                        product_variation=variation,
                        attribute_value=attr_values[attr_name][attr_val],
                    )

# ============================================================
# 5. KẾT QUẢ
# ============================================================
print("\n" + "="*50)
print("🎉 HOÀN THÀNH NẠP DATA!")
print("="*50)
print(f"  📁 Danh mục:   {Category.objects.count()} danh mục")
print(f"  💻 Sản phẩm:   {Product.objects.count()} sản phẩm ({product_count} mới)")
print(f"  🔧 Biến thể:   {ProductVariation.objects.count()} biến thể ({variation_count} mới)")
print(f"  🏷️  Thuộc tính: {AttributeType.objects.count()} loại")
print("="*50)
print("👉 Vào http://localhost:3000 để xem kết quả!")
