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

  // return for user
  static async findByIdPublic(id) {
    let query = `
      SELECT user_id, full_name, email, avatar, role, status
      FROM [User]
      WHERE user_id = ?
    `;
    const result = await execute(query, [id]);
    return result.recordset[0];
  }

  // Lấy user theo ID
  static async findById(id) {
    const query = `
      SELECT user_id, full_name, email, role, password, status
      FROM [User] 
      WHERE user_id = ?
    `;
    
    const result = await execute(query, [id]);
    return result.recordset[0];
  }


  // Lấy user theo email
  static async findByEmail(email) {
    const result = await execute(
      'SELECT * FROM [User] WHERE email = ?',
      [email]
    );
    return result.recordset[0];
  }

  // Tạo user mới
  static async create(userData) {
    const { username, email, password, full_name, role } = userData;
    const result = await execute(
      'INSERT INTO [User] (username, email, password, full_name, role) OUTPUT INSERTED.user_id VALUES (?, ?, ?, ?, ?)',
      [username, email, password, full_name, role]
    );
    const newUserId = result.recordset[0].user_id;
    return this.findById(newUserId);
  }

  // Kiểm tra email đã tồn tại chưa
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM [user] WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = await execute(query, params);
    return result.recordset[0].count > 0;
  }

  // Đổi mật khẩu user
  static async updatePassword(id, hashedNewPassword) {
    let query = 'UPDATE [User] SET password = ? WHERE user_id = ?';
    const params = [hashedNewPassword, id];
    const result = await execute(query, params);
    return result;
  }

  static async updateProfile(id, userData) {
    const {full_name, avatar} = userData;

    const fields = [];
    const params = [];

    if(full_name !== undefined) {
      fields.push('full_name = ?');
      params.push(full_name);
    } 

    if(avatar !== undefined) {
      fields.push('avatar = ?');
      params.push(avatar);
    }

    if(fields.length === 0){
      throw new Error("Không có dữ liệu để cập nhật");
    }

    let query = `UPDATE [User] SET ${fields.join(', ')} WHERE user_id = ?`;
    params.push(id);

    await execute(query, params);
    return this.findByIdPublic(id);
  }

  // cập nhật trạng thái user (active/locked)
  static async updateStatus(id, status) {
  let query = 'UPDATE [User] SET status = ? WHERE user_id = ?';

    const params = [status, id];
    await execute(query, params);
    return this.findByIdPublic(id);
  }
}

module.exports = UserRepository;

