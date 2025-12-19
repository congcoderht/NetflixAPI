const OrderRepository = require("../repositories/OrderRepository");

class RevenueStatsService {

    static async getOverview() {
        const [subscriptionsRevenue] = await Promise.all([
            this.getSubscriptionsRevenue()
        ])
        return {
            success: true,
            subscriptionsRevenue
        }
    }

    static async getSubscriptionsRevenue() {
        try {
            const [today, this_week, this_month, last_Month] = await Promise.all([
               OrderRepository.sumRevenueToday(),
               OrderRepository.sumRevenueThisWeek(),
               OrderRepository.sumRevenueThisMonth(),
               OrderRepository.sumRevenueLastMonth()
           ]);

           return {
                today,
                this_week,
                this_month,
                last_Month,
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