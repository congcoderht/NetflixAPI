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
            const [today, this_month] = await Promise.all([
                UserHistoryRepository.countViewsToday(),
                UserHistoryRepository.countViewsThisMonth(),
            ])

            return {
                today,
                this_month
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy báo cáo lượt xem: ${error}`);
        }
    }
}

module.exports = ViewStatsService;