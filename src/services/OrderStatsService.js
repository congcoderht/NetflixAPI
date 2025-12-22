const OrderRepository = require('../repositories/OrderRepository');

class OrderStatsService {
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
}

module.exports = OrderStatsService;