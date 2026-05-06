"""
Script nạp 50 sản phẩm mẫu vào database LaptopQTK
- 30 Laptop (Gaming, Văn phòng, Đồ họa, Mỏng nhẹ, MacBook)
- 20 Linh kiện máy tính (RAM, SSD, CPU, GPU, Tản nhiệt, Chuột, Bàn phím, Màn hình)

Chạy: python seed_data.py
"""
import os, sys, django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'laptop_store.settings')
django.setup()

from apps.catalog.models import (
    Category, Product, ProductVariation,
    AttributeType, AttributeValue, VariationAttribute
)

print("🚀 Bắt đầu nạp 50 sản phẩm...\n")

# ─── 1. DANH MỤC ──────────────────────────────────────────────
cats_data = [
    {"name": "Laptop Gaming",       "slug": "laptop-gaming"},
    {"name": "Laptop Văn Phòng",    "slug": "laptop-van-phong"},
    {"name": "Laptop Đồ Họa",       "slug": "laptop-do-hoa"},
    {"name": "Laptop Mỏng Nhẹ",     "slug": "laptop-mong-nhe"},
    {"name": "MacBook",             "slug": "macbook"},
    {"name": "RAM & Bộ Nhớ",        "slug": "ram-bo-nho"},
    {"name": "Ổ Cứng SSD",          "slug": "o-cung-ssd"},
    {"name": "Card Màn Hình",       "slug": "card-man-hinh"},
    {"name": "Bàn Phím & Chuột",    "slug": "ban-phim-chuot"},
    {"name": "Màn Hình Máy Tính",   "slug": "man-hinh"},
]

cats = {}
for c in cats_data:
    obj, created = Category.objects.get_or_create(slug=c["slug"], defaults={"name": c["name"]})
    cats[c["slug"]] = obj
    print(f"  {'✅' if created else '⚠️ '} Danh mục: {c['name']}")

# ─── 2. THUỘC TÍNH ────────────────────────────────────────────
attr_data = {
    "RAM":          ["8GB", "16GB", "32GB", "64GB", "128GB"],
    "Ổ cứng":       ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD"],
    "Màn hình":     ['13.3"', '14"', '15.6"', '16"', '17.3"', '24"', '27"', '32"'],
    "CPU":          ["Intel Core i5", "Intel Core i7", "Intel Core i9",
                     "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9",
                     "Apple M2", "Apple M3", "Apple M3 Pro", "Apple M3 Max"],
    "Card đồ họa":  ["Intel Iris Xe", "AMD Radeon",
                     "NVIDIA RTX 3050", "NVIDIA RTX 3060", "NVIDIA RTX 3080",
                     "NVIDIA RTX 4060", "NVIDIA RTX 4070", "NVIDIA RTX 4080", "NVIDIA RTX 4090",
                     "Apple GPU 10-core", "Apple GPU 30-core", "Apple GPU 40-core"],
    "Loại RAM":     ["DDR4", "DDR5", "LPDDR5"],
    "Giao tiếp":    ["PCIe 3.0", "PCIe 4.0", "PCIe 5.0", "SATA III", "USB 3.2"],
    "Độ phân giải": ["Full HD (1920x1080)", "2K (2560x1440)", "4K (3840x2160)", "WQHD (2560x1600)"],
    "Tần số quét":  ["60Hz", "75Hz", "144Hz", "165Hz", "240Hz", "360Hz"],
    "Kết nối":      ["Có dây", "Không dây", "Bluetooth + USB"],
}

atypes, avals = {}, {}
for name, vals in attr_data.items():
    at, _ = AttributeType.objects.get_or_create(name=name, defaults={"display_name": name})
    atypes[name] = at
    avals[name] = {}
    for v in vals:
        av, _ = AttributeValue.objects.get_or_create(attribute_type=at, value=v, defaults={"display_value": v})
        avals[name][v] = av

print(f"\n  ✅ {len(attr_data)} loại thuộc tính\n")

# ─── 3. SẢN PHẨM ──────────────────────────────────────────────
products_data = [

    # ══════════════════════════════════════════
    # LAPTOP GAMING (8 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "ASUS ROG Strix G16 G614JV", "slug": "asus-rog-strix-g16-g614jv",
        "cat": "laptop-gaming", "price": 28990000, "featured": True,
        "desc": "Laptop gaming đỉnh cao với CPU Intel Core i7 và GPU RTX 4060, màn hình 165Hz cho trải nghiệm chơi game mượt mà tuyệt đối.",
        "vars": [
            {"sku":"ROG-G614-16-512","price":28990000,"disc":26090000,"stock":10,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"NVIDIA RTX 4060","Màn hình":'16"'}},
            {"sku":"ROG-G614-32-1TB","price":33990000,"disc":None,"stock":5,"default":False,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i7","Card đồ họa":"NVIDIA RTX 4060","Màn hình":'16"'}},
        ]
    },
    {
        "name": "MSI Cyborg 15 B13VF", "slug": "msi-cyborg-15-b13vf",
        "cat": "laptop-gaming", "price": 22490000, "featured": True,
        "desc": "Thiết kế trong suốt độc đáo, RTX 4060, màn hình 144Hz. Lựa chọn hoàn hảo cho game thủ ngân sách vừa phải.",
        "vars": [
            {"sku":"MSI-CYB15-16-512","price":22490000,"disc":19990000,"stock":8,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"NVIDIA RTX 4060","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "Lenovo LOQ 15IRX9", "slug": "lenovo-loq-15irx9",
        "cat": "laptop-gaming", "price": 19990000, "featured": False,
        "desc": "Laptop gaming entry-level RTX 3050, phù hợp game thủ mới. Bàn phím RGB, tản nhiệt tốt, giá hợp lý.",
        "vars": [
            {"sku":"LOQ15-8-512","price":19990000,"disc":18490000,"stock":12,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i5","Card đồ họa":"NVIDIA RTX 3050","Màn hình":'15.6"'}},
            {"sku":"LOQ15-16-512","price":22490000,"disc":None,"stock":6,"default":False,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i5","Card đồ họa":"NVIDIA RTX 3050","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "ASUS TUF Gaming F15 FX507VU", "slug": "asus-tuf-f15-fx507vu",
        "cat": "laptop-gaming", "price": 24990000, "featured": True,
        "desc": "Chuẩn quân sự MIL-STD-810H, RTX 4050, 144Hz. Anti-Dust cho tuổi thọ máy cao.",
        "vars": [
            {"sku":"TUF-F15-16-512","price":24990000,"disc":22490000,"stock":7,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"NVIDIA RTX 3060","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "Acer Predator Helios 16 PH16", "slug": "acer-predator-helios-16",
        "cat": "laptop-gaming", "price": 45990000, "featured": False,
        "desc": "RTX 4080, Mini-LED 240Hz, tản nhiệt AerBlade 5th Gen. Hiệu năng đỉnh cao không thỏa hiệp.",
        "vars": [
            {"sku":"PRED-H16-32-1TB","price":45990000,"disc":42990000,"stock":3,"default":True,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 4080","Màn hình":'16"'}},
        ]
    },
    {
        "name": "MSI Titan GT77 HX", "slug": "msi-titan-gt77-hx",
        "cat": "laptop-gaming", "price": 89990000, "featured": False,
        "desc": "Laptop gaming siêu mạnh với RTX 4090 và màn hình 4K 144Hz. Đỉnh cao công nghệ gaming di động.",
        "vars": [
            {"sku":"TITAN-GT77-64-2TB","price":89990000,"disc":None,"stock":2,"default":True,
             "attrs":{"RAM":"64GB","Ổ cứng":"2TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 4090","Màn hình":'17.3"'}},
        ]
    },
    {
        "name": "Gigabyte AORUS 15 BMF", "slug": "gigabyte-aorus-15-bmf",
        "cat": "laptop-gaming", "price": 27990000, "featured": True,
        "desc": "AORUS 15 với RTX 4060, màn hình FHD 165Hz, tản nhiệt Windforce Infinity. Thiết kế mỏng nhẹ cho laptop gaming.",
        "vars": [
            {"sku":"AORUS15-16-512","price":27990000,"disc":25490000,"stock":5,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"NVIDIA RTX 4060","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "Razer Blade 15 2024", "slug": "razer-blade-15-2024",
        "cat": "laptop-gaming", "price": 59990000, "featured": True,
        "desc": "Laptop gaming cao cấp nhất với vỏ CNC nhôm, RTX 4070, màn hình QHD 240Hz. Biểu tượng gaming premium.",
        "vars": [
            {"sku":"BLADE15-16-1TB","price":59990000,"disc":56990000,"stock":4,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 4070","Màn hình":'15.6"'}},
            {"sku":"BLADE15-32-1TB","price":69990000,"disc":None,"stock":2,"default":False,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 4080","Màn hình":'15.6"'}},
        ]
    },

    # ══════════════════════════════════════════
    # LAPTOP VĂN PHÒNG (7 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "Dell Inspiron 15 3530", "slug": "dell-inspiron-15-3530",
        "cat": "laptop-van-phong", "price": 14990000, "featured": True,
        "desc": "Laptop văn phòng bền bỉ, hiệu năng tốt, pin 54Wh dùng cả ngày làm việc.",
        "vars": [
            {"sku":"INS15-8-256","price":14990000,"disc":13490000,"stock":15,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"256GB SSD","CPU":"Intel Core i5","Card đồ họa":"Intel Iris Xe","Màn hình":'15.6"'}},
            {"sku":"INS15-16-512","price":17990000,"disc":None,"stock":8,"default":False,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i5","Card đồ họa":"Intel Iris Xe","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "HP 240 G10", "slug": "hp-240-g10",
        "cat": "laptop-van-phong", "price": 12490000, "featured": False,
        "desc": "Laptop văn phòng giá rẻ, gọn nhẹ, lý tưởng cho sinh viên và nhân viên.",
        "vars": [
            {"sku":"HP240-8-256","price":12490000,"disc":11490000,"stock":20,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"256GB SSD","CPU":"Intel Core i5","Card đồ họa":"Intel Iris Xe","Màn hình":'14"'}},
        ]
    },
    {
        "name": "Lenovo ThinkPad E14 Gen 5", "slug": "lenovo-thinkpad-e14-gen5",
        "cat": "laptop-van-phong", "price": 19490000, "featured": True,
        "desc": "ThinkPad danh tiếng bền bỉ, bàn phím tuyệt vời, bảo mật vân tay. Chuẩn doanh nghiệp.",
        "vars": [
            {"sku":"TPE14-16-512","price":19490000,"disc":17990000,"stock":10,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"AMD Ryzen 7","Card đồ họa":"AMD Radeon","Màn hình":'14"'}},
        ]
    },
    {
        "name": "ASUS VivoBook 15 X1504", "slug": "asus-vivobook-15-x1504",
        "cat": "laptop-van-phong", "price": 13990000, "featured": False,
        "desc": "Laptop văn phòng nhẹ 1.7kg, màn hình chống chói, cổng kết nối đa dạng.",
        "vars": [
            {"sku":"VB15-8-256","price":13990000,"disc":12490000,"stock":18,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"256GB SSD","CPU":"Intel Core i5","Card đồ họa":"Intel Iris Xe","Màn hình":'15.6"'}},
            {"sku":"VB15-16-512","price":16990000,"disc":None,"stock":9,"default":False,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i5","Card đồ họa":"Intel Iris Xe","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "Acer Aspire 5 A515-58M", "slug": "acer-aspire-5-a515-58m",
        "cat": "laptop-van-phong", "price": 15490000, "featured": False,
        "desc": "Thiết kế mỏng nhẹ, màn hình Full HD IPS, hiệu năng ổn định cho đa nhiệm văn phòng.",
        "vars": [
            {"sku":"ASP5-8-512","price":15490000,"disc":14490000,"stock":14,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i5","Card đồ họa":"Intel Iris Xe","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "Samsung Galaxy Book4 Pro", "slug": "samsung-galaxy-book4-pro",
        "cat": "laptop-van-phong", "price": 35990000, "featured": True,
        "desc": "Màn hình AMOLED 3K 120Hz rực rỡ, chip Intel Core Ultra, tích hợp AI Galaxy. Sang trọng và mạnh mẽ.",
        "vars": [
            {"sku":"GB4PRO-16-512","price":35990000,"disc":32990000,"stock":6,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'16"'}},
        ]
    },
    {
        "name": "HP EliteBook 840 G10", "slug": "hp-elitebook-840-g10",
        "cat": "laptop-van-phong", "price": 29990000, "featured": False,
        "desc": "Laptop doanh nghiệp cao cấp, bảo mật HP Wolf, màn hình Sure View chống nhìn trộm.",
        "vars": [
            {"sku":"EB840-16-512","price":29990000,"disc":27990000,"stock":5,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'14"'}},
            {"sku":"EB840-32-1TB","price":37990000,"disc":None,"stock":3,"default":False,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'14"'}},
        ]
    },

    # ══════════════════════════════════════════
    # LAPTOP ĐỒ HỌA (4 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "ASUS ProArt Studiobook 16", "slug": "asus-proart-studiobook-16",
        "cat": "laptop-do-hoa", "price": 52990000, "featured": True,
        "desc": "Màn hình OLED 4K 120Hz Delta E<2, RTX 4070. Workstation di động hoàn hảo cho nhà thiết kế.",
        "vars": [
            {"sku":"PROART-32-1TB","price":52990000,"disc":49990000,"stock":3,"default":True,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 4070","Màn hình":'16"'}},
            {"sku":"PROART-64-2TB","price":67990000,"disc":None,"stock":2,"default":False,
             "attrs":{"RAM":"64GB","Ổ cứng":"2TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 4080","Màn hình":'16"'}},
        ]
    },
    {
        "name": "Dell Precision 5570", "slug": "dell-precision-5570",
        "cat": "laptop-do-hoa", "price": 47990000, "featured": False,
        "desc": "Workstation mỏng nhẹ, màn hình OLED 3.5K chuẩn màu chuyên nghiệp.",
        "vars": [
            {"sku":"PREC5570-32-1TB","price":47990000,"disc":44990000,"stock":2,"default":True,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i7","Card đồ họa":"NVIDIA RTX 3060","Màn hình":'15.6"'}},
        ]
    },
    {
        "name": "Lenovo ThinkPad P16 Gen 2", "slug": "lenovo-thinkpad-p16-gen2",
        "cat": "laptop-do-hoa", "price": 55990000, "featured": False,
        "desc": "Mobile workstation với RTX 3080, màn hình IPS 4K, vượt qua chứng nhận ISV. Sức mạnh của máy trạm.",
        "vars": [
            {"sku":"TP16-64-1TB","price":55990000,"disc":None,"stock":2,"default":True,
             "attrs":{"RAM":"64GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 3080","Màn hình":'16"'}},
        ]
    },
    {
        "name": "HP ZBook Studio G10", "slug": "hp-zbook-studio-g10",
        "cat": "laptop-do-hoa", "price": 61990000, "featured": True,
        "desc": "Workstation di động mỏng nhất của HP, RTX 4070, màn hình DreamColor 4K OLED.",
        "vars": [
            {"sku":"ZBOOK-32-1TB","price":61990000,"disc":58990000,"stock":2,"default":True,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i9","Card đồ họa":"NVIDIA RTX 4070","Màn hình":'16"'}},
        ]
    },

    # ══════════════════════════════════════════
    # LAPTOP MỎNG NHẸ (5 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "ASUS Zenbook 14 OLED UX3405", "slug": "asus-zenbook-14-oled-ux3405",
        "cat": "laptop-mong-nhe", "price": 24990000, "featured": True,
        "desc": "OLED 2.8K 120Hz, chỉ 1.2kg, pin 75Wh. Hiệu năng Intel Core Ultra mạnh mẽ trong thân máy siêu mỏng.",
        "vars": [
            {"sku":"ZB14-16-512","price":24990000,"disc":22990000,"stock":8,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'14"'}},
            {"sku":"ZB14-32-1TB","price":29990000,"disc":None,"stock":4,"default":False,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'14"'}},
        ]
    },
    {
        "name": "LG Gram 14 2024", "slug": "lg-gram-14-2024",
        "cat": "laptop-mong-nhe", "price": 27990000, "featured": True,
        "desc": "Chỉ 980g - nhẹ nhất phân khúc. Pin 72Wh dùng 20 tiếng, chuẩn MIL-STD-810H 7 tiêu chí.",
        "vars": [
            {"sku":"GRAM14-16-512","price":27990000,"disc":25490000,"stock":5,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'14"'}},
        ]
    },
    {
        "name": "HP Spectre x360 14", "slug": "hp-spectre-x360-14",
        "cat": "laptop-mong-nhe", "price": 32990000, "featured": False,
        "desc": "2-in-1 gập 360°, OLED cảm ứng 2.8K, bút stylus, thiết kế đa giác kim cương sang trọng.",
        "vars": [
            {"sku":"SPX360-16-1TB","price":32990000,"disc":29990000,"stock":4,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'14"'}},
        ]
    },
    {
        "name": "Dell XPS 13 Plus 9320", "slug": "dell-xps-13-plus-9320",
        "cat": "laptop-mong-nhe", "price": 38990000, "featured": True,
        "desc": "Thiết kế tối giản đột phá, màn hình OLED 3.5K, bàn phím xúc giác capacitive thế hệ mới.",
        "vars": [
            {"sku":"XPS13P-16-512","price":38990000,"disc":35990000,"stock":4,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'13.3"'}},
            {"sku":"XPS13P-32-1TB","price":47990000,"disc":None,"stock":2,"default":False,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Intel Core i7","Card đồ họa":"Intel Iris Xe","Màn hình":'13.3"'}},
        ]
    },
    {
        "name": "Lenovo Yoga Slim 7i Pro X", "slug": "lenovo-yoga-slim-7i-pro-x",
        "cat": "laptop-mong-nhe", "price": 31990000, "featured": False,
        "desc": "Màn hình 14.5\" OLED 3K 120Hz, thiết kế carbon fiber siêu nhẹ 1.4kg, sạc nhanh 100W.",
        "vars": [
            {"sku":"YS7P-16-512","price":31990000,"disc":28990000,"stock":5,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Intel Core i7","Card đồ họa":"NVIDIA RTX 3050","Màn hình":'14"'}},
        ]
    },

    # ══════════════════════════════════════════
    # MACBOOK (6 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "Apple MacBook Air 13 M3 2024", "slug": "apple-macbook-air-13-m3",
        "cat": "macbook", "price": 28990000, "featured": True,
        "desc": "Chip M3 siêu mạnh, không quạt hoàn toàn im lặng, pin 18 tiếng, màn hình Liquid Retina 13.6\".",
        "vars": [
            {"sku":"MBA13-M3-8-256","price":28990000,"disc":26990000,"stock":10,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"256GB SSD","CPU":"Apple M3","Card đồ họa":"Apple GPU 10-core","Màn hình":'13.3"'}},
            {"sku":"MBA13-M3-16-512","price":36990000,"disc":None,"stock":6,"default":False,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Apple M3","Card đồ họa":"Apple GPU 10-core","Màn hình":'13.3"'}},
        ]
    },
    {
        "name": "Apple MacBook Air 15 M3 2024", "slug": "apple-macbook-air-15-m3",
        "cat": "macbook", "price": 34990000, "featured": True,
        "desc": "MacBook Air màn hình lớn 15.3\", chip M3, loa 6 driver chất lượng cao, pin 18 tiếng.",
        "vars": [
            {"sku":"MBA15-M3-8-256","price":34990000,"disc":32490000,"stock":7,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"256GB SSD","CPU":"Apple M3","Card đồ họa":"Apple GPU 10-core","Màn hình":'16"'}},
            {"sku":"MBA15-M3-16-512","price":42990000,"disc":None,"stock":4,"default":False,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Apple M3","Card đồ họa":"Apple GPU 10-core","Màn hình":'16"'}},
        ]
    },
    {
        "name": "Apple MacBook Pro 14 M3 Pro", "slug": "apple-macbook-pro-14-m3-pro",
        "cat": "macbook", "price": 52990000, "featured": True,
        "desc": "M3 Pro 11 nhân, Liquid Retina XDR 120Hz ProMotion. Dành cho lập trình viên và nhà sáng tạo chuyên nghiệp.",
        "vars": [
            {"sku":"MBP14-M3P-18-512","price":52990000,"disc":49990000,"stock":5,"default":True,
             "attrs":{"RAM":"16GB","Ổ cứng":"512GB SSD","CPU":"Apple M3 Pro","Card đồ họa":"Apple GPU 30-core","Màn hình":'14"'}},
            {"sku":"MBP14-M3P-36-1TB","price":67990000,"disc":None,"stock":2,"default":False,
             "attrs":{"RAM":"32GB","Ổ cứng":"1TB SSD","CPU":"Apple M3 Pro","Card đồ họa":"Apple GPU 30-core","Màn hình":'14"'}},
        ]
    },
    {
        "name": "Apple MacBook Pro 16 M3 Max", "slug": "apple-macbook-pro-16-m3-max",
        "cat": "macbook", "price": 89990000, "featured": True,
        "desc": "M3 Max 16 nhân CPU + 40 nhân GPU. Đỉnh cao hiệu năng cho render, AI và phát triển phần mềm phức tạp.",
        "vars": [
            {"sku":"MBP16-M3M-48-1TB","price":89990000,"disc":84990000,"stock":3,"default":True,
             "attrs":{"RAM":"64GB","Ổ cứng":"1TB SSD","CPU":"Apple M3 Max","Card đồ họa":"Apple GPU 40-core","Màn hình":'16"'}},
        ]
    },
    {
        "name": "Apple MacBook Pro 14 M3", "slug": "apple-macbook-pro-14-m3",
        "cat": "macbook", "price": 42990000, "featured": False,
        "desc": "MacBook Pro 14\" chip M3 cơ bản, màn hình ProMotion 120Hz, pin 22 tiếng. Nâng cấp đáng giá.",
        "vars": [
            {"sku":"MBP14-M3-8-512","price":42990000,"disc":39990000,"stock":6,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"512GB SSD","CPU":"Apple M3","Card đồ họa":"Apple GPU 10-core","Màn hình":'14"'}},
        ]
    },
    {
        "name": "Apple MacBook Air 13 M2 2022", "slug": "apple-macbook-air-13-m2",
        "cat": "macbook", "price": 22990000, "featured": False,
        "desc": "Thiết kế hoàn toàn mới, chip M2, màn hình Liquid Retina notch. Lựa chọn giá tốt cho hệ sinh thái Apple.",
        "vars": [
            {"sku":"MBA13-M2-8-256","price":22990000,"disc":20990000,"stock":8,"default":True,
             "attrs":{"RAM":"8GB","Ổ cứng":"256GB SSD","CPU":"Apple M2","Card đồ họa":"Apple GPU 10-core","Màn hình":'13.3"'}},
        ]
    },

    # ══════════════════════════════════════════
    # RAM & BỘ NHỚ (5 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "RAM Kingston Fury Beast DDR5 16GB", "slug": "ram-kingston-fury-beast-ddr5-16gb",
        "cat": "ram-bo-nho", "price": 1290000, "featured": True,
        "desc": "RAM DDR5 5600MHz tốc độ cao, tản nhiệt thấp profile, tương thích Intel XMP 3.0. Hiệu năng vượt trội cho gaming.",
        "vars": [
            {"sku":"KFB-DDR5-16","price":1290000,"disc":1190000,"stock":30,"default":True,
             "attrs":{"RAM":"16GB","Loại RAM":"DDR5"}},
            {"sku":"KFB-DDR5-32","price":2490000,"disc":None,"stock":20,"default":False,
             "attrs":{"RAM":"32GB","Loại RAM":"DDR5"}},
        ]
    },
    {
        "name": "RAM Corsair Vengeance DDR5 32GB", "slug": "ram-corsair-vengeance-ddr5-32gb",
        "cat": "ram-bo-nho", "price": 2890000, "featured": False,
        "desc": "Bộ đôi 2x16GB DDR5 6000MHz, tản nhiệt nhôm cao cấp. Chuẩn XMP 3.0 cho overclock ổn định.",
        "vars": [
            {"sku":"CV5-32-6000","price":2890000,"disc":2690000,"stock":15,"default":True,
             "attrs":{"RAM":"32GB","Loại RAM":"DDR5"}},
        ]
    },
    {
        "name": "RAM G.Skill Trident Z5 RGB DDR5 64GB", "slug": "ram-gskill-trident-z5-rgb-64gb",
        "cat": "ram-bo-nho", "price": 5990000, "featured": False,
        "desc": "Bộ đôi 2x32GB DDR5 6400MHz, LED RGB cực đẹp, tản nhiệt kép. Hiệu năng đỉnh cao cho workstation.",
        "vars": [
            {"sku":"GTZ5-64-6400","price":5990000,"disc":5490000,"stock":8,"default":True,
             "attrs":{"RAM":"64GB","Loại RAM":"DDR5"}},
        ]
    },
    {
        "name": "RAM Kingston HyperX Fury DDR4 16GB", "slug": "ram-kingston-hyperx-fury-ddr4-16gb",
        "cat": "ram-bo-nho", "price": 890000, "featured": False,
        "desc": "DDR4 3200MHz CL16, auto overclock Intel XMP. Tương thích rộng rãi với bo mạch chủ phổ thông.",
        "vars": [
            {"sku":"KHX-DDR4-16","price":890000,"disc":790000,"stock":40,"default":True,
             "attrs":{"RAM":"16GB","Loại RAM":"DDR4"}},
        ]
    },
    {
        "name": "RAM Laptop Crucial 16GB DDR5 SODIMM", "slug": "ram-crucial-16gb-ddr5-sodimm",
        "cat": "ram-bo-nho", "price": 1190000, "featured": True,
        "desc": "RAM laptop DDR5 SODIMM 5600MHz, nâng cấp hoàn hảo cho laptop thế hệ mới. Tiết kiệm điện tối đa.",
        "vars": [
            {"sku":"CRC-SODIMM-16","price":1190000,"disc":1090000,"stock":25,"default":True,
             "attrs":{"RAM":"16GB","Loại RAM":"DDR5"}},
            {"sku":"CRC-SODIMM-32","price":2290000,"disc":None,"stock":15,"default":False,
             "attrs":{"RAM":"32GB","Loại RAM":"DDR5"}},
        ]
    },

    # ══════════════════════════════════════════
    # Ổ CỨNG SSD (4 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "SSD Samsung 990 Pro NVMe 1TB", "slug": "ssd-samsung-990-pro-nvme-1tb",
        "cat": "o-cung-ssd", "price": 2890000, "featured": True,
        "desc": "SSD NVMe PCIe 4.0 tốc độ đọc 7450MB/s. Hiệu năng hàng đầu thị trường, bảo hành 5 năm.",
        "vars": [
            {"sku":"SAM990P-1TB","price":2890000,"disc":2590000,"stock":20,"default":True,
             "attrs":{"Ổ cứng":"1TB SSD","Giao tiếp":"PCIe 4.0"}},
            {"sku":"SAM990P-2TB","price":5490000,"disc":None,"stock":10,"default":False,
             "attrs":{"Ổ cứng":"2TB SSD","Giao tiếp":"PCIe 4.0"}},
        ]
    },
    {
        "name": "SSD WD Black SN850X 2TB NVMe", "slug": "ssd-wd-black-sn850x-2tb",
        "cat": "o-cung-ssd", "price": 4990000, "featured": False,
        "desc": "PCIe 4.0, tốc độ đọc 7300MB/s, tối ưu cho PS5 và gaming PC. Bảo hành 5 năm.",
        "vars": [
            {"sku":"WDBN-2TB","price":4990000,"disc":4490000,"stock":12,"default":True,
             "attrs":{"Ổ cứng":"2TB SSD","Giao tiếp":"PCIe 4.0"}},
        ]
    },
    {
        "name": "SSD Crucial P5 Plus 1TB NVMe", "slug": "ssd-crucial-p5-plus-1tb",
        "cat": "o-cung-ssd", "price": 2190000, "featured": False,
        "desc": "PCIe 4.0, đọc 6600MB/s, giá cực tốt. Lựa chọn tính năng/giá tối ưu nhất thị trường.",
        "vars": [
            {"sku":"CRP5P-1TB","price":2190000,"disc":1990000,"stock":18,"default":True,
             "attrs":{"Ổ cứng":"1TB SSD","Giao tiếp":"PCIe 4.0"}},
        ]
    },
    {
        "name": "SSD Samsung 870 EVO SATA 500GB", "slug": "ssd-samsung-870-evo-sata-500gb",
        "cat": "o-cung-ssd", "price": 1290000, "featured": True,
        "desc": "SATA III, đọc 560MB/s. Nâng cấp đơn giản cho laptop cũ, tăng tốc vượt bậc so với HDD.",
        "vars": [
            {"sku":"SAM870E-500","price":1290000,"disc":1190000,"stock":25,"default":True,
             "attrs":{"Ổ cứng":"512GB SSD","Giao tiếp":"SATA III"}},
            {"sku":"SAM870E-1TB","price":2290000,"disc":None,"stock":15,"default":False,
             "attrs":{"Ổ cứng":"1TB SSD","Giao tiếp":"SATA III"}},
        ]
    },

    # ══════════════════════════════════════════
    # CARD MÀN HÌNH (3 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "NVIDIA GeForce RTX 4070 SUPER 12GB", "slug": "nvidia-rtx-4070-super-12gb",
        "cat": "card-man-hinh", "price": 16990000, "featured": True,
        "desc": "RTX 4070 SUPER 12GB GDDR6X, hiệu năng 4K gaming tuyệt vời. DLSS 3.5, Frame Generation, Ray Tracing thế hệ mới.",
        "vars": [
            {"sku":"RTX4070S-12","price":16990000,"disc":15990000,"stock":8,"default":True,
             "attrs":{"Card đồ họa":"NVIDIA RTX 4070","RAM":"16GB"}},
        ]
    },
    {
        "name": "NVIDIA GeForce RTX 4060 8GB", "slug": "nvidia-rtx-4060-8gb",
        "cat": "card-man-hinh", "price": 8990000, "featured": True,
        "desc": "RTX 4060 8GB GDDR6, hiệu năng 1080p xuất sắc với DLSS 3. Tiêu thụ điện thấp 115W.",
        "vars": [
            {"sku":"RTX4060-8","price":8990000,"disc":8490000,"stock":12,"default":True,
             "attrs":{"Card đồ họa":"NVIDIA RTX 4060","RAM":"8GB"}},
        ]
    },
    {
        "name": "AMD Radeon RX 7600 8GB", "slug": "amd-radeon-rx-7600-8gb",
        "cat": "card-man-hinh", "price": 6990000, "featured": False,
        "desc": "RDNA 3, 8GB GDDR6, hiệu năng 1080p cạnh tranh. FSR 3.0 và Fluid Motion Frames.",
        "vars": [
            {"sku":"RX7600-8","price":6990000,"disc":6490000,"stock":10,"default":True,
             "attrs":{"Card đồ họa":"AMD Radeon","RAM":"8GB"}},
        ]
    },

    # ══════════════════════════════════════════
    # BÀN PHÍM & CHUỘT (3 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "Logitech MX Keys S Wireless", "slug": "logitech-mx-keys-s",
        "cat": "ban-phim-chuot", "price": 2890000, "featured": True,
        "desc": "Bàn phím không dây đa thiết bị, phím tắt thông minh, đèn nền thích ứng. Kết nối 3 thiết bị cùng lúc.",
        "vars": [
            {"sku":"MXS-BT","price":2890000,"disc":2590000,"stock":15,"default":True,
             "attrs":{"Kết nối":"Bluetooth + USB"}},
        ]
    },
    {
        "name": "Logitech MX Master 3S Wireless", "slug": "logitech-mx-master-3s",
        "cat": "ban-phim-chuot", "price": 1990000, "featured": True,
        "desc": "Chuột không dây ergonomic cao cấp, cuộn MagSpeed 1000 DPI, click im lặng 90%. Làm việc trên mọi bề mặt.",
        "vars": [
            {"sku":"MXM3S-BT","price":1990000,"disc":1790000,"stock":20,"default":True,
             "attrs":{"Kết nối":"Bluetooth + USB"}},
        ]
    },
    {
        "name": "Razer BlackWidow V4 Pro", "slug": "razer-blackwidow-v4-pro",
        "cat": "ban-phim-chuot", "price": 4290000, "featured": False,
        "desc": "Bàn phím cơ gaming RGB Chroma, switch Razer Yellow Linear im lặng, macro wheel. Không dây 2.4GHz.",
        "vars": [
            {"sku":"BWV4P-WL","price":4290000,"disc":3990000,"stock":8,"default":True,
             "attrs":{"Kết nối":"Không dây"}},
        ]
    },

    # ══════════════════════════════════════════
    # MÀN HÌNH MÁY TÍNH (5 sản phẩm)
    # ══════════════════════════════════════════
    {
        "name": "LG 27GP850-B 27\" QHD 165Hz", "slug": "lg-27gp850b-27-qhd-165hz",
        "cat": "man-hinh", "price": 7990000, "featured": True,
        "desc": "IPS Nano, 2K 165Hz, 1ms GtG, HDR400. Màu sắc chính xác và phản hồi nhanh cho gaming và thiết kế.",
        "vars": [
            {"sku":"LG27GP-165","price":7990000,"disc":7490000,"stock":10,"default":True,
             "attrs":{"Màn hình":'27"',"Độ phân giải":"2K (2560x1440)","Tần số quét":"165Hz"}},
        ]
    },
    {
        "name": "Samsung Odyssey G7 27\" OLED", "slug": "samsung-odyssey-g7-27-oled",
        "cat": "man-hinh", "price": 14990000, "featured": True,
        "desc": "OLED QD 2K 240Hz, 0.03ms GtG. Màu OLED siêu rực, đen sâu tuyệt đối, lý tưởng cho gaming.",
        "vars": [
            {"sku":"SAM-G7-OLED","price":14990000,"disc":13990000,"stock":6,"default":True,
             "attrs":{"Màn hình":'27"',"Độ phân giải":"2K (2560x1440)","Tần số quét":"240Hz"}},
        ]
    },
    {
        "name": "ASUS ProArt PA279CRV 27\" 4K", "slug": "asus-proart-pa279crv-27-4k",
        "cat": "man-hinh", "price": 12990000, "featured": False,
        "desc": "IPS 4K 60Hz, Delta E<2, 100% sRGB/Rec.709, Calman Verified. Màn hình chuyên nghiệp cho nhà thiết kế.",
        "vars": [
            {"sku":"PROART-4K-27","price":12990000,"disc":11990000,"stock":5,"default":True,
             "attrs":{"Màn hình":'27"',"Độ phân giải":"4K (3840x2160)","Tần số quét":"60Hz"}},
        ]
    },
    {
        "name": "Dell U2724D 27\" QHD IPS Black", "slug": "dell-u2724d-27-qhd",
        "cat": "man-hinh", "price": 10990000, "featured": False,
        "desc": "IPS Black 2K 60Hz, contrast 2000:1, USB-C 90W, KVM switch. Giải pháp văn phòng cao cấp.",
        "vars": [
            {"sku":"DELL-U2724-27","price":10990000,"disc":None,"stock":7,"default":True,
             "attrs":{"Màn hình":'27"',"Độ phân giải":"2K (2560x1440)","Tần số quét":"60Hz"}},
        ]
    },
    {
        "name": "AOC 24G2SP 24\" FHD 165Hz", "slug": "aoc-24g2sp-24-fhd-165hz",
        "cat": "man-hinh", "price": 3490000, "featured": True,
        "desc": "IPS FHD 165Hz 1ms, giá cực tốt cho gaming entry-level. Màu IPS đẹp hơn TN, phản hồi nhanh.",
        "vars": [
            {"sku":"AOC24G2-165","price":3490000,"disc":2990000,"stock":15,"default":True,
             "attrs":{"Màn hình":'24"',"Độ phân giải":"Full HD (1920x1080)","Tần số quét":"165Hz"}},
        ]
    },
]

# ─── 4. TẠO SẢN PHẨM ──────────────────────────────────────────
print("\n📦 Tạo sản phẩm...")
p_new = v_new = 0

for pd in products_data:
    cat = cats[pd["cat"]]
    prod, created = Product.objects.get_or_create(
        slug=pd["slug"],
        defaults={
            "name":        pd["name"],
            "category":    cat,
            "base_price":  pd["price"],
            "featured":    pd.get("featured", False),
            "status":      True,
            "description": pd.get("desc", ""),
        }
    )
    if created:
        p_new += 1
        print(f"  ✅ {pd['name']}")
    else:
        print(f"  ⚠️  {pd['name']} (đã có)")

    for var in pd["vars"]:
        variation, vcreated = ProductVariation.objects.get_or_create(
            sku=var["sku"],
            defaults={
                "product":        prod,
                "price":          var["price"],
                "discount_price": var.get("disc"),
                "stock_quantity": var.get("stock", 10),
                "is_default":     var.get("default", False),
                "status":         True,
            }
        )
        if vcreated:
            v_new += 1
            for attr_name, attr_val in var.get("attrs", {}).items():
                if attr_name in avals and attr_val in avals[attr_name]:
                    VariationAttribute.objects.get_or_create(
                        product_variation=variation,
                        attribute_value=avals[attr_name][attr_val],
                    )

# ─── 5. Set giảm giá thêm cho nổi bật ────────────────────────
print("\n💰 Cập nhật giảm giá cho sản phẩm nổi bật...")
for prod in Product.objects.filter(featured=True):
    for var in prod.variations.filter(discount_price__isnull=True, is_default=True):
        var.discount_price = round(float(var.price) * 0.9)
        var.save()

# ─── 6. KẾT QUẢ ───────────────────────────────────────────────
print("\n" + "="*55)
print("🎉 HOÀN THÀNH!")
print("="*55)
print(f"  📁 Danh mục:     {Category.objects.count()} danh mục")
print(f"  💻 Sản phẩm:     {Product.objects.count()} sản phẩm ({p_new} mới)")
print(f"  🔧 Biến thể:     {ProductVariation.objects.count()} biến thể ({v_new} mới)")
print(f"  🏷️  Thuộc tính:  {AttributeType.objects.count()} loại")
print(f"  🔥 Nổi bật:      {Product.objects.filter(featured=True).count()} sản phẩm")
print(f"  💰 Có giảm giá:  {ProductVariation.objects.filter(discount_price__isnull=False).count()} biến thể")
print("="*55)
print("👉 http://localhost:3000")
