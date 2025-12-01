// Middleware xử lý route không tồn tại
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại`
  });
};

module.exports = notFound;

