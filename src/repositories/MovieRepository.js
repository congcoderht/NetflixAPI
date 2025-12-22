const {execute} = require('../config/database');

const TOP_WATCH = 5;
class MovieRepository {

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
}

module.exports = MovieRepository;