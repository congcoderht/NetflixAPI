const OrderRepository = require('../repositories/OrderRepository');
const UserHistoryService = require('../services/ViewStatsService');
const MovieStatsService = require('./MovieStatsService');

class RevenueStatsService {

    static async getOverview() {
        const [subscriptionsRevenue, viewsOverTime, mostWatchTimeMovies] = await Promise.all([
            this.getSubscriptionsRevenue(),
            UserHistoryService.getOverview(),
            MovieStatsService.getMostWatchTime(),
        ])
        return {
            success: true,
            subscriptionsRevenue,
            viewsOverTime,
            mostWatchTimeMovies
        }
    }

    static async getSubscriptionsRevenue() {
        try {
            const [today, this_week, this_month, last_Month, this_year] = await Promise.all([
               OrderRepository.sumRevenueToday(),
               OrderRepository.sumRevenueThisWeek(),
               OrderRepository.sumRevenueThisMonth(),
               OrderRepository.sumRevenueLastMonth(),
               OrderRepository.sumRevenueThisYear()
           ]);

           return {
                today,
                this_week,
                this_month,
                last_Month,
                this_year
           }
        }catch(error) {
            throw new Error(`Lỗi khi lấy doanh thu gói đăng kí: ${error}`);
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