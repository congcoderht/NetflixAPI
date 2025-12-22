const RevenueStatsService = require('./RevenueStatsService');
const UserStatsService = require ('./UserStatsService');
const ViewStatsService = require('../services/ViewStatsService');
const MovieStatsService = require('./MovieStatsService');

class DashboardStatsService {
    static async getOverview() {
        const [
            totalUsers, 
            totalTodayNewUsers, 
            newUsers, 
            todayViews,
            MostWatchedMovies,
            revenueByDayinCurrentMonth] = await Promise.all([
            UserStatsService.getTotalUsers(),
            UserStatsService.getTodayNewUsers(),
            UserStatsService.getNewUsers(),
            ViewStatsService.getTodayViews(),
            MovieStatsService.getMostWatch(),
            RevenueStatsService.getRevenueByDayinCurrentMonth(),
        ]);

        return {
            success: true,
            totalUsers,
            totalTodayNewUsers,
            newUsers,
            todayViews,
            MostWatchedMovies,
            revenueByDayinCurrentMonth
        }
    }
}

module.exports = DashboardStatsService;