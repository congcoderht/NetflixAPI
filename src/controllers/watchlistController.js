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
}

module.exports = WatchListController;