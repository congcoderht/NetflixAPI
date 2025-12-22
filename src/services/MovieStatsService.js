const CastMemberRepository = require('../repositories/CastMemberRepository');
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

    static async getMostWatchTime() {
        try {
            const result = MovieRepository.findMostWatchTime();

            return result;
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách phim có tổng thời gian xem cao nhất: ${error}`);
        }
    }

    static async getMostWatchedMembers() {
        try {
            const result = CastMemberRepository.findMostWatchedMembers();

            return result;
        }catch(error) {
            throw new Error(`Lỗi khi lấy diễn viên được xem nhiều nhất`)
        }
    }
}

module.exports = MovieStatsService;