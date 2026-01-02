const { rows } = require('mssql');
const { execute } = require('../config/database');

/**
 * Repository Layer - Data Access Layer
 * Chịu trách nhiệm tương tác trực tiếp với database
 */
const TOP_NEW_USERS = 3;

class UserRepository {
  // Lấy tất cả users
  static async findAll({search, limit, status, offset}) {
    let where = 'WHERE 1=1'
    const params = [];
  
    if(search) {
      where += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if(status) {
      where += ' AND status = ?';
      params.push(`${status}`);
    }

    const dataQuery = `
      SELECT user_id, username, full_name, email, role, avatar, status, created_at, gender, phone_number, birthday
      FROM [User]
      ${where}
      ORDER BY user_id DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY 
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM [User]
      ${where}
    ` 
    const dataResult = await execute(dataQuery, [...params, offset, limit])
    const countResult = await execute(countQuery, params);

    return {
      rows: dataResult.recordset,
      total: countResult.recordset[0].total

    };
  }

  //lấy các user đăng kí mới nhất
  static async findNewUsers() {
    let query = `
      SELECT TOP 3 user_id, full_name, username, email, avatar, role, status, created_at, gender, phone_number, birthday 
      FROM [User]
      ORDER BY created_at DESC
    `;
    const result = await execute(query);
    return result.recordset;
  }

  // lấy số người đăng kí mới trong ngày
  static async countTodayNewUsers() {
    let query = `
      SELECT COUNT (*) AS total
      FROM [User] 
      WHERE created_at >= CAST(GETDATE() AS DATE)
        AND created_at < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
    `;
    const result = await execute(query);
    return result.recordset[0].total;
  }

  // lấy số người đăng kí mới trong 30 ngày qua
  static async countNewUsersLast30Days() {
    let query = `
      SELECT COUNT (*) AS total
      FROM [User] 
      WHERE created_at >= DATEADD(DAY, -30, CAST(GETDATE() AS DATE))
    `;
    const result = await execute(query);
    return result.recordset[0].total;
  }

  // lấy tổng số lượng user
  static async getTotal() {
    let query = 'SELECT COUNT (*) AS total FROM [User]';
    const result = await execute(query);
    return result.recordset[0].total;
  }

  // return for user
  static async findByIdPublic(id) {
    let query = `
      SELECT user_id, full_name, username, email, avatar, role, status, created_at, gender, phone_number, birthday
      FROM [User]
      WHERE user_id = ?
    `;

    const result = await execute(query, [id]);
    return result.recordset[0];
  }

  // Lấy user theo ID
  static async findById(id) {
    let query = `
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

  static async existUsername(username) {
    let query = `
      SELECT * 
      FROM [User]
      Where username = ?
    `;
    const result = await execute(query, [username]);
    return result.recordset.length > 0;
  }

  // Tạo user mới
  static async create(userData) {
    const { username, email, password, fullName, role } = userData;
    const result = await execute(
      'INSERT INTO [User] (username, email, password, fullName, role) OUTPUT INSERTED.user_id VALUES (?, ?, ?, ?, ?)',
      [username, email, password, fullName, role]
    );
    const newUserId = result.recordset[0].user_id;
    return this.findByIdPublic(newUserId);
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

  static async updateProfile(id, payload) {
    const fields = [];
    const values = [];

    Object.entries(payload).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    values.push(id);

    let query = `UPDATE [User] SET ${fields.join(', ')} WHERE user_id = ?`;

    await execute(query, values);
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

