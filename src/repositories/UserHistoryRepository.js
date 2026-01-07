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

    static async countViewsToday() {
        let query = `
            SELECT COUNT(*) AS total
            FROM User_History 
            WHERE last_watched_at >= CAST(GETDATE() AS DATE)
                AND last_watched_at < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
        `;

        const result = await execute(query);
        return result.recordset[0].total;
    }

    static async countViewsThisWeek() {
        let query = `
            SET DATEFIRST 1

            SELECT COUNT(*) AS total
            FROM User_History 
            WHERE last_watched_at >= DATEADD(DAY, 1 - DATEPART(WEEKDAY, CAST(GETDATE() AS DATE)), CAST(GETDATE() AS DATE))
        `;

        const result = await execute(query);
        return result.recordset[0].total;
    }

    static async countViewsThisMonth() {
        let query = `
            SELECT COUNT(*) AS total
            FROM User_History 
            WHERE last_watched_at >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                AND last_watched_at < DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
        `;

        const result = await execute(query);
        return result.recordset[0].total;
    }

    static async countViewsLastMonth() {
        let query = `
            SELECT COUNT(*) AS total
            FROM User_History 
            WHERE last_watched_at >= DATEADD(
                    MONTH, 
                    -1, 
                    DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                )
                AND last_watched_at < DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
        `;

        const result = await execute(query);
        return result.recordset[0].total;
    }

    static async countViewThisYear() {
        let query = `
            SELECT COUNT(*) AS total
            FROM User_History 
            WHERE last_watched_at >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
                AND last_watched_at < DATEFROMPARTS(YEAR(GETDATE()) + 1, 1, 1)
        `;

        const result = await execute(query);
        return result.recordset[0].total;
    }
}

module.exports = UserHistoryRepository;