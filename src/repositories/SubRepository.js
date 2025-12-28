const {execute} = require("../config/database");

class SubRepository {

    static async findByUserId(id) {
        let query = `
            SELECT s.*, us.is_active, us.start_date, us.end_date
            FROM Subscription_plans AS s
            JOIN User_subscriptions AS us
                ON s.plan_id = us.plan_id
            WHERE us.user_id = ? 
            ORDER BY us.end_date DESC 
        `
        const result = await execute(query, [id]);
        return result.recordset;
    }

    static async getUserCurrentSub(userId) {
        let query = `
            SELECT s.plan_id, s.name, s.price, s.description, u.start_date, u.end_date, u.is_active
            FROM User_subscriptions AS u
            LEFT JOIN Subscription_plans AS s ON s.plan_id = u.plan_id
            WHERE u.user_id = ? 
                AND u.is_active = 1
                AND u.end_date > GETDATE()
        `;
        const result = await execute(query, [userId]);
        return result.recordset[0];
    }

    static async findAllPlans() {
        const query = `
            SELECT
                plan_id AS planId,
                name,
                price,
                durations,
                description
            FROM Subscription_plans
            ORDER BY price ASC
        `;
        const result = await execute(query);
        return result.recordset || [];
    }
}

module.exports = SubRepository;