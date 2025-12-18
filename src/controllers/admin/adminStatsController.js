const DashboardStatsService = require('../../services/DashboardStatsService');
const RevenueStatsService = require('../../services/RevenueStatsService');


class AdminStatsController {

    static async getDashboardOverview(req, res, next) {
        try {
            const result = await DashboardStatsService.getOverview();

            res.status(200).json(result);
        }catch(error) {
            next(error);
        }
    }

    static async getRevenueOverview(req, res, next) {
        try {
            const result = await RevenueStatsService.getOverview();

            res.status(200).json(result);
        }catch(error) {
            next(error);
        }
    }
}

module.exports = AdminStatsController;