const DashboardStatsService = require('../../services/DashboardStatsService');


class AdminStatsController {

    static async getDashboardOverview(req, res, next) {
        try {
            console.log(DashboardStatsService);
            const result = await DashboardStatsService.getOverview();

            res.status(200).json(result);
        }catch(error) {
            next(error);
        }
    }
}

module.exports = AdminStatsController;