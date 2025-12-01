const UserRepository = require('../repositories/UserRepository');
const { comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

/**
 * Service Layer - Authentication Logic
 */
class AuthService {
  /**
   * Đăng ký user mới
   */
  static async register(userData) {
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

      // Hash password và tạo user
      const { hashPassword } = require('../utils/password');
      const hashedPassword = await hashPassword(password);

      const newUser = await UserRepository.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword
      });

      // Tạo JWT token
      const token = generateToken({
        id: newUser.id,
        email: newUser.email
      });

      // Loại bỏ password khỏi response
      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        message: 'Đăng ký thành công',
        data: {
          user: userWithoutPassword,
          token
        }
      };
    } catch (error) {
      throw new Error(`Lỗi khi đăng ký: ${error.message}`);
    }
  }

  /**
   * Đăng nhập
   */
  static async login(email, password) {
    try {
      // Validation
      if (!email || !password) {
        throw new Error('Vui lòng nhập email và mật khẩu');
      }

      // Tìm user theo email
      const user = await UserRepository.findByEmail(email.trim().toLowerCase());
      
      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // So sánh password
      const isPasswordValid = await comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Tạo JWT token
      const token = generateToken({
        id: user.id,
        email: user.email
      });

      // Loại bỏ password khỏi response
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: userWithoutPassword,
          token
        }
      };
    } catch (error) {
      throw new Error(`Lỗi khi đăng nhập: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin user hiện tại từ token
   */
  static async getCurrentUser(userId) {
    try {
      const user = await UserRepository.findById(userId);
      
      if (!user) {
        throw new Error('Không tìm thấy user');
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin user: ${error.message}`);
    }
  }
}

module.exports = AuthService;



