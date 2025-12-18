const RevenueStatsService = require('./RevenueStatsService');
const UserStatsService = require ('./UserStatsService');
const ViewStatsService = require('../services/ViewStatsService');

class DashboardStatsService {
    static async getOverview() {
        const [totalUsers, totalTodayNewUsers, newUsers, todayViews, revenueByDayinCurrentMonth] = await Promise.all([
            UserStatsService.getTotalUsers(),
            UserStatsService.getTodayNewUsers(),
            UserStatsService.getNewUsers(),
            ViewStatsService.getTodayViews(),
            RevenueStatsService.getRevenueByDayinCurrentMonth(),
        ]);

        return {
            success: true,
            totalUsers,
            totalTodayNewUsers,
            todayViews,
            newUsers,
            revenueByDayinCurrentMonth
        }
    }
}

module.exports = DashboardStatsService;