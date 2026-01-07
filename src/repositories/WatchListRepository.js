const {execute} = require('../config/database');

class WatchListRepository {

    static async findByUserId({id, offset, limit}) {
        let dataQuery = `
            SELECT 
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.poster_url,
                m.banner_url,
                m.trailer_url,
                m.url_phim,
                STRING_AGG(g.name, ',') WITHIN GROUP (ORDER BY g.name) AS genres
            FROM User_Favorite AS uf
            JOIN Movie AS m 
                ON m.movie_id = uf.movie_id
            JOIN Genres_Film AS gf 
                ON m.movie_id = gf.movie_id
            JOIN Genres AS g 
                ON gf.genres_id = g.genres_id
            WHERE 
                uf.user_id = ?
                AND m.is_deleted = 0
            GROUP BY 
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.poster_url,
                m.banner_url,
                m.trailer_url,
                m.url_phim
            ORDER BY m.movie_id DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;
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