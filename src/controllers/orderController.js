const OrderService = require('../services/OrderService');

class OrderController {

    static async getOrderHistory(req, res, next) {
        try {
            const id = Number(req.user.id);

            const result = await OrderService.getOrderHistory(id);

            res.status(200).json(result);

        }catch(error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const {page = 1, limit = 10, search = '', status, planId} = req.query;

            let pageNumber = Number(page);
            let limitNumber = Number(limit);

            if (!Number.isInteger(pageNumber)) {
                pageNumber = 1;
            }

            if (!Number.isInteger(limitNumber) || limitNumber < 1) {
                limitNumber = 10;
            }

            const {rows, total, page: currentPage, limit: currentLimit} = await OrderService.getAll({
                page: pageNumber,
                limit: limitNumber,
                search,
                status,
                planId,
            });

            const totalPages = Math.ceil(total / currentLimit);

            res.status(200).json({
                success: true,
                data: {
                    orders: rows,
                    pagination: {
                        page: currentPage,
                        limit: currentLimit,
                        total: total,
                        totalPages
                    }
                }
            })
        }catch(error) {
            next(error);
        }
    }

    static async updateStatus(req, res, next) {
        try {
            const status = req.body;
            const orderId = req.params.id;

            const result = await OrderService.updateStatus({orderId, status});

            if(!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);
        }catch(error) {
            next(error);
        }
    }
}

module.exports = OrderController;