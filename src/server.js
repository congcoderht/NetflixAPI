const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const swaggerSetup = require('./config/swagger');
const { initDatabase } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const config = require('./config/env');

const app = express();

// Middleware
app.use(helmet()); // Bảo mật HTTP headers
app.use(cors()); // Cho phép CORS
app.use(morgan('dev')); // Logging requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiểm tra trạng thái server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server đang hoạt động
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server đang hoạt động',
    timestamp: new Date().toISOString()
  });
});

// Swagger Documentation
swaggerSetup(app);

// API Routes
app.use('/api', routes);

// Error handling middleware (phải đặt sau tất cả routes)
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${config.port}/api`);
      console.log(`📚 Swagger docs tại http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server vì lỗi kết nối database:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;

