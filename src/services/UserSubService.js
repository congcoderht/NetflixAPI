const SubRepository = require("../repositories/SubRepository");

class UserSubService {

    static async getCurrentSub(userId) {
        try {
            const current_sub = await SubRepository.getUserCurrentSub(userId);

            const response = {
                planId: current_sub.plan_id,
                name: current_sub.name,
                price: current_sub.price,
                description: current_sub.description,
                startDate: current_sub.start_date,
                endDate: current_sub.end_date,
                isActive: current_sub.is_active,
                leftDay: current_sub.left_day,
            };

            return response;
        }catch(error) {
            throw new Error(`Lỗi khi lấy gói đang sử dụng: ${error}`);
        }
    }
}

module.exports = UserSubService;