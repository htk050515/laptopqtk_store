# 💻 LaptopQTK — Hệ thống bán laptop trực tuyến

> Web thương mại điện tử chuyên bán laptop, tích hợp AI chatbot tư vấn thông minh, hệ thống gợi ý sản phẩm và thanh toán VNPay.

---

## 🧑‍💻 Thông tin nhóm

| Thành viên           | MSSV         | Vai trò                  |
| -------------------- | ------------ | ------------------------ |
| Hoàng Trọng Khôi     | DTC235200411 | Trưởng Nhóm `<hr/>`      |
| Nguyễn Hữu Quỳnh     | DTC235200634 | Thành Viên               |
| Nông Hồng Thiện      | DTC235200715 | Thành Viên               |

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   Frontend      │  HTTP  │    Backend      │  SQL   │    Database     │
│  React + Vite   │◄──────►│ Django REST API │◄──────►│  MySQL (XAMPP)  │
│  localhost:3000 │        │  localhost:8000 │        │   port: 3306    │
└─────────────────┘        └────────┬────────┘        └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │   Claude AI API  │
                           │  (Anthropic)     │
                           └─────────────────┘
```

---

## ⚙️ Yêu cầu hệ thống

| Công cụ     | Phiên bản |
| ------------- | ----------- |
| Python        | 3.11+       |
| Node.js       | 18+         |
| XAMPP (MySQL) | 8.0+        |
| pip           | 23+         |
| npm           | 9+          |

---

## 🚀 Hướng dẫn cài đặt và chạy

### Bước 1 — Chuẩn bị Database

1. Mở **XAMPP Control Panel** → Start **MySQL**
2. Vào **http://localhost/phpmyadmin**
3. Tạo database mới:

```sql
CREATE DATABASE ecommerce_laptop_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 2 — Cài đặt Backend (Django)

```bash
# Di chuyển vào thư mục backend
cd BE/laptop_store

# Tạo và kích hoạt môi trường ảo
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Cài thư viện
pip install -r requirements.txt
pip install anthropic
```

### Bước 3 — Cấu hình môi trường

Tạo file `.env` trong thư mục `BE/laptop_store/`:

```env
SECRET_KEY=django-insecure-laptopqtk-secret-key-2024
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.mysql
DB_NAME=ecommerce_laptop_store
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306

ANTHROPIC_API_KEY=sk-ant-api03-xxxx   # Lấy tại console.anthropic.com
DOMAIN_CLIENT=http://localhost:3000

VNP_TMN_CODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:8000/api/vnpay-return
```

### Bước 4 — Khởi tạo Database

```bash
# Tạo bảng
python manage.py migrate

# Tạo tài khoản admin
python manage.py createsuperuser

# Nạp dữ liệu mẫu (16 laptop thực tế)
python seed_data.py
```

### Bước 5 — Chạy Backend

```bash
python manage.py runserver
# Backend chạy tại: http://localhost:8000
```

### Bước 6 — Cài đặt và chạy Frontend

```bash
# Mở terminal mới
cd FE/laptop-store

# Cài thư viện
npm install

# Tạo file .env
echo "VITE_API_URL=http://localhost:8000" > .env

# Chạy frontend
npm run dev
# Frontend chạy tại: http://localhost:3000
```

---

## 📁 Cấu trúc thư mục

```
ecommerce_laptop_store/
├── BE/laptop_store/              # Backend Django
│   ├── apps/
│   │   ├── accounts/             # Xác thực, quản lý user
│   │   ├── catalog/              # Sản phẩm, danh mục, thuộc tính
│   │   ├── cart/                 # Giỏ hàng
│   │   ├── orders/               # Đơn hàng, hóa đơn
│   │   ├── reviews/              # Đánh giá sản phẩm
│   │   ├── recommendations/      # Gợi ý sản phẩm AI
│   │   ├── chatbot/              # Chatbot Claude AI
│   │   └── dashboard/            # Thống kê admin
│   ├── laptop_store/             # Cấu hình Django
│   ├── requirements.txt
│   ├── manage.py
│   └── seed_data.py              # Script nạp dữ liệu mẫu
│
└── FE/laptop-store/              # Frontend React
    ├── src/
    │   ├── components/           # Header, Footer, ChatWidget...
    │   ├── pages/
    │   │   ├── Admin/            # Dashboard, quản lý sản phẩm...
    │   │   └── User/             # Trang chủ, sản phẩm, đặt hàng...
    │   ├── api/                  # Gọi API backend
    │   └── constants/            # Config, đường dẫn
    └── package.json
```

---

## 🗄️ Cơ sở dữ liệu — Các bảng chính

| Bảng                    | Mô tả                                    |
| ------------------------ | ------------------------------------------ |
| `users`                | Tài khoản người dùng (customer/admin) |
| `auth_tokens`          | Token xác thực Bearer                    |
| `categories`           | Danh mục sản phẩm                       |
| `products`             | Sản phẩm laptop                          |
| `product_variations`   | Biến thể sản phẩm (RAM/SSD khác nhau) |
| `product_images`       | Ảnh sản phẩm                            |
| `attribute_types`      | Loại thuộc tính (RAM, CPU, GPU...)      |
| `attribute_values`     | Giá trị thuộc tính                     |
| `variation_attributes` | Quan hệ biến thể - thuộc tính         |
| `cart_items`           | Giỏ hàng                                 |
| `orders`               | Đơn hàng                                |
| `order_items`          | Chi tiết đơn hàng                      |
| `invoices`             | Hóa đơn thanh toán                     |
| `reviews`              | Đánh giá sản phẩm                     |

---

## 🌟 Tính năng nổi bật

### Phía khách hàng

- Xem danh sách, tìm kiếm, lọc sản phẩm theo danh mục/giá/thuộc tính
- Xem chi tiết sản phẩm, chọn cấu hình (RAM/SSD)
- Thêm vào giỏ hàng, đặt hàng, thanh toán VNPay
- Đánh giá sản phẩm sau mua
- **AI Chatbot** tư vấn chọn laptop theo nhu cầu và ngân sách
- **Gợi ý sản phẩm** thông minh dựa trên lịch sử xem

### Phía Admin

- Dashboard thống kê: doanh thu, đơn hàng, tồn kho, người dùng
- CRUD sản phẩm, danh mục, thuộc tính
- Quản lý đơn hàng, cập nhật trạng thái
- Quản lý đánh giá, phản hồi khách hàng
- Quản lý tài khoản khách hàng

---

## 🔌 API Endpoints chính

| Method   | Endpoint                 | Mô tả               |
| -------- | ------------------------ | --------------------- |
| POST     | `/api/auth/login`      | Đăng nhập          |
| POST     | `/api/auth/register`   | Đăng ký            |
| GET      | `/api/products`        | Danh sách sản phẩm |
| GET      | `/api/products/{id}`   | Chi tiết sản phẩm  |
| GET      | `/api/categories`      | Danh mục             |
| GET/POST | `/api/cart`            | Giỏ hàng            |
| POST     | `/api/orders`          | Đặt hàng           |
| POST     | `/api/chatbot/message` | Chatbot AI            |
| GET      | `/api/admin/dashboard` | Thống kê admin      |

---

## 🤖 Tính năng AI

### Chatbot tư vấn thông minh

- Sử dụng **Claude claude-sonnet-4-20250514** (Anthropic)
- Hiểu tiếng Việt tự nhiên: "laptop gaming dưới 20 triệu RAM 16GB"
- Gợi ý sản phẩm từ database thực tế
- Phân tích giá theo VNĐ (triệu, tr, củ)

### Hệ thống gợi ý (Recommendations)

- Theo dõi tương tác người dùng
- Gợi ý sản phẩm tương tự
- Sản phẩm phổ biến

---

## 🧪 Test tài khoản

| Vai trò | Email           | Mật khẩu |
| -------- | --------------- | ---------- |
| Admin    | admin@gmail.com | Admin@123  |

---

## 📞 Liên hệ

- Email: contact@laptopqtk.vn
- Website: http://localhost:3000
