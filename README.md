#  WEBSITE BÁN LAPTOP & LINH KIỆN MÁY TÍNH

**Công nghệ:** React (Frontend) + Django (Backend)

---

##  1. Giới thiệu dự án

Đây là hệ thống website thương mại điện tử chuyên bán laptop và linh kiện máy tính, được xây dựng theo kiến trúc **Frontend - Backend tách biệt**:

* **Frontend:** ReactJS (UI/UX, tương tác người dùng)
* **Backend:** Django + Django REST Framework (API, xử lý nghiệp vụ)
* **Database:** PostgreSQL / MySQL

---

##  2. Mục tiêu

* Xây dựng hệ thống bán hàng đầy đủ chức năng
* Tối ưu trải nghiệm người dùng
* Hỗ trợ quản lý sản phẩm, đơn hàng, người dùng
* Có thể triển khai thực tế

---

##  3. Chức năng chính

###  Người dùng (Customer)

* Đăng ký / Đăng nhập / Đăng xuất
* Xem danh sách sản phẩm
* Tìm kiếm & lọc sản phẩm
* Xem chi tiết sản phẩm
* Thêm vào giỏ hàng
* Đặt hàng
* Theo dõi đơn hàng

###  Quản trị viên (Admin)

* Quản lý sản phẩm (CRUD)
* Quản lý danh mục
* Quản lý đơn hàng
* Quản lý người dùng
* Thống kê doanh thu

---

##  4. Kiến trúc hệ thống

```
Frontend (React)
        ↓ API (REST)
Backend (Django REST Framework)
        ↓
Database (PostgreSQL/MySQL)
```

---

##  5. Cấu trúc thư mục

### Backend (Django)

```
backend/
│── manage.py
│── requirements.txt
│── config/
│── apps/
│   ├── users/
│   ├── products/
│   ├── orders/
│   └── cart/
```

### Frontend (React)

```
frontend/
│── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── redux/ (optional)
│   └── App.js
│── package.json
```

---

##  6. Cài đặt & chạy dự án

###  Clone Repo
git clone https://github.com/htk050515/laptopqtk_store.git
cd laptopqtk_store

###  Backend (Django)

cd BE/laptop_store                                                                                                                                                   
  python -m venv venv
  source venv/Scripts/activate    # Windows Git Bash (Linux/Mac: source venv/bin/activate)
  pip install -r requirements.txt             

Sau đó:                                                                                                                                                                python manage.py migrate
  python manage.py runserver  
  
###  Frontend (React)

  cd FE/laptop 
  npm install                                                                                                                                                          
                                                                                                                                                                       
  Tạo file .env:
  # FE/laptop-store/.env
  PORT=3000
  REACT_APP_API_URL=http://localhost:8000

  npm run dev

## 🔗 7. API chính

| Method | Endpoint          | Mô tả                  |
| ------ | ----------------- | ---------------------- |
| GET    | /api/products     | Lấy danh sách sản phẩm |
| GET    | /api/products/:id | Chi tiết sản phẩm      |
| POST   | /api/auth/login   | Đăng nhập              |
| POST   | /api/orders       | Tạo đơn hàng           |
| GET    | /api/orders       | Lấy đơn hàng           |

---

##  8. Xác thực & bảo mật

* JWT Authentication
* Phân quyền (User / Admin)
* Bảo vệ API bằng token

---

##  9. Cơ sở dữ liệu (Ví dụ)

### Product

* id
* name
* price
* description
* stock
* image
* category

### Order

* id
* user
* total_price
* status
* created_at

---

##  10. Công nghệ sử dụng

* ReactJS
* Django
* Django REST Framework
* MySQL
* Axios

---

## 11. Hướng phát triển

* Tích hợp thanh toán online (VNPay, Momo)
* Thêm đánh giá sản phẩm
* Chat hỗ trợ khách hàng
* Tối ưu SEO
* Triển khai Docker

---

##  12. Tác giả

* Hoàng Trọng Khôi - Nguyễn Hữu Quỳnh - Nông Hồng Thiện
* Công nghệ: React + Django

---

## 13. License

Dự án phục vụ mục đích học tập và nghiên cứu.
