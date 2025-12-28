const MovieRepository = require('../repositories/MovieRepository');

class MovieService {

    static async getMovies(filters) {
        const { page = 1, limit = 10 } = filters;

        const data = await MovieRepository.findAll({
            ...filters,
            page,
            limit
        });

        const total = await MovieRepository.findTotal(filters);

        // Map repository result to DTO shape
        const mappedData = (data || []).map(item => ({
            movieId: item.movie_id,
            title: item.title,
            description: item.description,
            releaseYear: item.release_year,
            posterUrl: item.poster_url,
            bannerUrl: item.banner_url,
            avgRating: item.avg_rating,
            genres: item.genres && item.genres.length > 0
                ? item.genres.split(',').map(g => g.trim())
                : []
        }));

        return {
            data: mappedData,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getMovieDetail(movieId) {
        const movie = await MovieRepository.GetDetails(movieId);
        
        if (!movie) {
            return null;
        }

        const actors = await MovieRepository.getActorsByMovieId(movieId);

        // Map to DTO shape
        return {
            movieId: movie.movie_id,
            title: movie.title,
            description: movie.description,
            releaseYear: movie.release_year,
            posterUrl: movie.poster_url,
            bannerUrl: movie.banner_url,
            trailerUrl: movie.trailer_url,
            urlPhim: movie.url_phim,
            avgRating: movie.avg_rating,
            genres: movie.genres && movie.genres.length > 0
                ? movie.genres.split(',').map(g => g.trim())
                : [],
            actors: (actors || []).map(actor => ({
                memberId: actor.member_id,
                name: actor.name,
                role: actor.role
            }))
        };
    }

    static async rateMovie(userId, movieId, number) {
        // validate inputs
        if (!userId || !movieId) {
            throw new Error('Invalid user or movie id');
        }

        const n = Number(number);
        if (!Number.isInteger(n) || n < 1 || n > 10) {
            throw new Error('Rating must be an integer between 1 and 10');
        }

        const result = await MovieRepository.upsertRating(userId, movieId, n);

        return {
            movieId,
            userRating: result.userRating,
            avgRating: result.avgRating,
            ratingCount: result.ratingCount
        };
    }

    static async getAllGenres() {
        const genres = await MovieRepository.findAllGenres();
        return (genres || []).map(g => ({ id: g.id, name: g.name }));
    }
}

module.exports = MovieService;