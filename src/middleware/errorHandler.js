// Middleware xử lý lỗi
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Lỗi trùng dữ liệu (SQL Server: 2627, 2601)
  const errorNumber = err.number || err.originalError?.info?.number;
  if (errorNumber === 2627 || errorNumber === 2601) {
    return res.status(409).json({
      success: false,
      message: 'Dữ liệu đã tồn tại',
      error: err.message
    });
  }

  // Lỗi kết nối SQL Server
  if (['ESOCKET', 'ELOGIN', 'ETIMEOUT'].includes(err.code)) {
    return res.status(503).json({
      success: false,
      message: 'Lỗi kết nối database',
      error: 'Không thể kết nối đến database'
    });
  }

  // Lỗi validation từ Service
  if (err.message && (
    err.message.includes('không hợp lệ') ||
    err.message.includes('không được để trống') ||
    err.message.includes('đã được sử dụng')
  )) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: err.message
    });
  }

  // Lỗi validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      error: err.message
    });
  }

  // Lỗi mặc định
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

