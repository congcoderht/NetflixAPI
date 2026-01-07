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

    static async rateMovie(req, res) {
        try {
            const { id } = req.params;
            const movieId = Number(id);
            const { number } = req.body;
            const userId = req.user && req.user.id;

            if (!movieId || movieId <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid movie ID' });
            }

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            const result = await MovieService.rateMovie(userId, movieId, number);

            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getGenres(req, res) {
        try {
            const data = await MovieService.getAllGenres();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Create a new genre
    static async createGenre(req, res) {
        try {
            const { name } = req.body;
            const result = await MovieService.createGenre(name);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Create a new cast member
    static async createCastMember(req, res) {
        try {
            const { name, birthday } = req.body;
            const result = await MovieService.createCastMember(name, birthday);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Get all cast members
    static async getAllCastMembers(req, res) {
        try {
            const data = await MovieService.getAllCastMembers();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async createMovie(req, res) {
        try {
            const payload = req.body;
            const result = await MovieService.createMovie(payload);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async updateMovie(req, res) {
        try {
            const { id } = req.params;
            const movieId = Number(id);
            const payload = req.body;

            if (!movieId || movieId <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid movie ID' });
            }

            const result = await MovieService.updateMovie(movieId, payload);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    
    static async toggleDeleteMovie(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const result = await MovieService.toggleDeleteMovie(id);
        res.status(result.success ? 200 : 404).json(result);

    } catch (error) {
        next(error);
    }
    }
    
    // static async getTopRatedMovies(req, res) {
    //     try {
    //         const data = await MovieService.getTopRatedMovies();
    //         res.json({ success: true, data });
    //     } catch (error) {
    //         res.status(500).json({ success: false, message: error.message });
    //     }
    // }
   
}

module.exports = MovieController;