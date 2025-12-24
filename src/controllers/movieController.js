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

    static async getMovieDetail(req, res) {
        try {
            const { id } = req.params;
            const movieId = Number(id);

            if (!movieId || movieId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid movie ID"
                });
            }

            const movie = await MovieService.getMovieDetail(movieId);

            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found"
                });
            }

            res.json({
                success: true,
                data: movie
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