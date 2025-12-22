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
            totalMovies,
            MostWatchedMovies,
            HighestRatedMovies,
            revenueByDayinCurrentMonth
        ] = await Promise.all([
            UserStatsService.getTotalUsers(),
            UserStatsService.getTodayNewUsers(),
            UserStatsService.getNewUsers(),
            ViewStatsService.getTodayViews(),
            MovieStatsService.getTotal(),
            MovieStatsService.getMostWatch(),
            MovieStatsService.getHighRating(),
            RevenueStatsService.getRevenueByDayinCurrentMonth(),
        ]);

        return {
            success: true,
            totalUsers,
            totalTodayNewUsers,
            newUsers,
            todayViews,
            totalMovies,
            MostWatchedMovies,
            HighestRatedMovies,
            revenueByDayinCurrentMonth
        }
    }
}

module.exports = DashboardStatsService;