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
}

module.exports = WatchListRepository;