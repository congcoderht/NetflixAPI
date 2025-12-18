const UserStatsService = require ('./UserStatsService');

class DashboardStatsService {
    static async getOverview() {
        const [totalUsers, newUsers] = await Promise.all([
            UserStatsService.getTotalUsers(),
            UserStatsService.getNewUsers()
        ]);

        return {
            success: true,
            totalUsers,
            newUsers,
        }
    }
}

module.exports = DashboardStatsService;