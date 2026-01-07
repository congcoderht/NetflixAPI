const {execute} = require('../config/database');

class CastMemberRepository {

    static async findMostWatchedMembers() {
        let query = `
            SELECT TOP 10
                cm.*,
                COUNT(uh.movie_id) AS total_watch
            FROM Attend AS a
            JOIN CastMember AS cm ON cm.member_id = a.member_id
            JOIN User_History AS uh ON uh.movie_id = a.movie_id
            GROUP BY 
                cm.member_id,
                cm.name,
                cm.birthday
            ORDER BY total_watch DESC
        `;
        const result = await execute(query);
        return result.recordset;
    }
}

module.exports = CastMemberRepository;