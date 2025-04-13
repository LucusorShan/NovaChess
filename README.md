# 🎮 NovaChess

<div align="center">
  <img src="static/images/match/pieces/white-king.png" alt="NovaChess Logo" width="100" height="100"/>
  <br>
  <p>一个现代化的国际象棋应用，提供多平台支持</p>
  
  <p>
    <img src="https://img.shields.io/badge/版本-1.2.0-blue" alt="版本" />
    <img src="https://img.shields.io/badge/许可证-MIT-green" alt="许可证" />
    <img src="https://img.shields.io/badge/平台-Web%20%7C%20小程序%20%7C%20App-orange" alt="平台" />
  </p>
</div>

## 📋 项目简介

NovaChess是一个功能丰富的国际象棋应用，采用uni-app开发，支持多平台部署。应用提供了人机对战、在线匹配、棋局回放、国际象棋学习等多种功能，适合各水平的棋手使用。

## ✨ 主要功能

- 🎯 **在线匹配**：与全球玩家实时对战
- 🤖 **人机对战**：与不同水平的AI进行对弈
- 📚 **规则入门**：学习国际象棋的基本规则和走法
- 🏋️ **战术训练**：提供各种战术练习，提升棋力
- 📝 **对局回放**：查看和分析历史对局
- 📧 **信箱系统**：接收系统通知和好友消息
- 👤 **个人账户**：管理个人信息和设置

## 🔧 技术栈

- 前端框架：[Vue.js](https://vuejs.org/)
- 跨平台解决方案：[uni-app](https://uniapp.dcloud.io/)
- 状态管理：Vuex
- UI组件：自定义组件

## 📁 项目结构

```
NovaChess/
├── api/                # API接口定义
├── components/         # 通用组件
│   ├── chess/          # 国际象棋相关组件
│   │   ├── ChessBoard.vue  # 棋盘组件
│   │   └── ...
├── pages/              # 应用页面
│   ├── index.vue       # 主页
│   ├── login.vue       # 登录页
│   ├── register.vue    # 注册页
│   ├── play/           # 对战相关页面
│   ├── work/           # 学习和训练相关页面
│   ├── mail/           # 信箱系统
│   └── mine/           # 个人中心
├── plugins/            # 插件
├── static/             # 静态资源
│   ├── images/         # 图片资源
│   └── audio/          # 音频资源
├── store/              # Vuex状态管理
├── styles/             # 样式文件
├── uni_modules/        # uni-app模块
├── utils/              # 工具方法
├── App.vue             # 应用入口组件
├── main.js             # 应用入口JS
├── manifest.json       # 应用配置
├── pages.json          # 页面路由配置
└── permission.js       # 权限控制
```

## 🚀 主要模块

### 棋盘组件

核心棋盘组件(`ChessBoard.vue`)支持完整的国际象棋规则，包括：

- 基本走子规则
- 特殊规则（王车易位、吃过路兵、兵升变等）
- 将军和将杀检测
- 移动动画和音效
- 坐标标注

### 对战系统

- 在线匹配：随机匹配或邀请好友
- 人机对战：多个难度级别
- 计时器：支持不同的对局时间控制

### 学习系统

- 规则教程：图文并茂的规则讲解
- 战术训练：分级的战术题目
- 开局库：学习常见的开局策略

## 📱 支持平台

- Web端
- 微信小程序
- Android/iOS应用

## 📄 许可证

本项目采用 [MIT许可证](LICENSE) 进行许可。

## 👨‍💻 贡献者

感谢所有为NovaChess项目做出贡献的开发者！

## 🔗 链接

- GitHub仓库：[https://github.com/LucusorShan/NovaChess](https://github.com/LucusorShan/NovaChess)
