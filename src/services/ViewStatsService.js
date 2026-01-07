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
            const [today, thisWeek, thisMonth, lastMonth, thisYear] = await Promise.all([
                UserHistoryRepository.countViewsToday(),
                UserHistoryRepository.countViewsThisWeek(),
                UserHistoryRepository.countViewsThisMonth(),
                UserHistoryRepository.countViewsLastMonth(),
                UserHistoryRepository.countViewThisYear()
            ])

            return {
                today,
                thisWeek,
                thisMonth,
                lastMonth, 
                thisYear
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy báo cáo lượt xem: ${error}`);
        }
    }
}

module.exports = ViewStatsService;