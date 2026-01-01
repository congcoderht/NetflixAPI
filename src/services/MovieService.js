const MovieRepository = require('../repositories/MovieRepository');

class MovieService {

    static async getMovies(filters) {
        const { page = 1, limit = 10 } = filters;

        const data = await MovieRepository.findAll({
            ...filters,
            page,
            limit
        });

        console.log("check movies: ", data);

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
        return (genres || []).map(g => ({ genreId: g.id, name: g.name }));
    }

    // Create a new genre
    static async createGenre(name) {
        if (!name || !name.trim()) {
            throw new Error('Genre name is required');
        }
        const genreId = await MovieRepository.createGenre(name.trim());
        return { genreId: genreId, name: name.trim() };
    }

    // Create a new cast member
    static async createCastMember(name, birthday) {
        if (!name || !name.trim()) {
            throw new Error('Member name is required');
        }
        const memberId = await MovieRepository.createCastMember({ name: name.trim(), birthday });
        return { memberId, name: name.trim(), birthday };
    }

    // Get all cast members
    static async getAllCastMembers() {
        const members = await MovieRepository.findAllCastMembers();
        return (members || []).map(m => ({ memberId: m.memberId, name: m.name, birthday: m.birthday }));
    }

    static async createMovie(payload) {
        // basic validation
        if (!payload || !payload.title) throw new Error('title is required');

        const movieId = await MovieRepository.createMovie({
            title: payload.title,
            description: payload.description || null,
            releaseyear: payload.release_year || null,
            posterUrl: payload.poster_url || null,
            bannerUrl: payload.banner_url || null,
            trailerUrl: payload.trailer_url || null,
            movieUrl: payload.url_phim || null
        });

        // link genres by ID (genres already created via POST /genres)
        if (Array.isArray(payload.genres)) {
            for (const g of payload.genres) {
                if (g.genres_id) {
                    await MovieRepository.linkGenreToMovie(movieId, Number(g.genres_id));
                }
            }
        }

        // link cast members by ID (members already created via POST /members)
        if (Array.isArray(payload.cast_and_crew)) {
            for (const c of payload.cast_and_crew) {
                if (c.member_id) {
                    await MovieRepository.linkAttend(movieId, Number(c.member_id), c.role || null);
                }
            }
        }

        return { movieId };
    }

    // Update existing movie and re-link genres and cast/crew
    static async updateMovie(movieId, payload) {
        if (!movieId || Number(movieId) <= 0) throw new Error('Invalid movie id');
        if (!payload) throw new Error('Payload is required');

        await MovieRepository.updateMovie(Number(movieId), {
            title: payload.title || null,
            description: payload.description || null,
            releaseyear: payload.release_year || null,
            posterUrl: payload.poster_url || null,
            bannerUrl: payload.banner_url || null,
            trailerUrl: payload.trailer_url || null,
            movieUrl: payload.url_phim || null
        });

        // remove existing links
        await MovieRepository.removeGenresLinks(Number(movieId));
        await MovieRepository.removeAttendLinks(Number(movieId));

        // re-link genres
        if (Array.isArray(payload.genres)) {
            for (const g of payload.genres) {
                if (g.genres_id) {
                    await MovieRepository.linkGenreToMovie(Number(movieId), Number(g.genres_id));
                }
            }
        }

        // re-link cast members
        if (Array.isArray(payload.cast_and_crew)) {
            for (const c of payload.cast_and_crew) {
                if (c.member_id) {
                    await MovieRepository.linkAttend(Number(movieId), Number(c.member_id), c.role || null);
                }
            }
        }

        return { movieId: Number(movieId) };
    }
    
    // Soft delete or restore movie
    static async toggleDeleteMovie(movieId) {
    const affected = await MovieRepository.toggleDeleteMovie(movieId);

    if (affected === 0) {
        return {
            success: false,
            message: "Không tìm thấy phim"
        };
    }

    return {
        success: true,
        message: "Đã thay đổi trạng thái xóa phim"
    };
    }


}

module.exports = MovieService;