# 物业管理系统

一套完整的物业管理系统，参考市面上主流物业软件功能设计，涵盖小区管理、房屋管理、住户管理、费用管理、报修工单、公告通知、车位管理等核心模块。

## 功能模块

| 模块 | 功能说明 |
|------|----------|
| 工作台 | 数据概览、费用统计、最近工单和账单 |
| 小区管理 | 小区信息的增删改查 |
| 楼栋管理 | 楼栋信息维护，关联小区 |
| 房屋管理 | 房屋信息、入住状态管理 |
| 住户管理 | 业主/租户信息管理 |
| 费用管理 | 费用类型配置、账单生成与缴费 |
| 报修工单 | 报修申请、工单分派与处理 |
| 公告通知 | 小区公告发布与管理 |
| 车位管理 | 停车位资源及租赁管理 |

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design 5
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite (better-sqlite3)

## 快速开始

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 2. 初始化示例数据

```bash
cd backend
npm run seed
```

### 3. 启动服务

```bash
# 启动后端 (端口 3001)
cd backend
npm run dev

# 启动前端 (端口 5173)
cd frontend
npm run dev
```

### 4. 访问系统

打开浏览器访问 http://localhost:5173

**默认账号**: `admin` / `admin123`

## 项目结构

```
├── backend/                # 后端 API 服务
│   ├── src/
│   │   ├── index.ts        # 入口文件
│   │   ├── db.ts           # 数据库初始化
│   │   ├── seed.ts         # 示例数据
│   │   ├── middleware/     # 中间件
│   │   └── routes/         # API 路由
│   └── data/               # SQLite 数据库文件
├── frontend/               # 前端应用
│   └── src/
│       ├── api/            # API 请求封装
│       ├── layouts/        # 布局组件
│       └── pages/          # 页面组件
└── README.md
```

## API 接口

| 路径 | 说明 |
|------|------|
| POST /api/auth/login | 用户登录 |
| GET /api/dashboard | 工作台数据 |
| CRUD /api/communities | 小区管理 |
| CRUD /api/buildings | 楼栋管理 |
| CRUD /api/units | 房屋管理 |
| CRUD /api/residents | 住户管理 |
| CRUD /api/fees/bills | 账单管理 |
| CRUD /api/repairs | 报修工单 |
| CRUD /api/announcements | 公告通知 |
| CRUD /api/parking | 车位管理 |
