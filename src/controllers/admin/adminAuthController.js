const adminAuthService = require('../../services/admin/adminAuthService')

class adminAuthController {
    // login admin
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await adminAuthService.login(email, password);

            if(!result.success) {
                const statusMap = {
                    "VALIDATION_ERROR": 400,
                    "NOT_ADMIN": 403,
                };

                const status = statusMap[result.code] || 400;
                return res.status(status).json({
                    success: false,
                    message: result.message,
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });

        }catch(error){
            next(error);
        }
    }
}

module.exports = adminAuthController;


