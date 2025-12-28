const OrderRepository = require("../repositories/OrderRepository");

class OrderService {

    static async getOrderHistory(id) {
        try {
            const orders = await OrderRepository.findByUserId(id);

            if(orders.length === 0) {
                return {
                    success: true,
                    message: "Người dùng chưa có đơn hàng nào"
                }
            }

            return {
                success: true,
                data: orders
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy lịch sử đơn hàng: ${error}`);
        }
    }

    static async getAll({page, limit, search, status, planId}) {
        try {
            limit = Math.min(limit, 50);

            const offset = (page - 1) * limit;

            const {rows, total} = await OrderRepository.findAll({
                offset,
                limit,
                search,
                status, 
                planId
            });

            return {
                rows,
                total,
                page,
                limit
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy tất cả đơn hàng: ${error}`)
        }
    }

    static async updateStatus({orderId, status}) {
        try{
            const existingOrder = await OrderRepository.existOrder(orderId);

            if(!existingOrder) {
                return {
                    success: false,
                    message: "Không tìm thấy order_id"
                }
            }

            // if(status )
        }catch(error) {
            throw new Error(`Lỗi khi lấy tất cả đơn hàng: ${error}`)
        }
    }
}

module.exports = OrderService;