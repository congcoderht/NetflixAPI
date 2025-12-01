const { verifyToken } = require('../utils/jwt');

/**
 * Middleware xác thực JWT token
 */
const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token. Vui lòng đăng nhập.'
      });
    }

    // Format: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Lưu thông tin user vào request để sử dụng ở các route tiếp theo
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

/**
 * Middleware kiểm tra quyền (optional - có thể mở rộng sau)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực'
      });
    }

    // Có thể thêm logic kiểm tra role ở đây
    // Ví dụ: if (!roles.includes(req.user.role)) { ... }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};



