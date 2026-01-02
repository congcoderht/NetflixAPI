const DiscountRepository = require("../repositories/DiscountRepository");

class DiscountService {

    static async create(discountData) {
        try {
            let {code, discountType, value, startDate, endDate, maxDiscount, minOrderValue} = discountData;

            if(!startDate || !endDate || !value || !code || !discountType) {
                return {
                    success: false,
                    message: "Mã giảm giá, giá trị, loại, ngày bắt đầu, ngày kết thúc là bắt buộc"
                }
            }

            if(!['percentage', 'fixed_amount'].includes(discount_type)) {
                return {
                    success: false,
                    message: "loại giảm giá phải là percentage | fixed_amount"
                }
            }

            const existingCode = await DiscountRepository.existDiscount(code);

            if(existingCode) {
                return {
                    success: false,
                    message: "Mã giảm giá (code) đã tồn tại"
                }
            }

            if (value !== undefined) {
                const num = Number(value);
                if (Number.isNaN(num)) {
                    throw new Error('value phải là số hợp lệ');
                }
                value = num;
            }

            if (maxDiscount !== undefined) {
                const num = Number(maxDiscount);
                if (Number.isNaN(num)) {
                    throw new Error('maxDiscount phải là số hợp lệ');
                }
                maxDiscount = num;
            }

            if (minOrderValue !== undefined) {
                const num = Number(minOrderValue);
                if (Number.isNaN(num)) {
                    throw new Error('minOrderValue phải là số hợp lệ');
                }
                minOrderValue = num;
            }

            await DiscountRepository.create({
                code, 
                discountType, 
                value, 
                startDate, 
                endDate, 
                maxDiscount,
                minOrderValue
            });

            return {
                success: true,
                message: "Tạo mã giảm giá thành công"
            }
        }catch(error) {
            throw new Error(`Lỗi khi tạo mã giảm giá: ${error}`);
        }
    }

    static async update(discountData) {
        try {
            let {id, discount_type, value, start_date, end_date, max_discount, min_order_value} = discountData;

            const existingId = await DiscountRepository.existDiscountId(id);

            if(!existingId) {
                return {
                    success: false,
                    message: "Không tìm thấy discount_id"
                }
            }

            if (
                start_date === null ||
                end_date === null ||
                value === null ||
                discount_type === null
            ) {
                return {
                    success: false,
                    message: "giá trị, loại, ngày bắt đầu, ngày kết thúc của mã giảm giá là bắt buộc"
                };
            }

            if (value !== undefined) {
                const num = Number(value);
                if (Number.isNaN(num)) {
                    throw new Error('value phải là số hợp lệ');
                }
                value = num;
            }

            if (max_discount !== undefined) {
                const num = Number(max_discount);
                if (Number.isNaN(num)) {
                    throw new Error('max_discount phải là số hợp lệ');
                }
                max_discount = num;
            }

            if (min_order_value !== undefined) {
                const num = Number(min_order_value);
                if (Number.isNaN(num)) {
                    throw new Error('min_order_value phải là số hợp lệ');
                }
                min_order_value = num;
            }

            await DiscountRepository.update({ 
                id,
                discount_type, 
                value, 
                start_date, 
                end_date, 
                max_discount,
                min_order_value
            });

            const updatedDiscount = await DiscountRepository.findById(id);

            const discountResponse = {
                discountId: updatedDiscount.discount_id,
                code: updatedDiscount.code,
                discountType: updatedDiscount.discount_type,
                value: updatedDiscount.value,
                minOrderValue: updatedDiscount.min_order_value,
                maxDiscount: updatedDiscount.max_discount,
                startDate: updatedDiscount.start_date,
                endDate: updatedDiscount.end_date,
                createdAt: updatedDiscount.created_at,
            };

            return {
                success: true,
                message: "Cập nhật mã giảm giá thành công",
                data: discountResponse
            }
        }catch(error) {
            throw new Error(`Lỗi khi cập nhật mã giảm giá: ${error}`);
        }
    }

    static async getAll({page, limit, search}) {
        try {
            const offset = (page - 1) * limit;

            const {rows, total} = await DiscountRepository.getAll({offset, limit, search});

            const discounts = rows.map(d => ({
                discountId: d.discount_id,
                code: d.code,
                discountType: d.discount_type,
                value: d.value,
                minOrderValue: d.min_order_value,
                maxDiscount: d.max_discount,
                startDate: d.start_date,
                endDate: d.end_date,
                createdAt: d.created_at,
            }));


            return {
                discounts, 
                total, 
                page, 
                limit
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy danh sách mã giảm giá: ${error}`);
        }
    }

    static async getAvailableForUser(userId) {
        try {
            if (!userId) throw new Error('User id is required');
            const rows = await DiscountRepository.findAvailableForUser(userId);
            // map to API DTO
            return (rows || []).map(r => ({
                discountId: r.discount_id,
                code: r.code,
                discountType: r.discount_type,
                value: r.value,
                minOrderValue: r.min_order_value,
                maxDiscount: r.max_discount,
                endDate: r.end_date,
                isUsed: false
            }));
        } catch (error) {
            throw new Error(`Lỗi khi lấy mã giảm giá khả dụng: ${error.message}`);
        }
    }

}

module.exports = DiscountService;