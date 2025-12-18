const RevenueStatsService = require('./RevenueStatsService');
const UserStatsService = require ('./UserStatsService');

class DashboardStatsService {
    static async getOverview() {
        const [totalUsers, newUsers, totalTodayNewUsers, revenueByDayinCurrentMonth] = await Promise.all([
            UserStatsService.getTotalUsers(),
            UserStatsService.getNewUsers(),
            UserStatsService.getTodayNewUsers(),
            RevenueStatsService.getRevenueByDayinCurrentMonth()
        ]);

        return {
            success: true,
            totalUsers,
            newUsers,
            totalTodayNewUsers,
            revenueByDayinCurrentMonth
        }
    }
}

module.exports = DashboardStatsService;