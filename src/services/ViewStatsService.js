const UserHistoryRepository = require("../repositories/UserHistoryRepository");

class ViewStatsService {

    static async getTodayViews() {
        try {
            const todayViews = await UserHistoryRepository.countViewsToday();

            return todayViews;
        }catch(error) {
            throw new Error(`Lỗi khi lấy tổng số lượt xem trong ngày: ${eror}`);
        }
    }

    static async getOverview() {
        try {
            const [today, this_week, this_month, last_Month, this_year] = await Promise.all([
                UserHistoryRepository.countViewsToday(),
                UserHistoryRepository.countViewsThisWeek(),
                UserHistoryRepository.countViewsThisMonth(),
                UserHistoryRepository.countViewsLastMonth(),
                UserHistoryRepository.countViewThisYear()
            ])

            return {
                today,
                this_week,
                this_month,
                last_Month, 
                this_year
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy báo cáo lượt xem: ${error}`);
        }
    }
}

module.exports = ViewStatsService;