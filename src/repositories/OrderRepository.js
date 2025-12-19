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

    // lấy doanh thu theo ngày trong tháng hiện tại
    static async revenueByDayInCurrentMonth() {
        let query = `
            SELECT CAST(paid_at AS DATE) as date, SUM(amount) AS revenue
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
            SELECT SUM(amount) AS total
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

            SELECT SUM(amount) AS total
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
            SELECT SUM(amount) AS total
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
            SELECT SUM(amount) AS total
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
            SELECT SUM(amount) AS total
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