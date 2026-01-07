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
            SELECT s.plan_id, s.name, s.price, s.description, u.start_date, u.end_date, u.is_active, datediff(day, GETDATE(), u.end_date) AS left_day
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
                plan_id,
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

    // Check if user has active subscription for a specific plan
    static async getUserActivePlanSubscription(userId, planId) {
        const query = `
            SELECT u.user_id, u.plan_id, s.name, s.price, u.start_date, u.end_date, u.is_active
            FROM User_subscriptions u
            LEFT JOIN Subscription_plans s ON s.plan_id = u.plan_id
            WHERE u.user_id = ? 
                AND u.plan_id = ?
                AND u.is_active = 1
                AND u.end_date > GETDATE()
        `;
        const result = await execute(query, [userId, planId]);
        return result.recordset[0] || null;
    }

    // Get plan price
    static async getPlanPrice(planId) {
        const query = `
            SELECT price
            FROM Subscription_plans
            WHERE plan_id = ?
        `;
        const result = await execute(query, [planId]);
        return result.recordset[0] ? result.recordset[0].price : 0;
    }

    // Get plan with duration
    static async getPlanWithDuration(planId) {
        const query = `
            SELECT plan_id, name, price, durations
            FROM Subscription_plans
            WHERE plan_id = ?
        `;
        const result = await execute(query, [planId]);
        return result.recordset[0] || null;
    }

    // Update user subscription end_date (gia hạn)
    static async updateUserSubscriptionEndDate(userId, planId, newEndDate) {
        const query = `
            UPDATE User_subscriptions
            SET end_date = ?
            WHERE user_id = ? AND plan_id = ?
        `;
        await execute(query, [newEndDate, userId, planId]);
    }

    // Create new user subscription (when user registers new plan)
    static async createUserSubscription(userId, planId, startDate, endDate) {
        const query = `
            INSERT INTO User_subscriptions (user_id, plan_id, start_date, end_date, is_active)
            VALUES (?, ?, ?, ?, 1)
        `;
        await execute(query, [userId, planId, startDate, endDate]);
    }
}

module.exports = SubRepository;