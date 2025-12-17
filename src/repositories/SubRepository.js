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
}

module.exports = SubRepository;