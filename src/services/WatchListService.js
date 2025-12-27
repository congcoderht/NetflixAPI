const WatchListRepository = require('../repositories/WatchListRepository');

class WatchListService {

    static async getByUserId(params) {
        try {
            const {id, page, limit} = params;
            const offset = (page - 1) * limit;

            const {rows, total} = await WatchListRepository.findByUserId({id, offset, limit});

            console.log("check rows: ", rows);

            return {rows, total, page, limit};

        }catch(error) {
            throw new Error(`Lỗi khi lấy watchlist: ${error}`);
        }
    }
}

module.exports = WatchListService;