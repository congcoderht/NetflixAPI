const MovieRepository = require('../repositories/MovieRepository');

class MovieStatsService {

    static async getMostWatch() {
        try {
            const result = MovieRepository.findMostView();

            return result;
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách phim được xem nhiều: ${error}`);
        }
    }
}

module.exports = MovieStatsService;