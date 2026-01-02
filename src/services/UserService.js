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

      const users = rows.map(user => ({
        userId: user.user_id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        gender: user.gender,
        birthday: user.birthday,
      }));

      return {
        users,
        total,
        page,
        limit
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

      const userResponse = {
        userId: user.user_id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        gender: user.gender,
        birthday: user.birthday,
      } 

      const [orders, subscriptions, history] = await Promise.all([
        OrderRepository.findByUserId(id),
        SubRepository.findByUserId(id),
        UserHistoryRepository.findByUserId(id),
      ]);

      const mapOrderResponse = (order) => ({
        orderId: order.order_id,
        orderCode: order.order_code,
        orderType: order.order_type,
        status: order.status,
        amount: order.amount,
        paidAt: order.paid_at,
        planId: order.plan_id,
        planName: order.name,
        planPrice: order.price,
        durations: order.durations,
        description: order.description,
        discountId: order.discount_id,
        discountAmount: order.discount_amount,
        finalAmount: order.final_amount,
      });

      const mapSubscriptionResponse = (sub) => ({
        planId: sub.plan_id,
        name: sub.name,
        price: sub.price,
        durations: sub.durations,
        description: sub.description,
        isActive: sub.is_active,
        startDate: sub.start_date,
        endDate: sub.end_date,
      });

      const mapHistoryResponse = (h) => ({
        movieId: h.movie_id,
        isDone: h.is_done,
        time: h.time,
        lastWatchedAt: h.last_watched_at,
      });

      const ordersResponse = orders.map(mapOrderResponse);
      const subscriptionsResponse = subscriptions.map(mapSubscriptionResponse);
      const historyResponse = history.map(mapHistoryResponse);

      return {
        success: true,
        data: {
          userResponse,
          subscriptions: subscriptionsResponse || [],
          orders: ordersResponse || [],
          history: historyResponse || [],
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
  static async updateProfile(id, payload) {
    try {

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

      const updatedUser = await UserRepository.updateProfile(id, payload);

      if(!updatedUser) {
        throw new Error("Không thể cập nhật User");
      }

      const userResponse = {
        userId: updatedUser.user_id,
        fullName: updatedUser.full_name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.created_at,
        gender: updatedUser.gender,
        phoneNumber: updatedUser.phone_number,
        birthday: updatedUser.birthday,
      };

      return {
        success: true,
        message: "Cập nhật hồ sơ thành công",
        data: userResponse,
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

      const updatedUser = await UserRepository.updateStatus(id, newStatus);

      const userResponse = {
        userId: updatedUser.user_id,
        fullName: updatedUser.full_name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.created_at,
        gender: updatedUser.gender,
        phoneNumber: updatedUser.phone_number,
        birthday: updatedUser.birthday,
      };

      return {
        success: true,
        message: "Cập nhật User thành công",
        data: userResponse
      }
    }catch(error){
      throw new Error(`Lỗi khi cập nhật trạng thái User: ${error.message}`);
    }
    
  }
}

module.exports = UserService;

