const OrderRepository = require("../repositories/OrderRepository");

class RevenueStatsService {

    static async getOverview() {
        
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