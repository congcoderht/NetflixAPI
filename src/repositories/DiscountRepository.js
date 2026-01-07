const {execute} = require('../config/database');

class DiscountRepository {

    static async create({code, discount_type, value, start_date, end_date, max_discount, min_order_value}) {
        const fields = ['code', 'discount_type', 'value', 'start_date', 'end_date'];
        const values = [code, discount_type, value, start_date, end_date];

        if (min_order_value != null) {
            fields.push('min_order_value');
            values.push(min_order_value);
        }

        if (max_discount != null) {
            fields.push('max_discount');
            values.push(max_discount);
        }

        const placeholders = fields.map(() => '?').join(', ');

        const query = `
            INSERT INTO Discounts (${fields.join(', ')})
            VALUES (${placeholders})
        `;

        await execute(query, values);
    }

   static async update({
        id,
        discount_type,
        value,
        start_date,
        end_date,
        max_discount,
        min_order_value
    }) {

        const fields = [];
        const values = [];

        if (discount_type !== undefined) {
            fields.push('discount_type = ?');
            values.push(discount_type);
        }

        if (value !== undefined) {
            fields.push('value = ?');
            values.push(value);
        }

        if (start_date !== undefined) {
            fields.push('start_date = ?');
            values.push(start_date);
        }

        if (end_date !== undefined) {
            fields.push('end_date = ?');
            values.push(end_date);
        }

        if (max_discount !== undefined) {
            fields.push('max_discount = ?');
            values.push(max_discount);
        }

        if (min_order_value !== undefined) {
            fields.push('min_order_value = ?');
            values.push(min_order_value);
        }

        const query = `
            UPDATE Discounts
            SET ${fields.join(', ')}
            WHERE discount_id = ?
        `;

        values.push(id);

        const result = await execute(query, values);

        if (result.rowsAffected[0] === 0) {
            throw new Error('Discount không tồn tại');
        }

        return true;
    }

    static async getAll({offset, limit, search}) {
        let where = 'WHERE 1=1'
        const params = [];

        if(search) {
            where += 'AND code LIKE ?'
            params.push(`%${search}%`);
        }

        const dataQuery = `
            SELECT * 
            FROM Discounts
            ${where}
            ORDER BY created_at DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        `;

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM Discounts
            ${where}
        `;

        const dataResult = await execute(dataQuery, [...params, offset, limit]);
        const countResult = await execute(countQuery, params);

        return {
            rows: dataResult.recordset,
            total: countResult.recordset[0].total
        }
    }

    // Lấy danh sách mã giảm giá mà user chưa sử dụng và còn hiệu lực
    static async findAvailableForUser(userId) {
        const query = `
            SELECT
                d.discount_id as discountId,
                d.code,
                d.discount_type as discountType,
                d.value,
                d.min_order_value as minOrderValue,
                d.max_discount as maxDiscount,
                d.end_date as endDate
            FROM Discounts d
            LEFT JOIN User_Discounts o ON o.discount_id = d.discount_id
            WHERE o.user_id = ?
              AND o.is_used = 0
              AND (d.end_date IS NULL OR d.end_date >= GETDATE())
              AND (d.start_date IS NULL OR d.start_date <= GETDATE())
            ORDER BY d.end_date ASC
        `;

        const result = await execute(query, [userId]);
        return result.recordset || [];
    }

    // Find discount by code
    static async findByCode(code) {
        const query = `
            SELECT *
            FROM Discounts
            WHERE code = ?
        `;
        const result = await execute(query, [code]);
        return result.recordset[0] || null;
    }

    // Find discount by ID
    static async findById(id) {
        const query = `
            SELECT *
            FROM Discounts
            WHERE discount_id = ?
        `;
        const result = await execute(query, [id]);
        return result.recordset[0] || null;
    }

    // Kiểm tra user có sở hữu mã giảm giá này không
    static async userOwnsDiscount(userId, discountId) {
        const query = `
            SELECT TOP 1 1
            FROM User_Discounts
            WHERE user_id = ? AND discount_id = ?
        `;
        const result = await execute(query, [userId, discountId]);
        return result.recordset.length > 0;
    }

    // Kiểm tra user đã sử dụng mã giảm giá này chưa
    static async userUsedDiscount(userId, discountId) {
        const query = `
            SELECT TOP 1 1
            FROM User_Discounts
            WHERE user_id = ? AND discount_id = ? AND is_used = 1
        `;
        const result = await execute(query, [userId, discountId]);
        return result.recordset.length > 0;
    }

    // Đánh dấu mã giảm giá đã được sử dụng
    static async markDiscountAsUsed(userId, discountId) {
        const query = `
            UPDATE User_Discounts
            SET is_used = 1
            WHERE user_id = ? AND discount_id = ?
        `;
        await execute(query, [userId, discountId]);
    }

    // Kiểm tra mã giảm giá tồn tại
    static async existDiscount(code) {
        let query = `
            SELECT TOP 1 1
            FROM Discounts
            WHERE code = ?
        `;

        const result = await execute(query, [code]);
        return result.recordset.length > 0;
    }

    // Kiểm tra mã giảm giá tồn tại
    static async existDiscountId(id) {
        let query = `
            SELECT TOP 1 1
            FROM Discounts
            WHERE discount_id = ?
        `;

        const result = await execute(query, [id]);
        return result.recordset.length > 0;
    }


   
}

module.exports = DiscountRepository;