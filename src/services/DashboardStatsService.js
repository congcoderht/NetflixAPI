const UserStatsService = require ('./UserStatsService');

class DashboardStatsService {
    static async getOverview() {
        const [totalUsers, newUsers, totalTodayNewUsers] = await Promise.all([
            UserStatsService.getTotalUsers(),
            UserStatsService.getNewUsers(),
            UserStatsService.getTodayNewUsers()
        ]);

        return {
            success: true,
            totalUsers,
            newUsers,
            totalTodayNewUsers
        }
    }
}

module.exports = DashboardStatsService;