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

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = MovieService;