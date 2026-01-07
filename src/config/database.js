const { ConnectionPool } = require('mssql');
const config = require('./env');
const { xContentTypeOptions } = require('helmet');

// Cấu hình cơ bản chung cho cả SQL Auth và Windows Auth
const baseConfig = {
  server: config.db.host,
  database: config.db.database,
  port: config.db.port,
  options: {
    encrypt: config.db.encrypt,
    trustServerCertificate: true,
    instanceName: process.env.DB_INSTANCE || undefined
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

if (config.db.instance) {
  baseConfig.options.instanceName = config.db.instance;
}

let dbConfig;

if (config.db.authType === 'windows') {
  // Windows Authentication (NTLM)
  dbConfig = {
    ...baseConfig,
    authentication: {
      type: 'ntlm',
      options: {
        domain: config.db.domain,
        userName: config.db.winUser,
        password: config.db.winPassword
      }
    }
  };
} else {
  // SQL Authentication (mặc định)
  dbConfig = {
    ...baseConfig,
    user: config.db.user,
    password: config.db.password
  };
}

const pool = new ConnectionPool(dbConfig);
const poolConnect = pool.connect()
  .then(() => {
    console.log(`✅ Đã kết nối tới SQL Server database "${dbConfig.database}"`);
  })
  .catch((error) => {
    console.error('❌ Không thể khởi tạo pool SQL Server:', error.message);
    throw error;
  });

function mapPlaceholders(query) {
  let index = 0;
  return query.replace(/\?/g, () => `@p${index++}`);
}

async function getPool() {xContentTypeOptions 
  await poolConnect;
  return pool;
}

async function execute(queryText, params = []) {
  const activePool = await getPool();
  const request = activePool.request();

  params.forEach((value, idx) => {
    request.input(`p${idx}`, value);
  });

  const parsedQuery = mapPlaceholders(queryText);
  return request.query(parsedQuery);
}

async function initDatabase() {
  try {
    await execute('SELECT 1 AS ok');
    console.log('✅ Kết nối SQL Server sẵn sàng.');
  } catch (error) {
    console.error('❌ Không thể kết nối tới SQL Server. Kiểm tra lại thông tin kết nối.');
    throw error;
  }
}

module.exports = {
  execute,
  initDatabase
};

