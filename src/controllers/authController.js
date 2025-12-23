const AuthService = require('../services/AuthService');


class AuthController {

  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      if (!result.success) {
          const statusMap = {
            "EMAIL_NOT_FOUND": 401,
            "INVALID_PASSWORD": 401,
            "VALIDATION_ERROR": 400,
            "LOCKED": 401,
          };

        const status = statusMap[result.code] || 400;

        return res.status(status).json({
          success: false,
          message: result.message
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      })
      
    } catch (error) {
      next(error);
    }
  }

  
  static async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await AuthService.getCurrentUser(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const {current_password, new_password} = req.body;

      if(!current_password || !new_password){
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới"
        });
      }

      const result = await AuthService.changePassword(userId, current_password, new_password);

      if(!result.success){
        return res.status(400).json(result);
      }

      return res.status(200).json(result);

    }catch(error){
      next(error);
    }
  }
}

module.exports = AuthController;



