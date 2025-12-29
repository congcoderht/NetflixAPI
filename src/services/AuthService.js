const UserRepository = require('../repositories/UserRepository');
const { comparePassword, hashPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const SubRepository = require('../repositories/SubRepository');
const config = require('../config/env');

/**
 * Service Layer - Authentication Logic
 */
class AuthService {
  /**
   * Đăng ký user mới
   */
  static async register(username, email, password, full_name) {
    try {

      if (!username || !email || !password) {
        return { success: false, message: "Vui lòng điền đầy đủ thông tin!" };
      }

      if (username.trim().length < 2) {
        return { success: false, message: "Tên quá ngắn!" };
      }

      // validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: "Email không hợp lệ" };
      }

      //check email exists
      const emailExists = await UserRepository.emailExists(email);
      if (emailExists) {
        return { success: false, message: "Email đã được sử dụng" };
      }

      //check username
      const usernameExists = await UserRepository.existUsername(username) 
      if(usernameExists) {
        return { success: false, message: "username đã được sử dụng" };
      }

      if (password.length < 6) {
        return { success: false, message: "Mật khẩu phải có ít nhất 6 kí tự" };
      }

      const { hashPassword } = require("../utils/password");
      const hashedPassword = await hashPassword(password);

      const newUser = await UserRepository.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        full_name: full_name,
        role: "USER",
      });

      // remove password in response
      delete newUser.password;

      return {
        success: true,
        message: "Đăng ký thành công",
        data: {
          user: newUser,
        },
      };

    } catch (error) {
      console.error("Register error:", error);
      throw new Error(`Lỗi khi đăng ký: ${error.message}`);
    }
  }

  /**
   * Đăng nhập user
   */
  static async login(email, password) {
    try {

      // Validation
      if (!email || !password) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Vui lòng nhập email và mật khẩu",
        };
      }

      // Tìm user theo email
      const user = await UserRepository.findByEmail(email.trim().toLowerCase());
      
      if (!user) {
        return {
          success: false,
          code: "EMAIL_NOT_FOUND",
          message: "Email Không tồn tại"
        };
      }

      // So sánh password
      const isPasswordValid = await comparePassword(password, user.password);
      
      if (!isPasswordValid) {
         return {
          success: false,
          code: "INVALID_PASSWORD",
          message: "Mật khẩu không chính xác"
        };
      }

      //kiểm tra status (ACTIVE/ LOCKED)
      if(user.status === "LOCKED"){
        return {
          success: false,
          code: "LOCKED",
          message: "Tài khoản đã bị khóa"
        };
      }

      // Tạo JWT token
      const token = generateToken({
        id: user.user_id,
        email: user.email,
        role: user.role.toLowerCase(),
      });

      // Loại bỏ password và role khỏi response
      const userResponse = {
        id: user.user_id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status
      };

      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: userResponse,
          access_token: token,
          expires_in: config.jwt.expiresIn
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
      const user = await UserRepository.findByIdPublic(userId);
      
      if (!user) {
        throw new Error('Không tìm thấy user');
      }

      return user;

    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin user: ${error.message}`);
    }
  }

  /**
   * Dổi mật khẩu user
   */
  static async changePassword(userId, current_password, new_password) {
    try {
      const user = await UserRepository.findById(userId);

      if(!user){
        return {
          success: false,
          message: "Không tìm thấy người dùng"
        }
      }

      const isPasswordValid = await comparePassword(current_password, user.password);
      if(!isPasswordValid){
        return {
          success: false,
          message: "Mật khẩu cũ không chính xác"
        }
      }

      const hashedNewPassword = await hashPassword(new_password);

      await UserRepository.updatePassword(userId, hashedNewPassword);

      return {
        success: true,
        message: "Đổi mật khẩu thành công"
      };

    }catch(error){
      throw new Error(`lỗi đổi mật khẩu: ${error.message}`);
    }
  }
}

module.exports = AuthService;



