const { execute } = require('../config/database');

/**
 * Repository Layer - Data Access Layer
 * Chịu trách nhiệm tương tác trực tiếp với database
 */
class UserRepository {
  // Lấy tất cả users
  static async findAll() {
    const result = await execute('SELECT user_id, full_name, email FROM user');
    return result.recordset;
  }

  // Lấy user theo ID
  static async findById(id) {
    const result = await execute(
      'SELECT user_id, full_name, email FROM user WHERE user_id = ?',
      [id]
    );
    return result.recordset[0];
  }

  // Lấy user theo email
  static async findByEmail(email) {
    const result = await execute(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );
    return result.recordset[0];
  }

  // Tạo user mới
  static async create(userData) {
    const { name, email, password } = userData;
    const result = await execute(
      'INSERT INTO user (full_name, email, password) OUTPUT INSERTED.user_id VALUES (?, ?, ?)',
      [name, email, password]
    );
    const newUserId = result.recordset[0].user_id;
    return this.findById(newUserId);
  }



  // Kiểm tra email đã tồn tại chưa
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await execute(query, params);
    return result.recordset[0].count > 0;
  }
}

module.exports = UserRepository;

