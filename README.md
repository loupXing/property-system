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
- **后端**: Java 21 + Spring Boot 3 + MyBatis
- **数据库**: MySQL 8.0

## 快速开始

### 1. 启动 MySQL

```bash
docker compose up -d
```

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端默认运行在 http://localhost:3001 ，启动时会自动建表并初始化示例数据。

可通过环境变量或 `application.yml` 配置 MySQL 连接：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| MYSQL_HOST | MySQL 主机 | localhost |
| MYSQL_PORT | MySQL 端口 | 3306 |
| MYSQL_USER | 用户名 | root |
| MYSQL_PASSWORD | 密码 | root123 |
| MYSQL_DATABASE | 数据库名 | property_management |

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173 ，默认账号 `admin` / `admin123`

## 项目结构

```
├── backend/                     # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/property/
│       │   ├── controller/      # REST 控制器
│       │   ├── entity/          # 实体类
│       │   ├── mapper/          # MyBatis Mapper
│       │   ├── config/          # 配置类
│       │   └── util/            # 工具类
│       └── resources/
│           ├── application.yml  # 应用配置
│           ├── schema.sql       # 数据库表结构
│           └── mapper/          # MyBatis XML
├── frontend/                    # React 前端
└── docker-compose.yml           # MySQL Docker 配置
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
