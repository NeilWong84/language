# 视频驱动型语言学习Web应用

基于Vue3 + TDesign构建的现代化语言学习平台

## 技术栈

- **前端框架**: Vue 3.5+
- **UI组件库**: TDesign Vue Next
- **构建工具**: Vite 8
- **状态管理**: Pinia
- **路由管理**: Vue Router 5
- **HTTP请求**: Axios
- **CSS预处理器**: Sass

## 项目结构

```
language-app/
├── public/              # 静态资源
├── src/
│   ├── api/            # API接口
│   │   └── video.js    # 视频相关接口
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   │   ├── VideoPlayer.vue  # 视频播放器组件
│   │   └── WordCard.vue     # 单词卡片组件
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── store/          # 状态管理
│   │   └── user.js     # 用户状态
│   ├── utils/          # 工具函数
│   │   └── request.js  # Axios封装
│   ├── views/          # 页面视图
│   │   ├── Home.vue    # 首页
│   │   ├── Learn.vue   # 视频学习页
│   │   ├── Practice.vue # 练习中心
│   │   └── Profile.vue # 个人中心
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .env.development    # 开发环境变量
├── .env.production     # 生产环境变量
├── .gitignore          # Git忽略文件
├── Dockerfile          # Docker配置
├── docker-compose.yml  # Docker Compose配置
├── nginx.conf          # Nginx配置
├── index.html          # HTML模板
├── jsconfig.json       # JS配置
├── package.json        # 项目依赖
└── vite.config.js      # Vite配置
```

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## Docker部署

### 使用Docker Compose

```bash
docker-compose up -d
```

访问 http://localhost

### 使用Docker

```bash
# 构建镜像
docker build -t language-app .

# 运行容器
docker run -d -p 80:80 --name language-learning-app language-app
```

## 功能特性

- ✅ 视频学习 - 真实场景视频，沉浸式学习
- ✅ 智能字幕 - 双语字幕，点击查词
- ✅ 互动练习 - 听力、口语、词汇练习
- ✅ 学习追踪 - 记录进度，科学复习
- ✅ 个人中心 - 学习统计，目标设置

## 开发计划

- [ ] 用户认证系统
- [ ] 视频课程管理
- [ ] AI发音评测
- [ ] 学习社区
- [ ] 离线下载
- [ ] 多语言支持

## 许可证

ISC
