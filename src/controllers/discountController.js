const DiscountService = require("../services/DiscountService");

class DiscountController {

    static async create(req, res, next) {
        try {
            const {code, discountType, value, minOrderValue, maxDiscount, startDate, endDate} = req.body;

            const result = await DiscountService.create(req.body);

            res.status(201).json(result);

        }catch(error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const {discountType, value, minOrderValue, maxDiscount, startDate, endDate} = req.body;            

            const id = req.params.id;

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json( {
                    success: false,
                    message: "Không có dữ liệu để cập nhật"
                });
            }

            const result = await DiscountService.update({
                id, 
                discountType, 
                value, 
                minOrderValue,
                maxDiscount, 
                startDate, 
                endDate
            });

            res.status(200).json(result);

        }catch(error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const {page = 1, limit = 10, search = ''} = req.query;

            let pageNumber = Number(page);
            let limitNumber = Number(limit);

            if (!Number.isInteger(pageNumber)) {
                pageNumber = 1;
            }

            if (!Number.isInteger(limitNumber) || limitNumber < 1) {
                limitNumber = 10;
            }

            const {discounts, total, page: currentPage, limit:currentLimit} = await DiscountService.getAll({
                page: pageNumber,
                limit: limitNumber,
                search
            });

            const totalPages = Math.ceil(total / currentLimit);

            return res.status(200).json({
                success: true,
                data: discounts,
                pagination: {
                    page: currentPage,
                    limit: currentLimit,
                    total,
                    totalPages
                }
            })

        }catch(error) {
            next(error);
        }
    }

    static async getAvailableForUser(req, res, next) {
        try {
            const userId = req.user && req.user.id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthenticated' });

            const discounts = await DiscountService.getAvailableForUser(userId);
            return res.status(200).json({
                 success: true,
                 message: discounts.length > 0 ? 'Danh sách mã giảm giá khả dụng' : 'Không có mã giảm giá khả dụng',
                 data: discounts });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DiscountController;