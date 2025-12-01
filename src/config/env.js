const dotenv = require('dotenv');

dotenv.config();

// Xác định kiểu xác thực SQL Server: 'sql' (mặc định) hoặc 'windows'
const authType = (process.env.DB_AUTH_TYPE || 'sql').toLowerCase();

// Các biến bắt buộc tối thiểu
const requiredEnv = ['DB_HOST', 'DB_NAME', 'JWT_SECRET'];

if (authType === 'sql') {
  requiredEnv.push('DB_USER', 'DB_PASSWORD');
} else if (authType === 'windows') {
  requiredEnv.push('DB_DOMAIN', 'DB_WIN_USER', 'DB_WIN_PASSWORD');
}

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Thiếu biến môi trường: ${missing.join(', ')}. Vui lòng cập nhật file .env`);
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    authType,
    // SQL Authentication
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Windows Authentication (NTLM)
    domain: process.env.DB_DOMAIN,
    winUser: process.env.DB_WIN_USER,
    winPassword: process.env.DB_WIN_PASSWORD,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    instance: process.env.DB_INSTANCE || undefined,
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

module.exports = config;

