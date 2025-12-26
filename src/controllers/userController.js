const UserService = require('../services/UserService');



class UserController {
 
  static async getAllUsers(req, res, next) {
    try {
      const {search = '', page = 1, limit = 10, status} = req.query;

      let pageNumber = Number(page);
      let limitNumber = Number(limit);

      if (!Number.isInteger(pageNumber)) {
        pageNumber = 1;
      }

      if (!Number.isInteger(limitNumber) || limitNumber < 1) {
        limitNumber = 10;
      }

      const {rows, total, page: currentPage, limit: currentLimit} = await UserService.getAllUsers({
        search,
        page: pageNumber,
        limit: limitNumber,
        status,
      });

      const totalPages = Math.ceil(total / currentLimit);

      res.status(200).json({
        success: true,
        data: {
          items: rows,
          pagination: {
            page: currentPage,
            limit: currentLimit,
            total: total,
            totalPages
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  
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

 
  static async createUser(req, res, next) {
    try {
      const result = await UserService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  
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
      
      const payload = {};

      if (typeof req.body.full_name === "string") {
        const fullName = req.body.full_name.trim();

        if (fullName.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Full name không được để trống"
          });
        }

        payload.full_name = fullName;
      }

      if (typeof req.body.avatar === "string") {
        payload.avatar = req.body.avatar.trim();
      }

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có dữ liệu để cập nhật"
        });
      }

      const result = await UserService.updateProfile(id, payload);

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

