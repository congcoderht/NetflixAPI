const { execute } = require('../config/database');

class OrderRepository {

    static async findByUserId(id) {
        let query = 'SELECT * FROM Orders WHERE user_id = ?'
        const result = execute(query, [id]);
        return result.recordset;
    }
}