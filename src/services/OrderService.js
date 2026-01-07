const OrderRepository = require("../repositories/OrderRepository");
const SubRepository = require("../repositories/SubRepository");
const DiscountRepository = require("../repositories/DiscountRepository");

class OrderService {

    static async getOrderHistory(id) {
        try {
            const orders = await OrderRepository.findByUserId(id);

            const ordersResponse = orders.map(o => ({
                orderId: o.order_id,
                userId: o.user_id,
                email: o.email,
                fullName: o.full_name,
                orderCode: o.order_code,
                orderType: o.order_type,
                status: o.status,
                amount: o.amount,
                paidAt: o.paid_at,
                planId: o.plan_id,
                planName: o.name,
                planPrice: o.price,
                durations: o.durations,
                description: o.description,
                discountId: o.discount_id,
                discountAmount: o.discount_amount,
                finalAmount: o.final_amount,
            }));


            if(orders.length === 0) {
                return {
                    success: true,
                    message: "Người dùng chưa có đơn hàng nào"
                }
            }

            return {
                success: true,
                data: ordersResponse
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy lịch sử đơn hàng: ${error}`);
        }
    }

    static async getAll({page, limit, search, status, planId}) {
        try {
            limit = Math.min(limit, 50);

            const offset = (page - 1) * limit;

            const {rows, total} = await OrderRepository.findAll({
                offset,
                limit,
                search,
                status, 
                planId
            });

            const orders = rows.map(o => ({
                orderId: o.order_id,
                userId: o.user_id,
                email: o.email,
                fullName: o.full_name,
                orderCode: o.order_code,
                orderType: o.order_type,
                status: o.status,
                amount: o.amount,
                paidAt: o.paid_at,
                planId: o.plan_id,
                planName: o.name,
                planPrice: o.price,
                durations: o.durations,
                description: o.description,
                discountId: o.discount_id,
                discountAmount: o.discount_amount,
                finalAmount: o.final_amount,
            }));

            return {
                orders,
                total,
                page,
                limit
            }
        }catch(error) {
            throw new Error(`Lỗi khi lấy tất cả đơn hàng: ${error}`)
        }
    }

    static async updateStatus({orderId, status}) {
        try{
            const existingOrder = await OrderRepository.existOrder({orderId});

            if(!existingOrder) {
                return {
                    success: false,
                    message: "Không tìm thấy order_id"
                }
            }

            if (!['COMPLETED', 'PENDING', 'FAILED'].includes(status)) {
                return {
                    success: false,
                    message: "Trạng thái phải là COMPLETED | PENDING | FAILED"
                }
            }

            // If status is FAILED, just update status and return updated order
            if (status === 'FAILED') {
                await OrderRepository.updateOrderStatus(orderId, 'FAILED');
                const updatedOrder = await OrderRepository.getOrderDetailWithPlan(orderId);
                return {
                    success: true,
                    message: "Thanh toan thất bại",
                    data: {
                        order: updatedOrder
                    }
                }
            }

            // If status is COMPLETED, process subscription activation/extension and discount usage
            if (status === 'COMPLETED') {
                const order = await OrderRepository.getOrderDetailWithPlan(orderId);
                if (!order) {
                    return { success: false, message: "Không tìm thấy order hoặc plan" };
                }

                // Check if user has an ACTIVE subscription for THIS plan
                const existingPlanSub = await SubRepository.getUserActivePlanSubscription(order.user_id, order.plan_id);

                const now = new Date();
                const durationInDays = order.durations || 30; // Default 30 days if not specified
                let newEndDate;

                if (existingPlanSub && existingPlanSub.end_date) {
                    // Extend from existing end_date
                    const baseDate = new Date(existingPlanSub.end_date);
                    newEndDate = new Date(baseDate);
                    newEndDate.setDate(newEndDate.getDate() + durationInDays);

                    await SubRepository.updateUserSubscriptionEndDate(order.user_id, order.plan_id, newEndDate);
                } else {
                    // New subscription: insert into User_subscriptions
                    const startDate = now;
                    newEndDate = new Date(startDate);
                    newEndDate.setDate(newEndDate.getDate() + durationInDays);

                    await SubRepository.createUserSubscription(order.user_id, order.plan_id, startDate, newEndDate);
                }

                // Mark discount as used (if order has discount)
                let discountMarked = false;
                if (order.discount_id) {
                    await DiscountRepository.markDiscountAsUsed(order.user_id, order.discount_id);
                    discountMarked = true;
                }

                // Update order status to COMPLETED
                await OrderRepository.updateOrderStatus(orderId, 'COMPLETED');

                const updatedOrder = await OrderRepository.getOrderDetailWithPlan(orderId);
                const updatedSub = await SubRepository.getUserActivePlanSubscription(order.user_id, order.plan_id);

                const orderResponse = {
                    orderId: updatedOrder.order_id,
                    orderCode: updatedOrder.order_code,
                    userId: updatedOrder.user_id,
                    planId: updatedOrder.plan_id,
                    planName: updatedOrder.plan_name,
                    planPrice: updatedOrder.plan_price,
                    durations: updatedOrder.durations,
                    orderType: updatedOrder.order_type,
                    originalAmount: updatedOrder.original_amount,
                    discountCode: updatedOrder.discount_code,
                    discountId: updatedOrder.discount_id,
                    discountAmount: updatedOrder.discount_amount,
                    finalAmount: updatedOrder.final_amount,
                    status: updatedOrder.status,
                    createdAt: updatedOrder.created_at,
                };

                const subscriptionResponse = {
                    userId: updatedSub.user_id,
                    planId: updatedSub.plan_id,
                    name: updatedSub.name,
                    price: updatedSub.price,
                    startDate: updatedSub.start_date,
                    endDate: updatedSub.end_date,
                    isActive: updatedSub.is_active,
                };


                return {
                    success: true,
                    message: "Thanh toán thành công, gói đã được gia hạn/đăng ký",
                    data: {
                        order: orderResponse,
                        subscription: subscriptionResponse || null,
                        discountMarked: discountMarked
                    }
                }
            }

            // For PENDING status
            await OrderRepository.updateOrderStatus(orderId, status);
            const pendingOrder = await OrderRepository.getOrderDetailWithPlan(orderId);
            return {
                success: true,
                message: "Đơn hàng đã lưu có thể thanh toán sau",
                data: {
                    order: pendingOrder
                }
            }
        }catch(error) {
            throw new Error(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}`)
        }
    }

    // Validate and calculate discount
    static async validateAndApplyDiscount(discountCode, originalAmount) {
        try {
            if (!discountCode || !discountCode.trim()) {
                return { discountId: null, discountAmount: 0, finalAmount: originalAmount };
            }

            // Find discount by code
            const query = `
                SELECT discount_id, code, discount_type, value, min_order_value, max_discount, end_date, start_date
                FROM Discounts
                WHERE code = ?
            `;
            const result = await DiscountRepository.findByCode(discountCode);
            
            if (!result) {
                throw new Error(`Mã giảm giá "${discountCode}" không tồn tại`);
            }

            const discount = result;

            // Check if discount is still valid (not expired)
            if (discount.end_date && new Date(discount.end_date) < new Date()) {
                throw new Error(`Mã giảm giá "${discountCode}" đã hết hạn`);
            }

            // Check if discount is active (start date)
            if (discount.start_date && new Date(discount.start_date) > new Date()) {
                throw new Error(`Mã giảm giá "${discountCode}" chưa được kích hoạt`);
            }

            // Check minimum order value
            if (discount.min_order_value && originalAmount < discount.min_order_value) {
                throw new Error(`Đơn hàng tối thiểu ${discount.min_order_value.toLocaleString()} để áp dụng mã này`);
            }

            // Calculate discount amount
            let discountAmount = 0;
            if (discount.discount_type === 'percentage') {
                discountAmount = Math.round(originalAmount * (discount.value / 100));
                // Apply max_discount limit if exists
                if (discount.max_discount && discountAmount > discount.max_discount) {
                    discountAmount = discount.max_discount;
                }
            } else if (discount.discount_type === 'fixed_amount') {
                discountAmount = discount.value;
            }

            const finalAmount = Math.max(0, originalAmount - discountAmount);

            return {
                discountId: discount.discount_id,
                code: discount.code,
                discountType: discount.discount_type,
                discountAmount,
                finalAmount
            };
        } catch (error) {
            throw error;
        }
    }

    static async createSubscriptionOrder({userId, planId}) {
        try {
            if (!userId || !planId) {
                return { success: false, message: 'User ID và Plan ID là bắt buộc' };
            }

            // Check if user has active subscription for this plan
            const activeSubscription = await SubRepository.getUserActivePlanSubscription(userId, planId);
            const orderType = activeSubscription ? 'Renewal' : 'New';

            // Get plan price
            const planPrice = await SubRepository.getPlanPrice(planId);
            if (!planPrice) {
                return { success: false, message: 'Plan không tồn tại hoặc không có giá' };
            }

            const originalAmount = planPrice;
            let discountId = null;
            let discountAmount = 0;
            const finalAmount = planPrice;

            const orderId = await OrderRepository.createOrder({
                userId,
                planId,
                discountId,
                originalAmount,
                discountAmount,
                finalAmount,
                orderType
            });

            if (!orderId) {
                throw new Error('Failed to create order');
            }

            const orderDetail = await OrderRepository.getOrderDetail(orderId);

            return {
                success: true,
                message: 'Hóa đơn đã được tạo.',
                data: {
                    orderId: orderDetail.order_id,
                    orderCode: orderDetail.order_code,
                    planId: orderDetail.plan_id,
                    planName: orderDetail.plan_name,
                    orderType: orderDetail.order_type,
                    originalAmount: orderDetail.original_amount,
                    discountCode: 'NULL',
                    discountAmount: 0,
                    finalAmount: orderDetail.final_amount,
                    status: orderDetail.status,
                    createdAt: orderDetail.created_at
                }
            };
        } catch (error) {
            throw new Error(`Lỗi khi tạo đơn hàng: ${error.message}`);
        }
    }

    // Apply discount to existing order
    static async applyDiscountToOrder({orderId, discountId, userId}) {
        try {
            if (!orderId || !discountId) {
                return { success: false, message: 'Order ID và Discount ID là bắt buộc' };
            }

            // Get order detail
            const order = await OrderRepository.getOrderDetail(orderId);
            if (!order) {
                return { success: false, message: 'Đơn hàng không tồn tại' };
            }

            // Get discount by ID
            const discount = await DiscountRepository.findById(discountId);
            if (!discount) {
                return { success: false, message: 'Mã giảm giá không tồn tại' };
            }

            // Check if user owns this discount (sở hữu)
            const ownsDiscount = await DiscountRepository.userOwnsDiscount(userId, discountId);
            if (!ownsDiscount) {
                return { success: false, message: 'Bạn không sở hữu mã giảm giá này' };
            }

            // Check if user already used this discount
            const usedDiscount = await DiscountRepository.userUsedDiscount(userId, discountId);
            if (usedDiscount) {
                return { success: false, message: 'Bạn đã sử dụng mã giảm giá này rồi' };
            }

            // Check if discount is valid
            if (discount.end_date && new Date(discount.end_date) < new Date()) {
                return { success: false, message: `Mã giảm giá "${discount.code}" đã hết hạn` };
            }

            if (discount.start_date && new Date(discount.start_date) > new Date()) {
                return { success: false, message: `Mã giảm giá "${discount.code}" chưa được kích hoạt` };
            }

            // Check minimum order value
            if (discount.min_order_value && order.original_amount < discount.min_order_value) {
                return { success: false, message: `Đơn hàng tối thiểu ${discount.min_order_value.toLocaleString()} để áp dụng mã này` };
            }

            // Calculate discount amount
            let discountAmount = 0;
            if (discount.discount_type === 'percentage') {
                discountAmount = Math.round(order.original_amount * (discount.value / 100));
                if (discount.max_discount && discountAmount > discount.max_discount) {
                    discountAmount = discount.max_discount;
                }
            } else if (discount.discount_type === 'fixed_amount') {
                discountAmount = discount.value;
            }

            const finalAmount = Math.max(0, order.original_amount - discountAmount);

            // Update order with discount
            await OrderRepository.updateOrderDiscount(orderId, discountId, discountAmount, finalAmount);

            // Get updated order detail
            const updatedOrder = await OrderRepository.getOrderDetail(orderId);

            return {
                success: true,
                message: 'Hóa đơn sau khi áp dụng mã.',
                data: {
                    orderId: updatedOrder.order_id,
                    orderCode: updatedOrder.order_code,
                    planId: updatedOrder.plan_id,
                    planName: updatedOrder.plan_name,
                    orderType: updatedOrder.order_type,
                    originalAmount: updatedOrder.original_amount,
                    discountCode: updatedOrder.discount_code || 'NULL',
                    discountAmount: updatedOrder.discount_amount || 0,
                    finalAmount: updatedOrder.final_amount,
                    status: updatedOrder.status,
                    createdAt: updatedOrder.created_at
                }
            };
        } catch (error) {
            throw new Error(`Lỗi khi áp dụng mã giảm giá: ${error.message}`);
        }
    }
}

module.exports = OrderService;