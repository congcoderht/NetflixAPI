const UserService = require('../services/UserService');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: ID tự động của user
 *         name:
 *           type: string
 *           description: Tên user
 *         email:
 *           type: string
 *           description: Email user
 *         password:
 *           type: string
 *           description: Mật khẩu (chỉ hiển thị khi tạo mới)
 */

class UserController {
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Lấy danh sách tất cả users
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Danh sách users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   */
  static async getAllUsers(req, res, next) {
    try {
      const {search = '', page = 1, limit = 10, status} = req.query;

      let pageNumber = Number(page);
      let limitNumber = Number(limit);

      if (!Number.isInteger(pageNumber)) {
        pageNumber = 1;
      }

      if (!Number.isInteger(limitNumber)) {
        limitNumber = 10;
      }

      const result = await UserService.getAllUsers({
        search,
        page: pageNumber,
        limit: limitNumber,
        status,
      });

      if(!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Lấy thông tin user theo ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID của user
   *     responses:
   *       200:
   *         description: Thông tin user
   *       404:
   *         description: Không tìm thấy user
   */
  // xem chi tiết user
  static async getDetailedUserById(req, res, next) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }

      const result = await UserService.getDetailedUserById(id);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }

      const result = await UserService.getUserById(id);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Tạo user mới
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: User được tạo thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   */
  static async createUser(req, res, next) {
    try {
      const result = await UserService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Cập nhật user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: User được cập nhật thành công
   *       404:
   *         description: Không tìm thấy user
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await UserService.updateUser(id, req.body);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Xóa user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User được xóa thành công
   *       404:
   *         description: Không tìm thấy user
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const id = req.user.id;
      const result = await UserService.updateProfile(id, req.body);

      if(!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    }catch(error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }

      const result = await UserService.updateStatus(id);

      if(!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    }catch(error) {
      next(error);
    }
  }
}

module.exports = UserController;

