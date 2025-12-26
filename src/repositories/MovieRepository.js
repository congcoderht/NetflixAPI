const {execute} = require('../config/database');

class MovieRepository {

    // tổng số phim trên hệ thống
    static async countTotal() {
        let query = `
            SELECT COUNT(movie_id) AS total
            FROM Movie
        `;
        const result = await execute(query);
        return result.recordset[0].total;
    }

    // top phim được xem nhiều nhất
    static async findMostView() {
        let query = `
            SELECT TOP 5
                m.*,
                COUNT(*) AS total_views
            FROM User_History uh
            JOIN Movie m ON uh.movie_id = m.movie_id
            GROUP BY 
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.poster_url,
                m.trailer_url,
                m.url_phim
            ORDER BY total_views DESC;
        `;
        const result = await execute(query);
        return result.recordset;
    }

    // top phim được đánh giá cao nhất
    static async findHighRating() {
        let query = `
            SELECT TOP 5 
                m.*,
                AVG(CAST(ur.number AS FLOAT)) AS avg_rating,
                COUNT(*) AS rating_count
            FROM User_Rating ur
            JOIN Movie AS m ON m.movie_id = ur.movie_id
            GROUP BY
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.poster_url,
                m.trailer_url,
                m.url_phim
            ORDER BY avg_rating DESC, rating_count DESC
        `;
        const result = await execute(query);
        return result.recordset;
    }

    // top phim có watch_time cao nhất
    static async findMostWatchTime() {
        let query = `
            SELECT TOP 10 
                m.*,
                COALESCE(SUM(uh.time), 0) AS total_watch_time
            FROM User_History uh
            JOIN Movie AS m ON m.movie_id = uh.movie_id
            GROUP BY
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.poster_url,
                m.trailer_url,
                m.url_phim
            ORDER BY total_watch_time DESC
        `;
        const result = await execute(query);
        return result.recordset;
    }

    // tổng số phim (có filter)
    static async findTotal({ genreId, title, releaseYear }) {
    let where = `WHERE 1 = 1`;
    const params = [];

    if (title && title.trim() !== "") {
        where += ` AND m.title LIKE ?`;
        params.push(`%${title.trim()}%`);
    }

    if (releaseYear && !isNaN(releaseYear)) {
        where += ` AND m.release_year = ?`;
        params.push(Number(releaseYear));
    }

    if (genreId && !isNaN(genreId)) {
        where += `
            AND EXISTS (
                SELECT 1
                FROM Genres_Film gf
                WHERE gf.movie_id = m.movie_id
                AND gf.genres_id = ?
            )
        `;
        params.push(Number(genreId));
    }

    const query = `
        SELECT COUNT(*) AS total
        FROM Movie m
        ${where}
    `;

    const result = await execute(query, params);
    return result.recordset[0].total;
    }

    // lấy danh sách phim + rating + genres + phân trang
    static async findAll({ page, limit, genreId, title, releaseYear }) {

    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
    const offset = (safePage - 1) * safeLimit;

    let where = `WHERE 1 = 1`;
    const params = [];

    if (title && title.trim() !== "") {
        where += ` AND m.title LIKE ?`;
        params.push(`%${title.trim()}%`);
    }

    if (releaseYear && !isNaN(releaseYear)) {
        where += ` AND m.release_year = ?`;
        params.push(Number(releaseYear));
    }

    if (genreId && !isNaN(genreId)) {
        where += `
            AND EXISTS (
                SELECT 1
                FROM Genres_Film gf
                WHERE gf.movie_id = m.movie_id
                AND gf.genres_id = ?
            )
        `;
        params.push(Number(genreId));
    }

    const query = `
        SELECT
            m.movie_id,
            m.title,
            m.description,
            m.release_year,
            ISNULL(r.avg_rating, 0) AS avg_rating,
            ISNULL(genre_list.genres, '') AS genres
        FROM Movie m

        LEFT JOIN (
            SELECT 
                movie_id,
                ROUND(AVG(CAST(number AS FLOAT)), 1) AS avg_rating
            FROM User_Rating
            GROUP BY movie_id
        ) r ON m.movie_id = r.movie_id

        LEFT JOIN (
            SELECT 
                gf.movie_id,
                STRING_AGG(gen.name, ', ') AS genres
            FROM Genres_Film gf
            JOIN Genres gen ON gf.genres_id = gen.genres_id
            GROUP BY gf.movie_id
        ) genre_list ON m.movie_id = genre_list.movie_id

        ${where}
        ORDER BY m.movie_id DESC
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;

    const result = await execute(query, [...params, offset, safeLimit]);
    return result.recordset;
    }

    static async GetDetails(movieId) {
        let query = `
            SELECT
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.poster_url,
                m.trailer_url,
                m.url_phim,
                ISNULL(r.avg_rating, 0) AS avg_rating,
                ISNULL(genre_list.genres, '') AS genres
            FROM Movie m
            LEFT JOIN (
                SELECT 
                    movie_id,
                    ROUND(AVG(CAST(number AS FLOAT)), 1) AS avg_rating
                FROM User_Rating
                GROUP BY movie_id
            ) r ON m.movie_id = r.movie_id

            LEFT JOIN (
                SELECT 
                    gf.movie_id,
                    STRING_AGG(gen.name, ', ') AS genres
                FROM Genres_Film gf
                JOIN Genres gen ON gf.genres_id = gen.genres_id
                GROUP BY gf.movie_id
            ) genre_list ON m.movie_id = genre_list.movie_id

            WHERE m.movie_id = ?
        `;
        const result = await execute(query, [movieId]);
        return result.recordset[0];
    }

    static async getActorsByMovieId(movieId) {
        let query = `
            SELECT
                cm.member_id,
                cm.name,
                a.role
            FROM Attend a
            JOIN CastMember cm ON a.member_id = cm.member_id
            WHERE a.movie_id = ?
            ORDER BY a.role
        `;
        const result = await execute(query, [movieId]);
        return result.recordset || [];
    }

    static async upsertRating(userId, movieId, number) {
        // Insert or update user's rating for a movie
        const upsertQuery = `
            IF EXISTS (SELECT 1 FROM User_Rating WHERE user_id = ? AND movie_id = ?)
                UPDATE User_Rating SET number = ? WHERE user_id = ? AND movie_id = ?;
            ELSE
                INSERT INTO User_Rating (user_id, movie_id, number) VALUES (?, ?, ?);
        `;
        await execute(upsertQuery, [userId, movieId, number, userId, movieId, userId, movieId, number]);

        const avgQuery = `
            SELECT ROUND(AVG(CAST(number AS FLOAT)), 1) AS avg_rating,
                   COUNT(*) AS rating_count
            FROM User_Rating
            WHERE movie_id = ?
        `;
        const avgResult = await execute(avgQuery, [movieId]);

        const userQuery = `
            SELECT number AS user_rating
            FROM User_Rating
            WHERE user_id = ? AND movie_id = ?
        `;
        const userResult = await execute(userQuery, [userId, movieId]);

        return {
            avgRating: avgResult.recordset[0] ? avgResult.recordset[0].avg_rating : 0,
            ratingCount: avgResult.recordset[0] ? avgResult.recordset[0].rating_count : 0,
            userRating: userResult.recordset[0] ? userResult.recordset[0].user_rating : null
        };
    }

    static async findAllGenres() {
        const query = `
            SELECT
                genres_id AS id,
                name
            FROM Genres
            ORDER BY name
        `;
        const result = await execute(query);
        return result.recordset || [];
    }
}

module.exports = MovieRepository;