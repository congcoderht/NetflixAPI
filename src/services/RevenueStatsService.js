const CastMemberRepository = require('../repositories/CastMemberRepository');
const OrderRepository = require('../repositories/OrderRepository');
const UserRepository = require('../repositories/UserRepository');
const UserHistoryService = require('../services/ViewStatsService');
const MovieStatsService = require('./MovieStatsService');
const OrderStatsService = require('./OrderStatsService');

class RevenueStatsService {

    static async getOverview() {
        const [subscriptionsRevenue, totalNewUsersLast30Days, viewsOverTime, mostWatchTimeMovies, mostWatchedMembers] = await Promise.all([
            OrderStatsService.getSubscriptionsRevenue(),
            UserRepository.countNewUsersLast30Days(),
            UserHistoryService.getOverview(),
            MovieStatsService.getMostWatchTime(),
            MovieStatsService.getMostWatchedMembers(),
        ])
        return {
            success: true,
            subscriptionsRevenue,
            totalNewUsersLast30Days,
            viewsOverTime,
            mostWatchTimeMovies,
            mostWatchedMembers
        }
    }

    static async getRevenueByDayinCurrentMonth() {
        try {
            const rows = await OrderRepository.revenueByDayInCurrentMonth();

            return {
                labels: rows.map(r => r.date),
                data: rows.map(r => r.revenue) 
            };
        }catch(error) {
            throw new Error(`Lỗi khi lấy doanh thu theo ngày trong tháng hiện tại: ${error}`);
        }

    }
 }

 module.exports = RevenueStatsService;