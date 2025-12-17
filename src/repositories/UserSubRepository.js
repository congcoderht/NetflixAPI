const {execute} = require("../config/database");

class UserSubRepository {

    static async findByUserId(id) {
        let query = 'SELECT * FROM User_subscriptions WHERE user_id = ?'

        const result = await execute(query, [id]);
        return result.recordset;
    }
}