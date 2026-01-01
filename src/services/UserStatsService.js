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

        const userResponse = newUsers.map(user => ({
            userId: user.user_id,
            fullName: user.full_name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            createdAt: user.created_at,
            gender: user.gender,
            phoneNumber: user.phone_number,
            birthday: user.birthday,
        }));

        return userResponse;
    }catch(error) {
        throw new Error(`Lỗi khi lấy danh sách Users mới nhất: ${error}`);
    }
   }

   static async getTodayNewUsers() {
    try {
        const todayNewUsers = await UserRepository.countTodayNewUsers();

        return todayNewUsers;
    }catch(error) {
        throw new Error(`Lỗi khi lấy danh sách người dùng mới trong ngày ${error}`)
    }

   }
}

module.exports = UserStatsService;