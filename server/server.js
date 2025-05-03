// 引入所需模块
const express = require('express');       // Express框架
const cors = require('cors');             // 跨域支持
const bodyParser = require('body-parser');// 解析请求体
// const bcrypt = require('bcryptjs');       // 密码加密
const jwt = require('jsonwebtoken');      // 令牌生成
const pool = require('./db');             // 数据库连接

// 创建 Express 应用实例
const app = express();
const PORT = 3000;

// 应用中间件
app.use(cors());           // 允许所有跨域请求
app.use(bodyParser.json());// 自动解析 JSON 格式请求体
app.use(express.static('public')); // 托管前端静态文件

// 用户登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. 查询用户是否存在
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );
    
    // 2. 用户不存在处理
    if (users.length === 0) {
      return res.status(401).json({ 
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: '用户名不存在' 
      });
    }

    // 3. 验证密码
    const user = users[0];
    // const isValid = await bcrypt.compare(password, user.password);
    const isValid = (password === user.password);
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_PASSWORD',
        message: '密码错误'
      });
    }

    // 4. 生成 JWT 令牌（有效期24小时）
    const token = jwt.sign(
      { userId: user.id },    // 令牌负载数据
      'your_jwt_secret_key',  // 加密密钥（生产环境应更复杂）
      { expiresIn: '24h' }     // 有效期
    );

    // 5. 返回成功响应
    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: '服务器内部错误'
    });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;


try {
    // 检查用户是否存在
    const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ?', 
        [username]
    );

    if (users.length > 0) {
        return res.status(400).json({
            status: 'error',
            code: 'USER_EXISTS',
            message: '用户名已存在'
        });
    }

    // 插入新用户（明文存储）
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role || 'user'] // 确保role字段
  );

    res.json({
        status: 'success',
        message: '注册成功'
    });
} catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: '注册失败'
    });
}
// const [result] = await pool.query(
//   'INSERT INTO users SET ?', 
//   { username, password, role: role || 'user' }
// );

// // 如果是开发者发送欢迎邮件
// if(role === 'developer') {
//   sendDeveloperWelcomeEmail(username);
// }

});
// 开发者权限
app.get('/api/check-developer', authenticateToken, async (req, res) => {
  try {
      const [users] = await pool.query(
          'SELECT role FROM users WHERE id = ?',
          [req.user.userId]
      );
      if (users.length === 0) {
          return res.status(404).json({ error: '用户不存在' });
      }

      const userRole = users[0].role;
      if (userRole === 'developer' || userRole === 'admin') {
          res.status(200).end();
      } else {
          res.status(403).json({ 
              error: '权限不足',
              message: '当前账号无开发者权限' 
          });
      }
  } catch (error) {
      console.error('权限检查错误:', error);
      res.status(500).json({ 
          error: '服务器错误',
          message: '权限验证服务暂时不可用' 
      });
  }
});
// 取消注释并修改预约接口（约第80行）
app.post('/api/reserve', authenticateToken, async (req, res) => {
  const { gameId, action, gameName } = req.body; // 添加gameName参数
  const userId = req.user.userId;

  try {
        
// 事务处理保证数据一致性
    await pool.query('START TRANSACTION');
    if (action === 'add') {
      await pool.query(
        'INSERT INTO reservations (user_id, game_id, game_name) VALUES (?, ?, ?)',
        [userId, gameId, gameName] // 使用传入的gameName
      );
      // 增加预约计数
      await pool.query(
        'UPDATE games SET reserve_count = reserve_count + 1 WHERE game_id = ?',
        [gameId]
      );
    } else {
      await pool.query(
        'DELETE FROM reservations WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );
            
      // 减少预约计数
      await pool.query(
        'UPDATE games SET reserve_count = reserve_count - 1 WHERE game_id = ?',
        [gameId]
      );
    }
       // 获取最新预约数
       const [[{ reserve_count }]] = await pool.query(
         'SELECT reserve_count FROM games WHERE game_id = ?',
         [gameId]
       );
  
       await pool.query('COMMIT');
    res.json({ success: true ,
               reserve_count  
             });
  } catch (error) {
    console.error('预约操作失败:', error);
    res.status(500).json({ 
      success: false,
      error: '数据库操作失败' 
    });
  }
});
// ========获取预约数===========================================
app.get('/api/game/reserve-count/:gameId', async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT reserve_count FROM games WHERE game_id = ?',
      [req.params.gameId]
    );
    res.json({ reserve_count: result[0]?.reserve_count || 0 });
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});
// 修改订阅接口（约第115行）
app.post('/api/subscribe', authenticateToken, async (req, res) => {
  const { gameId, action, gameName } = req.body; // 添加gameName参数
  const userId = req.user.userId;

  try {
    if (action === 'add') {
      await pool.query(
        'INSERT INTO subscriptions (user_id, game_id, game_name) VALUES (?, ?, ?)',
        [userId, gameId, gameName] // 使用参数传递的gameName
      );
    } else {
      await pool.query(
        'DELETE FROM subscriptions WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );
    }
    
    res.json({ 
      success: true,
      action: action,
      gameId: gameId
    });
  } catch (error) {
    console.error('订阅操作失败:', error);
    res.status(500).json({ 
      success: false,
      error: '操作失败'
    });
  }
});

// 获取用户游戏库数据
app.get('/api/library', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [reservations] = await pool.query(
      `SELECT 
        game_id AS id,
        game_name AS name,
        CONCAT('yuyue', SUBSTRING(game_id, 5), '.png') AS image 
       FROM reservations 
       WHERE user_id = ?`,
      [userId]
    );
    
    const [subscriptions] = await pool.query(
      `SELECT 
        game_id AS id,
        game_name AS name,
        CONCAT('dingyue', SUBSTRING(game_id, 5), '.png') AS image 
       FROM subscriptions 
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      reservations: reservations.map(r => ({
        id: r.id,
        name: r.name,
        image: r.image
      })),
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        name: s.name,
        image: s.image
      }))
    });
  } catch (error) {
    console.error('获取游戏库失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});
// 批量删除接口
app.delete('/api/:type/batch', authenticateToken, async (req, res) => {
  const { type } = req.params;
  const table = type === 'subscribe' ? 'subscriptions' : 'reservations';
  
  try {
      await pool.query(
          `DELETE FROM ${table} WHERE user_id = ?`,
          [req.user.userId]
      );
      res.json({ success: true });
  } catch (error) {
      console.error(`批量删除${type}失败:`, error);
      res.status(500).json({ success: false });
  }
});
// 认证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  // 添加错误处理
  jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
      if (err) {
          console.error('令牌验证失败:', err);
          return res.sendStatus(403);
      }
      req.user = user;
      next();
  });
}
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
      // 从令牌中获取用户ID
      const userId = req.user.userId;
      
      // 查询数据库
      const [users] = await pool.query(
          'SELECT id, username FROM users WHERE id = ?',
          [userId]
      );
      
      if (users.length === 0) {
          return res.status(404).json({ error: '用户不存在' });
      }
      
      // 返回必要用户信息
      res.json({ 
          id: users[0].id,
          username: users[0].username
      });
      
  } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({ error: '服务器错误' });
  }
});

// 开发者中心访问控制
function checkDeveloperAccess(event) {
  event.preventDefault();
  
  fetch('/api/check-developer', {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
  })
  .then(response => {
      if (response.ok) {
          window.location.href = 'kaifa.html';
      } else {
          showCustomAlert('⚠️ 需要开发者权限', '您当前的账号没有开发者权限，请联系管理员升级账号');
      }
  })
  .catch(error => {
      showCustomAlert('错误', '权限验证失败，请检查网络');
  });
}

// 通用弹窗组件
function showCustomAlert(title, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'custom-alert';
  alertDiv.innerHTML = `
      <div class="alert-content">
          <h3>${title}</h3>
          <p>${message}</p>
          <button onclick="this.parentElement.parentElement.remove()">确定</button>
      </div>
  `;
  document.body.appendChild(alertDiv);
}



// 新增接口 - 获取所有标签
app
.get('/api/tags', async (req, res) => {
  try {
    const [tags] = await pool.query('SELECT * FROM tags');
    res
.json(tags);
  } catch (error) {
    res
.status(500).json({ error: '获取标签失败' });
  }
});
// 新增接口 - 获取游戏详情
app
.get('/api/game/:id', async (req, res) => {
  try {
    const [game] = await pool.query(
      `
SELECT g.*, GROUP_CONCAT(t.name) AS tags
       FROM games g
       LEFT JOIN game_tags gt ON g.game_id = gt.game_id
       LEFT JOIN tags t ON gt.tag_id = t.id
       WHERE g.game_id = ?
       GROUP BY g.game_id
`,
      [req.params.id]
    );
    res
.json(game[0]);
  } catch (error) {
    res
.status(500).json({ error: '获取失败' });
  }
});
// 修改游戏提交接口
app.post('/api/submit-game', authenticateToken, async (req, res) => {
  const { title, desc, tags, type, cover } = req.body;
  
  // 生成游戏ID
  const gameType = type === 'reserve' ? 'yy' : 'dy';
  const [maxId] = await pool.query(
    `SELECT MAX(CAST(SUBSTRING(game_id, 3) AS UNSIGNED) AS max 
     FROM games WHERE type = ?`, 
    [type]
  );
  const newId = maxId[0].max ? maxId[0].max + 1 : 1;
  const gameId = `${gameType}${newId.toString().padStart(4, '0')}`;

  try {
    // 插入游戏
    await pool.query(
      `INSERT INTO games 
      (game_id, title, description, cover, type, developer) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [gameId, title, desc, cover, type, req.user.username]
    );

    // 插入标签
    const tagInserts = tags.map(tagId => 
      pool.query('INSERT INTO game_tags (game_id, tag_id) VALUES (?, ?)', 
      [gameId, tagId])
    );
    await Promise.all(tagInserts);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '提交失败' });
  }
});
// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});