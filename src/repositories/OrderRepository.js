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
            WHERE status = 'PAID'
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

}

module.exports = OrderRepository;