const { execute } = require('../config/database');

class OrderRepository {

    // lấy tất cả đơn hàng theo user_id xếp theo ngày mới nhất
    static async findByUserId(id) {
        let query = `
            SELECT 
                o.order_id, 
                o.order_code, 
                o.order_type, 
                o.status, 
                o.amount, 
                o.paid_at, 
                s.*, 
                d.discount_id, 
                o.discount_amount, 
                o.final_amount
            FROM Orders AS o
            LEFT JOIN Subscription_plans AS s
                ON s.plan_id = o.plan_id
            LEFT JOIN Discounts AS d
                ON o.discount_id = d.discount_id
            WHERE o.user_id = ?
            ORDER BY o.paid_at DESC
        `;
        const result = await execute(query, [id]);
        return result.recordset;
    }

    static async findAll({offset, limit, search, status, planId}) {
        let where = 'WHERE 1=1'

        const params = [];

        if(search) {
            where += 'AND (u.full_name LIKE ? OR u.email LIKE ? OR s.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if(status) {
            where += 'AND o.status = ?';
            params.push(`${status}`)
        }

        if(planId) {
            where += 'AND s.plan_id = ?';
            params.push(`${planId}`);
        }

        const dataQuery = `
            SELECT
            o.order_id,
            o.user_id,
            u.full_name,
            u.email,
            o.order_code, 
            o.order_type, 
            o.status, 
            o.amount, 
            o.paid_at, 
            s.*, 
            d.discount_id, 
            o.discount_amount, 
            o.final_amount
            FROM Orders AS o
            LEFT JOIN Subscription_plans AS s
                ON s.plan_id = o.plan_id
            LEFT JOIN Discounts AS d
                ON o.discount_id = d.discount_id
            JOIN [User] AS u
                ON u.user_id = o.user_id
            ${where}
            ORDER BY o.paid_at DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY 
        `;

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM Orders AS o
            LEFT JOIN Subscription_plans AS s
                ON s.plan_id = o.plan_id
            LEFT JOIN Discounts AS d
                ON o.discount_id = d.discount_id
            JOIN [User] AS u
                ON u.user_id = o.user_id
            ${where}
        `;

        const dataResult = await execute(dataQuery, [...params, offset, limit]);
        const countResult = await execute(countQuery, params);

        return {
            rows: dataResult.recordset,
            total: countResult.recordset[0].total
        }
    }

    // cập nhật trạng thái đơn hàng
    static async updateStatus({orderId, status}) {
        let query = `
            UPDATE Orders SET status = ? WHERE order_id = ?
        `;

        await execute(query, [status, orderId]);
    }

    // kiểm tra xem order_id có tồn tại hay không
    static async existOrder({orderId}) {
        let query = `
            SELECT TOP 1 1
            FROM Orders
            WHERE order_id = ?
        `;

        const result = await execute(query, [orderId]);
        return result.recordset.length > 0;
    }

    // lấy doanh thu theo ngày trong tháng hiện tại
    static async revenueByDayInCurrentMonth() {
        let query = `
            SELECT CAST(paid_at AS DATE) as date, COALESCE(SUM(amount), 0) AS revenue
            FROM Orders
            WHERE status = 'COMPLETED'
                AND paid_at >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                AND paid_at < DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
            GROUP BY CAST(paid_at AS DATE)
            ORDER BY date
        `;
        const result = await execute(query);
        return result.recordset;
    }

    // lấy doanh thu của ngày hiện tại
    static async sumRevenueToday() {
        let query = `
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM Orders 
            WHERE status = 'PAID'
                AND paid_at >= CAST(GETDATE() AS DATE)
                AND paid_at < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
        `;
        const result = await execute(query);
        return result.recordset[0].total;
    }

    // lấy doanh thu của tuần hiện tại
    static async sumRevenueThisWeek() {
        let query = `
            SET DATEFIRST 1;

            SELECT COALESCE(SUM(amount), 0) AS total
            FROM Orders 
            WHERE status = 'PAID'
               AND paid_at >= DATEADD(DAY, 1 - DATEPART(WEEKDAY, CAST(GETDATE() AS DATE)), CAST(GETDATE() AS DATE))
        `;
        const result = await execute(query);
        return result.recordset[0].total;
    }

    //lấy doanh thu của tháng hiện tại
    static async sumRevenueThisMonth() {
        let query = `
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM Orders
            WHERE status = 'PAID'
                AND paid_at >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                AND paid_at <  DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
        `;
        const result = await execute(query);
        return result.recordset[0].total;
    }

    // lấy doanh thu của tháng trước
    static async sumRevenueLastMonth() {
        let query = `
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM Orders
            WHERE status = 'PAID'
                AND paid_at >= DATEADD(
                    MONTH, 
                    -1, 
                    DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                )
                AND paid_at < DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
        `;
        const result = await execute(query);
        return result.recordset[0].total;
    }
    // lấy doanh thu của năm hiện tại
    static async sumRevenueThisYear() {
        let query = `
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM Orders 
            WHERE status = 'PAID'
                AND paid_at >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
                AND paid_at <= DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1)
        `;
        const result = await execute(query);
        return result.recordset[0].total;
    }

    // tạo đơn hàng
    static async createOrder({userId, planId, discountId, originalAmount, discountAmount, finalAmount, orderType}) {
        const orderCode = 'ORD' + Math.floor(Date.now() / 1000);
        const query = `
            INSERT INTO Orders (user_id, plan_id, order_code, order_type, amount, discount_id, discount_amount, final_amount, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', GETDATE());
            SELECT SCOPE_IDENTITY() AS order_id;
        `;
        const result = await execute(query, [userId, planId, orderCode, orderType, originalAmount, discountId || null, discountAmount, finalAmount]);
        return result.recordset[0] ? result.recordset[0].order_id : null;
    }

    // lấy chi tiết đơn hàng theo orderId
    static async getOrderDetail(orderId) {
        const query = `
            SELECT
                o.order_id,
                o.order_code,
                o.user_id,
                o.plan_id,
                s.name AS plan_name,
                s.price AS plan_price,
                o.order_type,
                o.amount AS original_amount,
                d.code AS discount_code,
                o.discount_id,
                o.discount_amount,
                o.final_amount,
                o.status,
                o.created_at
            FROM Orders o
            LEFT JOIN Subscription_plans s ON o.plan_id = s.plan_id
            LEFT JOIN Discounts d ON o.discount_id = d.discount_id
            WHERE o.order_id = ?
        `;
        const result = await execute(query, [orderId]);
        return result.recordset[0];
    }

    // Cập nhật thông tin mã giảm giá cho đơn hàng
    static async updateOrderDiscount(orderId, discountId, discountAmount, finalAmount) {
        const query = `
            UPDATE Orders
            SET discount_id = ?, discount_amount = ?, final_amount = ?
            WHERE order_id = ?
        `;
        await execute(query, [discountId, discountAmount, finalAmount, orderId]);
    }

    // Get order detail with plan duration for subscription update
    static async getOrderDetailWithPlan(orderId) {
        const query = `
            SELECT
                o.order_id,
                o.order_code,
                o.user_id,
                o.plan_id,
                s.name AS plan_name,
                s.price AS plan_price,
                s.durations,
                o.order_type,
                o.amount AS original_amount,
                d.code AS discount_code,
                o.discount_id,
                o.discount_amount,
                o.final_amount,
                o.status,
                o.created_at
            FROM Orders o
            LEFT JOIN Subscription_plans s ON o.plan_id = s.plan_id
            LEFT JOIN Discounts d ON o.discount_id = d.discount_id
            WHERE o.order_id = ?
        `;
        const result = await execute(query, [orderId]);
        return result.recordset[0];
    }

    // Update order status
    static async updateOrderStatus(orderId, status) {
        const query = `
            UPDATE Orders
            SET status = ?
            WHERE order_id = ?
        `;
        await execute(query, [status, orderId]);
    }

}

module.exports = OrderRepository;