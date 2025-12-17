const {execute} = require("../config/database");

class UserHistoryRepository {
    
    static async findByUserId(id) {
        let query = `
            SELECT movie_id, is_done, time , last_watched_at
            FROM User_History 
            WHERE user_id = ?
            ORDER BY last_watched_at DESC
        `;
        const result = await execute(query, [id]);
        return result.recordset;
    }
}

module.exports = UserHistoryRepository;