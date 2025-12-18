const UserRepository = require('../repositories/UserRepository');
const OrderRepository = require('../repositories/OrderRepository');
const SubRepository = require('../repositories/SubRepository');
const { hashPassword } = require('../utils/password');
const UserHistoryRepository = require('../repositories/UserHistoryRepository');
const { generateOrderCode } = require('../utils/orderCode');

/**
 * Service Layer - Business Logic Layer
 * Chịu trách nhiệm xử lý logic nghiệp vụ, validation, và điều phối giữa Repository và Controller
 */

const MAX_LIMIT = 50;

class UserService {
  // Lấy tất cả users
  static async getAllUsers(params) {
    try {
      let {search, page, limit, status} = params;
      
      page = Math.max(1, page);
      limit = Math.min(limit , MAX_LIMIT);

      const offset = (page - 1) * limit;

      const {rows, total} = await UserRepository.findAll({
        search, 
        page,
        limit,
        status,
        offset
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          items: rows,
          pagination: {
            page,
            limit,
            totalItems: total,
            totalPages
          }
        }
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách users: ${error.message}`);
    }
  }

  // Lấy user theo ID
  static async getDetailedUserById(id) {
    try {
      const user = await UserRepository.findByIdPublic(id);
      
      if (!user) {
        return {
          success: false,
          message: 'Không tìm thấy user',
          data: null
        };
      }

      const [orders, subscriptions, history] = await Promise.all([
        OrderRepository.findByUserId(id),
        SubRepository.findByUserId(id),
        UserHistoryRepository.findByUserId(id),
      ]);

      return {
        success: true,
        data: {
          user,
          subscriptions: subscriptions || [],
          orders: orders || [],
          history: history || [],
        }
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin user: ${error.message}`);
    }
  }
  static async getUserById(id) {
    try {
      const user = await UserRepository.findByIdPublic(id);
      
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

  // cập nhật profile
  static async updateProfile(id, userData) {
    try {
      const {full_name, avatar} = userData;
      const existingUser = await UserRepository.findById(id);

      if(!existingUser) {
        return {
          success: false,
          message: "User Không tồn tại"
        };
      }

      if (existingUser.status === 'LOCKED') {
        return {
          success: false,
          message: 'Tài khoản đã bị khóa'
        };
      }

      if (full_name !== undefined) {
        if (typeof full_name !== 'string') {
          return {
            success: false,
            message: 'Họ tên không hợp lệ'
          };
        }

         if (full_name.trim() === '') {
          return {
            success: false,
            message: 'Họ tên không được để trống'
          }
        };
      }

      const updateData = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (avatar !== undefined) updateData.avatar = avatar;

      const updateUser = await UserRepository.updateProfile(id, updateData);

      if(!updateUser) {
        throw new Error("Không thể cập nhật User");
      }

      return {
        success: true,
        message: "Cập nhật hồ sơ thành công",
        data: updateUser
      }
    }catch(error) {
      throw new Error(`Lỗi khi cập nhật User: ${error}`);
    }
  }


  // khóa / mở khóa User
  static async updateStatus(id) {
    try {
      const existingUser = await UserRepository.findById(id);

      if(!existingUser) {
        return {
          success: false,
          message: "User không tồn tại"
        }
      }

      const newStatus = existingUser.status === "ACTIVE" ? "LOCKED" : "ACTIVE";

      const updateUser = await UserRepository.updateStatus(id, newStatus);

      return {
        success: true,
        message: "Cập nhật User thành công",
        data: updateUser
      }
    }catch(error){
      throw new Error(`Lỗi khi cập nhật trạng thái User: ${error.message}`);
    }
    
  }
}

module.exports = UserService;

