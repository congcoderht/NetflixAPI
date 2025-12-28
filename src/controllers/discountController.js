const DiscountService = require("../services/DiscountService");

class DiscountController {

    static async create(req, res, next) {
        try {
            const {code, discount_type, value, min_order_value, max_discount, start_date, end_date} = req.body;

            const result = await DiscountService.create(req.body);

            res.status(201).json(result);

        }catch(error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const {discount_type, value, min_order_value, max_discount, start_date, end_date} = req.body;            

            const id = req.params.id;

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json( {
                    success: false,
                    message: "Không có dữ liệu để cập nhật"
                });
            }

            

            const result = await DiscountService.update({
                id, 
                discount_type, 
                value, 
                min_order_value,
                max_discount, 
                start_date, 
                end_date
            });

            res.status(200).json(result);

        }catch(error) {
            next(error);
        }
    }
}

module.exports = DiscountController;