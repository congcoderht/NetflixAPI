const {execute} = require('../config/database');

class MovieRepository {

    // tổng số phim trên hệ thống
    static async findTotal() {
        let query = `
            SELECT COUNT(movie_id) AS total
            FROM Movie
        `
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
        `
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
        `
        const result = await execute(query);
        return result.recordset;
    }
}

module.exports = MovieRepository;