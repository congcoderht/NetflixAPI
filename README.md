# Netflix API

API Node.js với SQL Server và Swagger documentation.

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Sao chép file `.env.example` thành `.env` và cập nhật thông tin:

```bash
cp .env.example .env
```

Update `.env` with:
- `DB_HOST`: Địa chỉ SQL Server (ví dụ: `localhost` hoặc `localhost\\SQLEXPRESS`)
- `DB_PORT`: Port SQL Server (mặc định `1433`, tùy chọn)
- `DB_INSTANCE`: Tên instance (nếu dùng named instance, tùy chọn)
- `DB_USER`: Tài khoản SQL Server
- `DB_PASSWORD`: Mật khẩu SQL Server
- `DB_NAME`: Tên database
- `DB_ENCRYPT`: `true/false` - bật encrypt kết nối (mặc định `false`)
- `DB_TRUST_CERT`: `true/false` - tin cậy certificate tự ký (mặc định `true`)
- `JWT_SECRET`: Khóa bí mật dùng để ký JWT (bắt buộc)
- `JWT_EXPIRES_IN`: Thời gian sống của token (ví dụ: `7d`)
- `PORT`: Port chạy server (mặc định: 3000)

### 3. Chuẩn bị SQL Server (tạo sẵn bên ngoài)


Yêu cầu:
- Database trùng tên `DB_NAME` trong `.env`.
- Tài khoản DB có quyền đọc/ghi trên database này.

### 4. Chạy ứng dụng

**Development mode (với nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 📚 API Documentation

Sau khi khởi động server, truy cập Swagger UI tại:
- http://localhost:3000/api-docs

## 🏗️ Cấu trúc thư mục

```
├── src/
│   ├── config/          # Biến môi trường, database pool, swagger
│   ├── controllers/     # Xử lý HTTP requests/responses
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer (tương tác database)
│   ├── routes/          # Định tuyến API
│   ├── middleware/      # Middleware (error handling, etc.)
│   ├── utils/           # Utilities và helpers (JWT, password, ...)
│   └── server.js        # File khởi động server
├── .env.example         # Template file môi trường
├── .gitignore
├── package.json
└── README.md
```

### Kiến trúc (Architecture Pattern)

Dự án sử dụng **Repository-Service-Controller** pattern:

- **Repository Layer** (`repositories/`): Chịu trách nhiệm tương tác trực tiếp với database. Chỉ chứa các query SQL và thao tác CRUD cơ bản.

- **Service Layer** (`services/`): Chứa business logic, validation, và xử lý nghiệp vụ. Service gọi Repository để truy xuất dữ liệu và xử lý logic trước khi trả về Controller.

- **Controller Layer** (`controllers/`): Xử lý HTTP requests và responses. Controller nhận request từ client, gọi Service để xử lý, và trả về response phù hợp.

**Luồng xử lý:**
```
Client Request → Route → Controller → Service → Repository → Database
                                                              ↓
Client Response ← Route ← Controller ← Service ← Repository ←
```

## 🗄️ Quản lý Database

- Bạn chịu trách nhiệm tạo và cập nhật schema trực tiếp trên database đã chuẩn bị.
- Ứng dụng sẽ kiểm tra kết nối ngay khi start; nếu database hoặc bảng thiếu, quá trình khởi động sẽ dừng lại với thông báo lỗi rõ ràng.

## 🔐 JWT Authentication

- Đăng ký (`POST /api/auth/register`) hoặc đăng nhập (`POST /api/auth/login`) để nhận JWT.
- Ví dụ đăng nhập:
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"password123"}'
  ```
  Phản hồi sẽ chứa `data.token`.
- Gửi token cho các request bảo vệ:
  ```bash
  curl http://localhost:3000/api/users \
    -H "Authorization: Bearer <token>"
  ```
- Middleware `authenticate` xác thực token, gắn thông tin user vào `req.user`, và trả lỗi 401 nếu token thiếu/hết hạn/không hợp lệ.
- Cấu hình JWT nằm tại `src/config/env.js` và `src/utils/jwt.js`. Luôn thiết lập `JWT_SECRET` và (tùy chọn) `JWT_EXPIRES_IN` trong `.env`.

## 🛠️ Công nghệ sử dụng

- **Express.js** - Web framework
- **mssql** - SQL Server client với Promise support
- **Swagger** - API documentation
- **Helmet** - Bảo mật HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger
- **dotenv** - Quản lý biến môi trường

## 📦 Dependencies

Xem chi tiết trong `package.json`

