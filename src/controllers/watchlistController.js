const WatchListService = require("../services/WatchListService");

class WatchListController {
    static async getByUserId(req, res, next) {
        try {
            const id = req.user.id;

            const {page = 1, limit = 10} = req.query;

            let pageNumber = Number(page);
            let limitNumber = Number(limit);

            const {rows, total, page: currentPage, limit: currentLimit} = await WatchListService.getByUserId({
                id, 
                page: pageNumber,
                limit: limitNumber
            });

            const totalPages = Math.ceil(total / currentLimit);

            res.status(200).json({
                success: true,
                movies: rows,
                pagination: {
                    page: currentPage,
                    limit: currentLimit,
                    total: total,
                    totalPages: totalPages
                }
            })
        }catch(error) {
            next(error);
        }
    }
    
    static async deleteMovie(req, res, next) {
        try {
            const movieId = Number(req.params.id);
            const userId = req.user.id;

            const result = await WatchListService.deleteMovie({userId, movieId});

            if(!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);
        }catch(error) {
            next(error);
        }
    }

    static async addMovie(req, res, next) {
        try {
            const movieId = Number(req.params.id);

            const userId = req.user.id;

            const result = await WatchListService.addMovie({userId, movieId});

            if(!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);
        }catch(error) {
            next(error);
        }
    }
}

module.exports = WatchListController;