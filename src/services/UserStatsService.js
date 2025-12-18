const UserRepository = require('../repositories/UserRepository');

class UserStatsService {
   static async getTotalUsers() {
    try {
        const totalUsers = await UserRepository.getTotal();

        return totalUsers;
    }catch(error) {
        throw new Error(`Lỗi khi lấy tổng Users: ${error}`);
    }
   }

   static async getNewUsers() {
    try {
        const newUsers = await UserRepository.findNewUsers();

        return newUsers;
    }catch(error) {
        throw new Error(`Lỗi khi lấy danh sách Users mới nhất: ${error}`);
    }
   }

   static async getTodayNewUsers() {
    try {
        const todayNewUsers = await UserRepository.findTodayNewUsers();

        return todayNewUsers;
    }catch(error) {
        throw new Error(`Lỗi khi lấy danh sách người dùng mới trong ngày ${error}`);
    }

   }
}

module.exports = UserStatsService;