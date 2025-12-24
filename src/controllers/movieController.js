const MovieService = require('../services/MovieService');

class MovieController {

    static async getMovies(req, res) {
        try {
            const {
                page,
                limit,
                genreId,
                title,
                releaseYear
            } = req.query;

            const result = await MovieService.getMovies({
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                genreId,
                title,
                releaseYear
            });

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = MovieController;