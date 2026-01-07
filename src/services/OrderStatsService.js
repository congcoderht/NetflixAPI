const OrderRepository = require('../repositories/OrderRepository');

class OrderStatsService {
    static async getSubscriptionsRevenue() {
        try {
            const [today, thisWeek, thisMonth, lastMonth, thisYear] = await Promise.all([
               OrderRepository.sumRevenueToday(),
               OrderRepository.sumRevenueThisWeek(),
               OrderRepository.sumRevenueThisMonth(),
               OrderRepository.sumRevenueLastMonth(),
               OrderRepository.sumRevenueThisYear()
           ]);

           return {
                today,
                thisWeek,
                thisMonth,
                lastMonth,
                thisYear
           }
        }catch(error) {
            throw new Error(`Lỗi khi lấy doanh thu gói đăng kí: ${error}`);
        }
    }
}

module.exports = OrderStatsService;