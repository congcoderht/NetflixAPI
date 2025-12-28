const {execute} = require('../config/database');

class WatchListRepository {

    static async findByUserId({id, offset, limit}) {
        let dataQuery = `
            SELECT m.* 
            FROM User_Favorite AS uf
            JOIN Movie AS m ON m.movie_id = uf.movie_id
            WHERE uf.user_id = ?
            ORDER BY uf.movie_id DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        `;

        let countQuery = `
            SELECT COUNT(*) AS total
            FROM User_Favorite
            WHERE user_id = ?
        `;

        const dataResult = await execute(dataQuery, [id, offset, limit]);
        const countResult = await execute(countQuery, [id]);

        return {
            rows: dataResult.recordset,
            total: countResult.recordset[0].total
        }
    }

    static async addMovie(userId, movieId) {
        let query = `
            INSERT INTO User_Favorite (user_id, movie_id) VALUES (?, ?)
        `;

        await execute(query, [userId, movieId]);
    }

    static async isMovieInWatchlist(userId, movieId) {
        let query = `
            SELECT 1 
            FROM User_Favorite
            WHERE user_id = ? AND movie_id = ?
        `;

        const result = await execute(query, [userId, movieId]);
        return result.recordset.length > 0
    }

    static async deleteByMovieId(userId, movieId) {
        let query = `
            DELETE FROM User_Favorite
            WHERE user_id = ?
            AND movie_id = ?;
        `;

        const result = await execute(query, [userId, movieId]);
    }
}

module.exports = WatchListRepository;