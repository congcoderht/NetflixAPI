const CastMemberRepository = require('../repositories/CastMemberRepository');
const MovieRepository = require('../repositories/MovieRepository');

class MovieStatsService {

    static async getTotal() {
        try {
            const result = await MovieRepository.countTotal();

            return result;
        }catch(error) {
            throw new Error(`Lỗi khi lấy tổng số phim: ${error}`);
        }
    }

    static async getMostWatch() {
        try {
            const result = await MovieRepository.findMostView();

            const moviesResponse = result.map(movie => ({
                movieId: movie.movie_id,
                title: movie.title,
                description: movie.description,
                releaseYear: movie.release_year,
                posterUrl: movie.poster_url,
                trailerUrl: movie.trailer_url,
                movieUrl: movie.url_phim,
                bannerUrl: movie.banner_url,
                totalViews: movie.total_views,
                isDeleted: movie.is_deleted,
            }));

            return moviesResponse;
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách phim được xem nhiều: ${error}`);
        }
    }

    static async getHighRating() {
        try {
            const result = await MovieRepository.findHighRating();

            const moviesResponse = result.map(movie => ({
                movieId: movie.movie_id,
                title: movie.title,
                description: movie.description,
                releaseYear: movie.release_year,
                posterUrl: movie.poster_url,
                trailerUrl: movie.trailer_url,
                movieUrl: movie.url_phim,
                bannerUrl: movie.banner_url,
                isDeleted: movie.is_deleted,
                avgRating: movie.avg_rating,
                ratingCount: movie.rating_count
            }));

            return moviesResponse;
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách phim được đánh giá cao nhất: ${error}`);
        }
    }

    static async getMostWatchTime() {
        try {
            const result = await MovieRepository.findMostWatchTime();

            const moviesResponse = result.map(movie => ({
                movieId: movie.movie_id,
                title: movie.title,
                description: movie.description,
                releaseYear: movie.release_year,
                posterUrl: movie.poster_url,
                trailerUrl: movie.trailer_url,
                movieUrl: movie.url_phim,
                bannerUrl: movie.banner_url,
                isDeleted: movie.is_deleted,
                avgRating: movie.avg_rating,
                ratingCount: movie.rating_count
            }));

            return moviesResponse;
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách phim có tổng thời gian xem cao nhất: ${error}`);
        }
    }

    static async getMostWatchedMembers() {
        try {
            const result = await CastMemberRepository.findMostWatchedMembers();

            const membersRespose = result.map(mem => ({
                memberId: mem.member_id,
                name: mem.name,
                birthday: mem.birthday,
                totalWatch: mem.total_watch
            }))

            return membersRespose;
        }catch(error) {
            throw new Error(`Lỗi khi lấy diễn viên được xem nhiều nhất`)
        }
    }
}

module.exports = MovieStatsService;