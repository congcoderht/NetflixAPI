const SubRepository = require("../repositories/SubRepository");

class UserSubService {

    static async getCurrentSub(userId) {
        try {
            const current_sub = await SubRepository.getUserCurrentSub(userId);

            return current_sub;
        }catch(error) {
            throw new Error(`Lỗi khi lấy gói đang sử dụng: ${error}`);
        }
    }
}

module.exports = UserSubService;