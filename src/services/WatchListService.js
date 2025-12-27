const { deleteMovie } = require('../controllers/watchlistController');
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

    static async deleteMovie({userId, movieId}) {
        try {
            const existingMovie = await WatchListRepository.isMovieInWatchlist(userId, movieId);

            if(!existingMovie) {
                return {
                    success: false,
                    message: "không tìm thấy movie_id trong watchlist"
                }
            }

            const result = await WatchListRepository.deleteByMovieId(userId, movieId);

            return {
                success: true,
                message: "Xóa phim khỏi danh sách thành công"
            }

        }catch(error) {
            throw new Error(`Lỗi khi xóa movie khỏi watchlist: ${error}`)
        }
    }

    static async addMovie({userId, movieId}) {
        try {
            const existingMovie = await WatchListRepository.isMovieInWatchlist(userId, movieId);

            if(existingMovie) {
                return {
                    success: false,
                    message: "Phim đã nằm trong danh sách yêu thích rồi"
                }
            }

            const result = await WatchListRepository.addMovie(userId, movieId);

            return {
                success: true,
                message: "Thêm phim vào danh sách yêu thích thành công"
            }
        }catch(error) {
            throw new Error(`Lỗi khi thêm movie vào watchlist: ${error}`)
        }
    }
}

module.exports = WatchListService;