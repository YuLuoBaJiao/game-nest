# GameNest 🎮

**GameNest** 是一个优雅的游戏库管理平台，支持用户探索、预约、订阅游戏，开发者发布内容，并提供安全的身份验证与数据管理。基于 Node.js 和 MySQL 构建，轻量高效，开箱即用。

---

## ✨ 核心功能

- **用户系统**：注册、登录、JWT 令牌验证
- **游戏管理**：预约、订阅、游戏库查看
- **开发者支持**：权限验证、内容发布
- **数据统计**：实时预约数查询、批量操作
- **标签系统**：游戏分类与快速检索

---

## 🛠 技术栈

**后端**  
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)  
**安全**  
![JWT](https://img.shields.io/badge/JWT-9.0-orange?logo=jsonwebtokens)  
**工具**  
![CORS](https://img.shields.io/badge/CORS-2.8-yellowgreen)  
![BCrypt](https://img.shields.io/badge/BCryptjs-3.0-red)

---

## 🚀 快速启动

### 前置条件
- Node.js ≥ 18.x
- MySQL ≥ 8.0

### 安装与运行
```bash
# 克隆仓库
git clone https://github.com/your-username/GameNest.git

# 安装依赖
cd GameNest && npm install

# 配置数据库
修改 server/db.js 中的 MySQL 连接信息

# 启动服务
npm run start

# 访问前端
浏览器打开 http://localhost:3000
```

---

## 📚 API 速览

| 功能           | 方法   | 端点                            | 身份验证 |
| -------------- | ------ | ------------------------------- | -------- |
| 用户登录       | POST   | `/api/login`                    | ❌        |
| 用户注册       | POST   | `/api/register`                 | ❌        |
| 获取游戏详情   | GET    | `/api/game/:id`                 | ❌        |
| 管理预约/订阅  | POST   | `/api/reserve` `/api/subscribe` | ✔️        |
| 开发者权限检查 | GET    | `/api/check-developer`          | ✔️        |
| 批量删除操作   | DELETE | `/api/:type/batch`              | ✔️        |

[查看完整 API 文档](#) | [Postman 测试集](#)

---

## 🔒 安全增强建议

1. **密钥管理**  
   替换 `server.js` 中的默认 JWT 密钥：
   ```javascript
   const jwtSecret = process.env.JWT_SECRET || 'your_secure_key_here';
   ```

2. **密码加密**  
   已在注册逻辑集成 BCryptjs：
   ```javascript
   const hashedPassword = bcrypt.hashSync(password, 10); // 存储哈希值
   ```

---

## 📂 项目结构

```
GameNest/
├── public/            # 前端静态资源
│   ├── index.html     # 主界面
│   └── img/           # 游戏封面与图标
├── server/
│   ├── server.js      # 服务入口
│   └── db.js         # 数据库配置
└── package.json      # 依赖与脚本
```

---

## 🤝 贡献指南

欢迎提交 Issue 或 PR！请遵循以下步骤：
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/awesome`)
3. 提交代码 (`git commit -m 'Add something'`)
4. 推送分支 (`git push origin feature/awesome`)
5. 发起 Pull Request

---

## 📜 许可证

MIT License © 2023 [Your Name]  
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

> **提示**：生产环境部署前，请确保完成以下事项：
> - 配置 HTTPS
> - 启用数据库连接池
> - 设置环境变量（如 `JWT_SECRET`, `DB_PASSWORD`）