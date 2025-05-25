
const mysql = require('mysql2/promise');

// 创建 MySQL 连接池（复用连接提升性能）
const pool = mysql.createPool({
  host: 'localhost',      // 数据库地址
  user: 'root',           // 数据库用户名
  password: '129245699',     // 数据库密码（与Navicat一致）
  database: 'game_library', // 数据库名
  waitForConnections: true, // 允许等待可用连接
  connectionLimit: 10,    // 最大连接数
  queueLimit: 0           // 不限制排队请求数量
});

module.exports = pool; // 导出供其他模块使用