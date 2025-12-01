# Kiến trúc dự án - Repository-Service-Controller Pattern

## Tổng quan

Dự án sử dụng **Repository-Service-Controller** pattern để tách biệt các tầng logic, giúp code dễ bảo trì, test và mở rộng.

## Các tầng (Layers)

### 1. Repository Layer (`src/repositories/`)

**Trách nhiệm:**
- Tương tác trực tiếp với database
- Thực hiện các query SQL
- Không chứa business logic
- Trả về dữ liệu thô từ database

**Ví dụ:**
```javascript
// src/repositories/UserRepository.js
class UserRepository {
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}
```

### 2. Service Layer (`src/services/`)

**Trách nhiệm:**
- Chứa business logic
- Validation dữ liệu
- Xử lý nghiệp vụ
- Gọi Repository để lấy/lưu dữ liệu
- Xử lý lỗi và trả về kết quả có cấu trúc

**Ví dụ:**
```javascript
// src/services/UserService.js
class UserService {
  static async getUserById(id) {
    // Validation
    if (!id || isNaN(id)) {
      throw new Error('ID không hợp lệ');
    }

    // Gọi Repository
    const user = await UserRepository.findById(id);
    
    if (!user) {
      return { success: false, message: 'Không tìm thấy user' };
    }

    return { success: true, data: user };
  }
}
```

### 3. Controller Layer (`src/controllers/`)

**Trách nhiệm:**
- Nhận HTTP requests
- Gọi Service để xử lý
- Trả về HTTP responses
- Không chứa business logic

**Ví dụ:**
```javascript
// src/controllers/userController.js
class UserController {
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await UserService.getUserById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

## Luồng xử lý (Flow)

```
1. Client gửi request → Route
2. Route định tuyến → Controller
3. Controller nhận request → Gọi Service
4. Service xử lý logic → Gọi Repository
5. Repository query database → Trả về dữ liệu
6. Service xử lý dữ liệu → Trả về kết quả
7. Controller nhận kết quả → Trả về response cho Client
```

## Ví dụ hoàn chỉnh

### Tạo một feature mới

**Bước 1: Tạo Repository**
```javascript
// src/repositories/MovieRepository.js
class MovieRepository {
  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM movies');
    return rows;
  }
}
```

**Bước 2: Tạo Service**
```javascript
// src/services/MovieService.js
const MovieRepository = require('../repositories/MovieRepository');

class MovieService {
  static async getAllMovies() {
    try {
      const movies = await MovieRepository.findAll();
      return { success: true, data: movies };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách movies: ${error.message}`);
    }
  }
}
```

**Bước 3: Tạo Controller**
```javascript
// src/controllers/movieController.js
const MovieService = require('../services/MovieService');

class MovieController {
  static async getAllMovies(req, res, next) {
    try {
      const result = await MovieService.getAllMovies();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

**Bước 4: Tạo Routes**
```javascript
// src/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/movieController');

router.get('/', MovieController.getAllMovies);

module.exports = router;
```

**Bước 5: Đăng ký Routes**
```javascript
// src/routes/index.js
const movieRoutes = require('./movieRoutes');
router.use('/movies', movieRoutes);
```

## Lợi ích

1. **Tách biệt trách nhiệm**: Mỗi layer có trách nhiệm rõ ràng
2. **Dễ test**: Có thể test từng layer độc lập
3. **Dễ bảo trì**: Thay đổi database không ảnh hưởng đến business logic
4. **Tái sử dụng**: Service có thể được gọi từ nhiều Controller
5. **Mở rộng dễ dàng**: Thêm feature mới theo cùng pattern

## Quy tắc

- ✅ Repository chỉ chứa SQL queries
- ✅ Service chứa business logic và validation
- ✅ Controller chỉ xử lý HTTP
- ❌ Không gọi Repository trực tiếp từ Controller
- ❌ Không chứa business logic trong Repository
- ❌ Không chứa SQL queries trong Service

