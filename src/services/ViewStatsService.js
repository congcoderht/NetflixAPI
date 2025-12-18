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
}

module.exports = ViewStatsService;