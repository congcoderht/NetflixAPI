const AuthService = require('../services/AuthService');

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: JWT token
 */
class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Đăng ký tài khoản mới
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: VanAn17
   *               email:
   *                 type: string
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *               full_name:
   *                 type: string
   *                 example: Nguyen Van An
   *     responses:
   *       201:
   *         description: Đăng ký thành công
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Dữ liệu không hợp lệ
   */
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

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Đăng nhập
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *     responses:
   *       200:
   *         description: Đăng nhập thành công
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Email hoặc mật khẩu không đúng
   */
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

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Lấy thông tin user hiện tại
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Thông tin user
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Chưa xác thực
   */
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



