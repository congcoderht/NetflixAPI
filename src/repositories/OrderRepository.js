const { execute } = require('../config/database');

class OrderRepository {

    // lấy tất cả đơn hàng theo user_id xếp theo ngày mới nhất
    static async findByUserId(id) {
        let query = `
            SELECT o.order_id, o.order_code, o.status, o.amount, o.paid_at, s.*
            FROM Orders AS o
            LEFT JOIN Subscription_plans AS s
                ON s.plan_id = o.plan_id
            WHERE o.user_id = ?
            ORDER BY o.paid_at DESC
        `
        const result = await execute(query, [id]);
        return result.recordset;
    }
}

module.exports = OrderRepository;