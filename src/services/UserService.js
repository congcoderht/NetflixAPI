const UserRepository = require('../repositories/UserRepository');
const { hashPassword } = require('../utils/password');

/**
 * Service Layer - Business Logic Layer
 * Chịu trách nhiệm xử lý logic nghiệp vụ, validation, và điều phối giữa Repository và Controller
 */
class UserService {
  // Lấy tất cả users
  static async getAllUsers() {
    try {
      const users = await UserRepository.findAll();
      return {
        success: true,
        data: users
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách users: ${error.message}`);
    }
  }

  // Lấy user theo ID
  static async getUserById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID không hợp lệ');
      }

      const user = await UserRepository.findById(id);
      
      if (!user) {
        return {
          success: false,
          message: 'Không tìm thấy user',
          data: null
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin user: ${error.message}`);
    }
  }

  // Tạo user mới
  static async createUser(userData) {
    try {
      const { name, email, password } = userData;

      // Validation
      if (!name || !email || !password) {
        throw new Error('Vui lòng điền đầy đủ thông tin (name, email, password)');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Email không hợp lệ');
      }

      // Kiểm tra email đã tồn tại chưa
      const emailExists = await UserRepository.emailExists(email);
      if (emailExists) {
        throw new Error('Email đã được sử dụng');
      }

      // Validate password length
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Tạo user
      const newUser = await UserRepository.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword
      });

      return {
        success: true,
        message: 'User được tạo thành công',
        data: newUser
      };
    } catch (error) {
      throw new Error(`Lỗi khi tạo user: ${error.message}`);
    }
  }

  // Cập nhật user
  static async updateUser(id, userData) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID không hợp lệ');
      }

      // Kiểm tra user có tồn tại không
      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'Không tìm thấy user',
          data: null
        };
      }

      const { name, email } = userData;

      // Validation
      if (name !== undefined && !name.trim()) {
        throw new Error('Tên không được để trống');
      }

      if (email !== undefined) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Email không hợp lệ');
        }

        // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
        const emailExists = await UserRepository.emailExists(email, id);
        if (emailExists) {
          throw new Error('Email đã được sử dụng bởi user khác');
        }
      }

      // Cập nhật user
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.trim().toLowerCase();

      const updatedUser = await UserRepository.update(id, updateData);

      return {
        success: true,
        message: 'User được cập nhật thành công',
        data: updatedUser
      };
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật user: ${error.message}`);
    }
  }

  // Xóa user
  static async deleteUser(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID không hợp lệ');
      }

      // Kiểm tra user có tồn tại không
      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'Không tìm thấy user',
          data: null
        };
      }

      // Xóa user
      const deleted = await UserRepository.delete(id);
      
      if (!deleted) {
        throw new Error('Không thể xóa user');
      }

      return {
        success: true,
        message: 'User được xóa thành công'
      };
    } catch (error) {
      throw new Error(`Lỗi khi xóa user: ${error.message}`);
    }
  }
}

module.exports = UserService;

