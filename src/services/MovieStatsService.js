const MovieRepository = require('../repositories/MovieRepository');

class MovieStatsService {

    static async getTotal() {
        try {
            const result = MovieRepository.findTotal();

            return result;
        }catch(error) {
            throw new Error(`Lỗi khi lấy tổng số phim: ${error}`);
        }
    }

    static async getMostWatch() {
        try {
            const result = MovieRepository.findMostView();

            return result;
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách phim được xem nhiều: ${error}`);
        }
    }

    static async getHighRating() {
        try {
            const result = MovieRepository.findHighRating();

            return result;
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách phim được đánh giá cao nhất: ${error}`);
        }
    }
}

module.exports = MovieStatsService;