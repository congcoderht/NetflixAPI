const UserRepository = require('../../repositories/UserRepository');
const { generateToken } = require('../../utils/jwt');
const { comparePassword } = require('../../utils/password');


class adminAuthService {
    static async login(email, password) {
        try {
            if(!email || !password){
                return {
                    success: false,
                    code: "VALIDATION_ERROR",
                    message: "Vui lòng nhập email và mật khẩu",
                };
            }

            const user = await UserRepository.findByEmail(email.trim().toLowerCase());

            if(!user){
                return {
                    success: false,
                    message: "Email hoặc mật khẩu không chính xác",
                };
            }

             if(user.role !== "admin"){
                return {
                    success: false,
                    code: "NOT_ADMIN",
                    message: "Bạn không có quyền truy cập",
                };
            }

            const isPasswordValid = await comparePassword(password, user.password);

            if(!isPasswordValid){
                return {
                    success: false,
                    message: "Email hoặc mật khẩu không chính xác",
                };
            }

            // create JWT 
            const token = generateToken({
                id: user.user_id,
                email: user.email,
                role: user.role,
            });

            const userResponse = {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                avata: user.avatar,
            };

            return {
                success: true,
                message: "Đăng nhập thành công",
                data: {
                    user: userResponse,
                    token
                }
            };
        }catch(error){
            throw new Error(`Lỗi khi lấy thông tin user: ${error.message}`);
        }
    }
}

module.exports = adminAuthService;