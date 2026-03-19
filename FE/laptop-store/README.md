# Laptop Store

Website bán gấ trực tuyến được xây dựng bằng React và Django

## Yêu cầu hệ thống

- Node.js phiên bản 16.x trở lên
- npm hoặc yarn

## Cài đặt

1. Clone dự án về máy:

```bash
git clone <repository-url>
cd phone-store
```

2. Cài đặt các dependencies:

```bash
npm install
```

hoặc nếu sử dụng yarn:

```bash
yarn install
```

## Cách chạy dự án

### Chạy ở môi trường development:

```bash
npm run dev
```

hoặc:

```bash
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## Công nghệ sử dụng

- **React** - Thư viện JavaScript để xây dựng giao diện người dùng
- **Vite** - Build tool và dev server
- **React Router** - Quản lý routing
- **Tailwind CSS** - Framework CSS
- **Axios** - HTTP client
- **SweetAlert2** - Thư viện hiển thị thông báo
- **FontAwesome** - Thư viện icon

## Cấu trúc dự án

```
phone-store/
├── src/
│   ├── api/           # API calls
│   ├── components/    # React components
│   ├── pages/         # Pages/Views
│   ├── constants/     # Hằng số và cấu hình
│   └── utils/         # Utilities
├── public/            # Static files
└── package.json
```

## Danh sách trang và chức năng

### 🌐 Trang công khai (Public Pages)

Những trang này có thể truy cập mà không cần đăng nhập.

#### 1. Trang chủ (`/`)

- Hiển thị banner quảng cáo sản phẩm
- Danh sách sản phẩm nổi bật
- Combo gấu bông khuến mãi
- Câu chuyện thương hiệu
- Dịch vụ cửa hàng

#### 2. Chi tiết sản phẩm (`/products/:productId`)

- Xem thông tin chi tiết sản phẩm
- Thư viện ảnh sản phẩm
- Chọn thuộc tính (màu sắc, kích thước, v.v.)
- Chọn số lượng
- Thêm vào giỏ hàng
- Xem đánh giá và bình luận
- Bảng thuộc tính sản phẩm
- Thông tin cửa hàng

#### 3. Sản phẩm theo danh mục (`/category/:categoryId`)

- Xem danh sách sản phẩm theo từng danh mục
- Lọc và sắp xếp sản phẩm

#### 4. Tìm kiếm sản phẩm (`/search`)

- Tìm kiếm sản phẩm theo từ khóa
- Hiển thị kết quả tìm kiếm

#### 5. Đăng nhập (`/login`)

- Đăng nhập cho khách hàng và admin
- Xác thực người dùng

#### 6. Trang lỗi (`/error`)

- Hiển thị thông báo lỗi 404 hoặc lỗi khác

---

### 👤 Trang khách hàng (Customer Pages)

Yêu cầu đăng nhập với tài khoản khách hàng.

#### 1. Giỏ hàng (`/cart`)

- Xem danh sách sản phẩm trong giỏ
- Cập nhật số lượng sản phẩm
- Xóa sản phẩm khỏi giỏ
- Tính tổng tiền tạm tính
- Chuyển sang trang đặt hàng

#### 2. Đặt hàng (`/checkout`)

- Nhập thông tin giao hàng:
  - Họ tên
  - Số điện thoại
  - Địa chỉ (Tỉnh/Thành phố, Quận/Huyện, Xã/Phường)
  - Địa chỉ cụ thể
  - Ghi chú đơn hàng
- Xem thông tin đơn hàng
- Tính phí vận chuyển
- Tổng cộng thanh toán
- Xác nhận đặt hàng

#### 3. Lịch sử đơn hàng (`/history-order`)

- Xem danh sách tất cả đơn hàng đã đặt
- Chi tiết từng đơn hàng
- Trạng thái đơn hàng (Chờ xử lý, Đang giao, Hoàn thành, Đã hủy)
- Theo dõi tiến trình đơn hàng

#### 4. Kiểm tra thanh toán (`/check-payment-status`)

- Kiểm tra trạng thái thanh toán qua VNPAY
- Xử lý callback từ cổng thanh toán

#### 5. Hồ sơ cá nhân (`/profile`)

- Xem và chỉnh sửa thông tin cá nhân
- Quản lý tài khoản

---

### 🔐 Trang quản trị (Admin Pages)

Yêu cầu đăng nhập với tài khoản admin.

#### 1. Dashboard/Thống kê (`/dashboard`)

- Tổng quan doanh thu
- Thống kê đơn hàng
- Biểu đồ và báo cáo
- Số liệu kinh doanh

#### 2. Quản lý danh mục (`/admin/categories`)

- Xem danh sách danh mục sản phẩm
- Thêm danh mục mới
- Chỉnh sửa danh mục
- Xóa danh mục

#### 3. Quản lý sản phẩm (`/admin/products`)

- Xem danh sách tất cả sản phẩm
- Thêm sản phẩm mới
- Chỉnh sửa thông tin sản phẩm
- Xóa sản phẩm
- Quản lý thuộc tính sản phẩm
- Upload ảnh sản phẩm

#### 4. Quản lý thuộc tính (Type) (`/admin/type-attributes`)

- Quản lý loại thuộc tính (màu sắc, kích thước, chất liệu, v.v.)
- Thêm loại thuộc tính mới
- Chỉnh sửa loại thuộc tính
- Xóa loại thuộc tính

#### 5. Quản lý giá trị thuộc tính (`/admin/value-attributes`)

- Quản lý giá trị cho từng loại thuộc tính (Đỏ, Xanh, S, M, L, v.v.)
- Thêm giá trị mới
- Chỉnh sửa giá trị
- Xóa giá trị

#### 6. Quản lý người dùng (`/admin/users`)

- Xem danh sách người dùng
- Quản lý thông tin người dùng
- Phân quyền (admin/customer)
- Khóa/Mở khóa tài khoản

#### 7. Quản lý đánh giá (`/admin/reviews`)

- Xem tất cả đánh giá và bình luận
- Duyệt/Ẩn đánh giá
- Xóa bình luận vi phạm

#### 8. Quản lý hóa đơn (`/admin/invoices`)

- Xem danh sách tất cả đơn hàng
- Chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng
- Xử lý đơn hàng (xác nhận, hủy, hoàn thành)
- Xuất hóa đơn

---

## Tính năng chính

### Phía khách hàng:

✅ Xem và tìm kiếm sản phẩm
✅ Lọc sản phẩm theo danh mục
✅ Xem chi tiết sản phẩm với nhiều thuộc tính
✅ Thêm sản phẩm vào giỏ hàng
✅ Quản lý giỏ hàng (thêm, xóa, cập nhật số lượng)
✅ Đặt hàng với thông tin giao hàng đầy đủ
✅ Tích hợp thanh toán VNPAY
✅ Theo dõi lịch sử đơn hàng
✅ Đánh giá và bình luận sản phẩm
✅ Quản lý thông tin cá nhân

### Phía quản trị:

✅ Dashboard thống kê doanh thu
✅ Quản lý sản phẩm (CRUD) với thuộc tính
✅ Quản lý danh mục sản phẩm
✅ Quản lý thuộc tính sản phẩm (màu sắc, size, v.v.)
✅ Quản lý người dùng và phân quyền
✅ Quản lý đơn hàng và cập nhật trạng thái
✅ Quản lý đánh giá và bình luận
✅ Upload và quản lý hình ảnh sản phẩm

---

## API Integration

Ứng dụng sử dụng các API được tổ chức theo module:

- **Public API**: API công khai (không cần xác thực)

  - Lấy danh sách sản phẩm
  - Chi tiết sản phẩm
  - Danh mục sản phẩm
  - Tìm kiếm
- **User API**: API dành cho khách hàng

  - Quản lý giỏ hàng
  - Tạo đơn hàng
  - Lịch sử đơn hàng
  - Thông tin cá nhân
  - Đánh giá sản phẩm
- **Admin API**: API dành cho quản trị viên

  - Quản lý sản phẩm
  - Quản lý danh mục
  - Quản lý người dùng
  - Quản lý đơn hàng
  - Thống kê
  - Quản lý thuộc tính sản phẩm
