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
}

module.exports = MovieService;