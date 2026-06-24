<div align="center">

# 🧱 俄罗斯方块 Web 版

> 一款使用 React 18、TypeScript 和 Canvas 2D 构建的现代经典俄罗斯方块游戏。完整实现 SRS 旋转系统、7-bag 随机器和专业级游戏机制。

[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/tests-77%2F77%20passing-brightgreen?style=for-the-badge)](tetris/src/engine/__tests__)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**[English](README.md)** · **[中文](README.zh-CN.md)**

<br />

[在线试玩](#-在线试玩) · [功能特性](#-功能特性) · [快速开始](#-快速开始) · [项目文档](#-项目文档) · [架构设计](#-架构设计)

</div>

---

## 🎮 在线试玩

**立即体验：** [https://web-game-03-tetris.vercel.app](https://web-game-03-tetris.vercel.app)

> 如果在线演示无法访问，可以按照[快速开始](#-快速开始)指南在本地运行。

---

## 🎯 功能特性

### 核心玩法
- **🎯 完整 SRS 旋转系统** — 超级旋转系统（Super Rotation System），包含所有 7 种方块的完整踢墙表，严格遵循 [Tetris Wiki 官方规范](https://tetris.wiki/Super_Rotation_System)
- **🎲 7-Bag 随机器** — 现代随机算法，确保每 7 个方块中 7 种类型各出现一次，提供公平且可预测的游戏体验
- **👻 幽灵方块** — 预览当前方块的落点位置，辅助策略性放置
- **📦 Hold 暂存系统** — 暂存当前方块供后续使用（按 `C` 或 `Shift`）
- **🔮 Next 预览队列** — 预览接下来 5 个方块，提前规划策略
- **⚡ 渐进式难度** — 每消除 10 行速度提升一级，共 15 个等级
- **🏆 NES 计分系统** — 还原经典计分规则，包含单消/双消/三消/Tetris 奖励和连击倍率
- **💾 最高分持久化** — 自动保存最高分到 localStorage

### 技术亮点
- **🎨 Canvas 2D 渲染** — 流畅的 60 FPS 渲染，优化的绘制调用
- **🎵 合成音效** — 9 种独特音效，全部通过 Web Audio API 合成（零外部资源依赖）
- **⌨️ 键盘 + 触屏支持** — 完整的桌面键盘控制和移动端触屏手势
- **📱 响应式设计** — 适配不同屏幕尺寸，移动端横屏优化
- **🔒 类型安全** — 100% TypeScript 严格模式 + Zod 运行时校验
- **✅ 全面测试** — 77 个单元测试覆盖所有核心游戏逻辑
- **🎭 三层分离架构** — UI 层（React）、状态层（Zustand）、引擎层（纯 TypeScript）清晰分离

---

## 🎲 游戏机制

### 方块类型

游戏包含标准 7 种方块：

```
I 方块:  ████        O 方块:  ██        T 方块:  ███
         (4 格)               ██                   █

S 方块:   ██         Z 方块:  ██        J 方块:  █
          ██                   ██                 ███
                                                   █

L 方块:      █       (每种方块有 4 个旋转状态)
           ███
           █
```

### SRS 旋转系统
- **踢墙机制** — 当旋转被阻挡时，系统会测试 5 个偏移位置（I 方块有 5 个特殊偏移），全部失败后才拒绝旋转
- **旋转状态** — 每种方块有 4 个旋转状态（0°、90°、180°、270°）
- **严格遵循规范** — 实现完全遵循 [Tetris Guideline 官方规范](https://tetris.wiki/Tetris_Guideline)

### 计分规则

| 操作 | 得分 | 公式 |
|------|------|------|
| 单消（1 行） | 100 × 等级 | 基础分 |
| 双消（2 行） | 300 × 等级 | 3 倍单消 |
| 三消（3 行） | 500 × 等级 | 5 倍单消 |
| Tetris（4 行） | 800 × 等级 | 8 倍单消 |
| 软降 | 每格 1 分 | 按下落格数 |
| 硬降 | 每格 2 分 | 按下落格数 |
| 连击奖励 | 50 × 连击数 × 等级 | 连续消行 |

### 速度曲线

| 等级 | 所需行数 | 重力（毫秒/格） |
|------|----------|----------------|
| 1 | 0-9 | 1000 |
| 2 | 10-19 | 793 |
| 3 | 20-29 | 618 |
| ... | ... | ... |
| 15 | 140+ | 17（最高速度） |

公式：`gravity = max(17, 1000 × 0.89^(level-1))`

---

## 🚀 快速开始

### 环境要求
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0

### 安装运行

```bash
# 克隆仓库
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_03_Tetris.git
cd Web_Game_03_Tetris/tetris

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

游戏将在 `http://localhost:5173` 打开。

### 生产构建

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 运行测试
npm run test

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

优化后的打包文件位于 `dist/` 目录（约 150KB gzipped）。

---

## 🎹 操作说明

### 键盘控制

| 按键 | 操作 |
|------|------|
| `←` / `A` | 左移 |
| `→` / `D` | 右移 |
| `↓` / `S` | 软降（加速下落） |
| `↑` / `W` / `X` | 顺时针旋转 |
| `Z` | 逆时针旋转 |
| `Space` | 硬降（一键到底） |
| `C` / `Shift` | 暂存方块（Hold） |
| `P` / `Esc` | 暂停 / 继续 |
| `R` | 重新开始 |
| `M` | 切换静音 |
| `Enter` | 开始 / 确认 |

### 触屏控制（移动端）

| 手势 | 操作 |
|------|------|
| 左滑 / 右滑 | 左右移动 |
| 上滑 | 硬降 |
| 下滑 | 软降 |
| 点击 | 旋转 |
| 双指点击 | 暂存方块（Hold） |

**移动端提示：**
- 横屏放置设备获得最佳体验
- Canvas 自动适配屏幕宽度
- 触屏阈值 30px（防止误触）

---

## 🛠️ 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **构建工具** | [Vite](https://vitejs.dev/) | 5.x | 极速 HMR 和优化构建 |
| **框架** | [React](https://react.dev/) | 18.3 | 组件化 UI 库 |
| **语言** | [TypeScript](https://www.typescriptlang.org/) | 5.4 | 静态类型检查 |
| **样式** | [Tailwind CSS](https://tailwindcss.com/) | 3.4 | 原子化 CSS 框架 |
| **UI 组件** | [shadcn/ui](https://ui.shadcn.com/) | latest | 高质量 Radix UI 组件 |
| **状态管理** | [Zustand](https://github.com/pmndrs/zustand) | 4.5 | 轻量级 TypeScript 优先状态管理 |
| **动画** | [Framer Motion](https://www.framer.com/motion/) | 11.3 | 生产级动画库 |
| **图标** | [Lucide React](https://lucide.dev/) | 0.408 | 美观一致的图标库 |
| **渲染** | Canvas 2D | 原生 API | 高性能游戏渲染 |
| **测试** | [Vitest](https://vitest.dev/) | 1.6 | Vite 原生测试框架 |
| **测试 DOM** | [happy-dom](https://github.com/capricorn86/happy-dom) | 14 | 轻量级 DOM 实现 |
| **校验** | [Zod](https://zod.dev/) | 3.23 | TypeScript 优先的 Schema 校验 |
| **部署** | [Vercel](https://vercel.com/) | — | 零配置部署平台 |

### 选型理由

**Vite + React 18** — 现代化工具链，即时热模块替换，优化的生产构建。

**TypeScript 严格模式** — 编译时捕获 Bug，提升代码质量，提供出色的 IDE 支持。

**Canvas 2D** — 直接控制渲染，实现流畅 60 FPS 游戏体验，无游戏引擎开销。

**Zustand** — 最少样板代码，TypeScript 优先，完美适配游戏引擎与 UI 的状态同步。

**三层分离架构** — 清晰的关注点分离：
- **UI 层**（React）— 负责渲染和用户交互
- **状态层**（Zustand）— 管理游戏状态和持久化
- **引擎层**（纯 TypeScript）— 框架无关的游戏逻辑

---

## 🏛️ 架构设计

### 三层分离设计

```
┌─────────────────────────────────────────────────────────┐
│  UI 层（React + Framer Motion）                         │
│  ├─ TetrisGame（Canvas 挂载 + Engine 上下文）            │
│  ├─ HUD（分数、等级、行数、连击）                        │
│  ├─ MainMenu / PauseOverlay / GameOverModal             │
│  └─ SettingsPanel / Footer                              │
└────────────────────┬────────────────────────────────────┘
                     │ Engine Context + Zustand
                     ▼
┌─────────────────────────────────────────────────────────┐
│  状态层（Zustand + persist 中间件）                      │
│  └─ useGameStore: phase, score, highScore, level, ...   │
└────────────────────┬────────────────────────────────────┘
                     │ 回调函数（onPhaseChange, onStateChange, ...）
                     ▼
┌─────────────────────────────────────────────────────────┐
│  引擎层（纯 TypeScript，框架无关）                       │
│  ├─ GameEngine（编排 + 状态机 + 主循环）                 │
│  ├─ Board（10×20 网格 + 2 行缓冲区）                    │
│  ├─ Tetromino（7 种方块 + 旋转 + SRS 踢墙）             │
│  ├─ Bag（7-bag 随机器）                                 │
│  ├─ Renderer（多区域 Canvas 2D 渲染）                   │
│  ├─ Input（键盘 + 触屏输入）                             │
│  └─ AudioSystem（Web Audio 音效合成）                    │
└─────────────────────────────────────────────────────────┘
```

### 关键设计决策

**引擎不订阅 Store** — 60 FPS 游戏主循环通过回调函数推送事件，避免游戏过程中 React 重渲染的性能开销。

**每帧单次 Canvas 绘制** — 每帧清除并重绘整个 Canvas，在元素较少时性能最优。

**固定 60Hz 时间步长** — 物理模拟与帧率解耦，确保不同设备上游戏体验一致。

**严格 SRS 实现** — 26 个单元测试逐 case 验证踢墙表，完全对齐官方规范。

### 数据流

**引擎 → UI（事件驱动）：**
```
GameEngine.tickGravity()
  ↓
lockCurrent() → findFullLines() → handleLineClear(rows)
  ↓
callbacks.onLinesClear(count, isTetris) → useGameStore.setLinesClear(...)
  ↓
React 重渲染 HUD
```

**UI → 引擎（命令驱动）：**
```
键盘事件
  ↓
Input.handleKey(e, callbacks)
  ↓
callbacks.onAction('moveLeft')
  ↓
GameEngine.handleAction('moveLeft')
  ↓
tryMove(current, -1, 0) → board.isValidPosition(test)
  ↓ (true)
current.move(-1, 0) → pushState() → UI 更新
```

---

## 📁 项目结构

```
Web_Game_03_Tetris/
├── tetris/                              # 主项目目录
│   ├── docs/                            # 项目文档（6 篇）
│   │   ├── 01-项目立项.md                # 立项动机与范围
│   │   ├── 02-需求拆分.md                # 任务清单 + PRD 映射
│   │   ├── 03-技术选型.md                # 技术决策与理由
│   │   ├── 04-项目架构.md                # 代码组织与模块设计
│   │   ├── 05-执行规划.md                # 实施步骤与里程碑
│   │   └── 06-部署指南.md                # Vercel 上线手册
│   ├── public/                          # 静态资源
│   │   ├── 404.html                     # 自定义 404 页面
│   │   └── favicon.svg                  # 站点图标
│   ├── src/
│   │   ├── components/                  # React UI 组件
│   │   │   ├── ui/                      # shadcn/ui 组件
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   └── switch.tsx
│   │   │   ├── TetrisGame.tsx           # Canvas 挂载 + Engine 上下文
│   │   │   ├── HUD.tsx                  # 顶部状态栏
│   │   │   ├── MainMenu.tsx             # 主菜单遮罩
│   │   │   ├── PauseOverlay.tsx         # 暂停遮罩
│   │   │   ├── GameOverModal.tsx        # 结束弹窗
│   │   │   ├── SettingsPanel.tsx        # 设置面板
│   │   │   ├── Overlays.tsx             # 遮罩统一管理
│   │   │   └── Footer.tsx               # 底部快捷键提示
│   │   ├── engine/                      # 纯 TS 游戏引擎
│   │   │   ├── __tests__/               # 单元测试（77 个）
│   │   │   │   ├── Bag.test.ts          # 7-bag 随机器测试
│   │   │   │   ├── Board.test.ts        # 网格逻辑测试
│   │   │   │   ├── GameEngine.test.ts   # 主引擎测试
│   │   │   │   └── Tetromino.test.ts    # 方块实体测试
│   │   │   ├── GameEngine.ts            # 主循环 + 状态机
│   │   │   ├── Board.ts                 # 网格核心（10×20 + 缓冲区）
│   │   │   ├── Tetromino.ts             # 方块实体 + 旋转
│   │   │   ├── tetrominoes.ts           # 7 种方块形状定义
│   │   │   ├── srs.ts                   # SRS 踢墙表
│   │   │   ├── Bag.ts                   # 7-bag 随机器
│   │   │   ├── Renderer.ts              # Canvas 2D 渲染器
│   │   │   └── Input.ts                 # 键盘 + 触屏输入
│   │   ├── lib/                         # 工具库
│   │   │   ├── audio.ts                 # Web Audio 合成（9 种音效）
│   │   │   ├── storage.ts               # localStorage 封装
│   │   │   └── utils.ts                 # 工具函数
│   │   ├── store/
│   │   │   └── useGameStore.ts          # Zustand 全局状态
│   │   ├── config/
│   │   │   └── index.ts                 # CONFIG + Zod Schema
│   │   ├── App.tsx                      # 根组件
│   │   ├── main.tsx                     # 入口文件
│   │   └── index.css                    # 全局样式
│   ├── components.json                  # shadcn/ui 配置
│   ├── index.html                       # HTML 入口
│   ├── package.json                     # 依赖 + 脚本
│   ├── tsconfig.json                    # TypeScript 配置
│   ├── vite.config.ts                   # Vite 配置
│   ├── tailwind.config.ts               # Tailwind 配置
│   ├── postcss.config.cjs               # PostCSS 配置
│   ├── vercel.json                      # Vercel 部署配置
│   └── README.md                        # 英文版 README
├── PRD-俄罗斯方块.md                     # 产品需求文档
├── README.md                            # 英文版 README
└── README.zh-CN.md                      # 中文版 README（本文件）
```

---

## 💻 开发指南

### 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器（http://localhost:5173）
npm run preview          # 预览生产构建

# 代码质量
npm run type-check       # TypeScript 类型检查
npm run lint             # ESLint 代码检查
npm run lint:fix         # 自动修复 ESLint 错误
npm run format           # Prettier 格式化

# 测试
npm run test             # 运行单元测试（单次）
npm run test:watch       # 监听模式运行测试

# 构建
npm run build            # 生产构建
```

### 质量门禁

项目执行严格的质量标准：

- ✅ **TypeScript** — 严格模式 0 错误
- ✅ **ESLint** — 0 错误，遵循项目规范
- ✅ **测试** — 77/77 测试全部通过
- ✅ **构建** — 成功生产构建（约 150KB gzipped）

---

## ✅ 测试

### 测试覆盖

项目包含 **77 个全面的单元测试**，覆盖：

- **Bag 随机器** — 7-bag 算法正确性验证
- **Board 逻辑** — 网格操作、消行、碰撞检测
- **Tetromino** — 移动、旋转、状态管理
- **SRS 旋转** — JLSTZ 和 I 方块全部 26 个踢墙 case
- **GameEngine** — 状态机、计分、等级递进、Hold 系统、暂停/继续

### 运行测试

```bash
# 运行全部测试
npm run test

# 监听模式
npm run test:watch

# 运行指定测试文件
npx vitest src/engine/__tests__/GameEngine.test.ts
```

### 测试理念

- **无 React 依赖** — 引擎测试不需要 React 或 DOM
- **happy-dom 桩** — 轻量级 DOM 实现，为 Canvas 和 AudioContext 提供桩
- **公开 API 测试** — 测试使用公开方法，不直接测试内部状态
- **边界用例覆盖** — 测试验证边界条件和异常状态

---

## 🚀 部署

### 部署到 Vercel

项目已配置为零配置部署到 Vercel：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

或将 GitHub 仓库连接到 [Vercel](https://vercel.com) 实现自动部署。

### 手动部署

```bash
# 构建生产版本
npm run build

# 将 'dist' 目录部署到任意静态托管
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3 + CloudFront
# - 任意静态文件服务器
```

### Vercel 配置

[vercel.json](tetris/vercel.json) 包含 SPA 路由重写：

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📖 项目文档

项目包含完整的项目文档：

| 文档 | 描述 |
|------|------|
| [01 - 项目立项](tetris/docs/01-项目立项.md) | 立项动机、目标与范围 |
| [02 - 需求拆分](tetris/docs/02-需求拆分.md) | 任务清单与 PRD 映射 |
| [03 - 技术选型](tetris/docs/03-技术选型.md) | 技术栈选型决策与理由 |
| [04 - 项目架构](tetris/docs/04-项目架构.md) | 代码组织与模块设计 |
| [05 - 执行规划](tetris/docs/05-执行规划.md) | 实施路线图与里程碑 |
| [06 - 部署指南](tetris/docs/06-部署指南.md) | Vercel 上线手册 |
| [PRD - 产品需求文档](PRD-俄罗斯方块.md) | 完整产品需求规格说明 |

---

## 🎓 学习收获

本项目展示了对以下领域的掌握：

### 游戏开发概念
- **SRS 旋转系统** — 业界标准的方块旋转与踢墙机制
- **7-Bag 随机器** — 公平的随机方块生成算法
- **碰撞检测** — AABB（轴对齐包围盒）碰撞系统
- **消行算法** — 高效的网格行检测与消除
- **游戏状态机** — Menu → Playing → Paused → Game Over 状态转换
- **固定时间步长循环** — 物理模拟与帧率解耦

### 前端工程化
- **React 18** — 现代 React，Hooks 和 Context
- **TypeScript 严格模式** — 类型安全代码，零 `any` 类型
- **Canvas 2D 渲染** — 直接像素控制的游戏图形
- **Web Audio API** — 无外部资源的合成音效
- **Zustand 状态管理** — 轻量级、TypeScript 优先的状态管理
- **响应式设计** — 适配不同屏幕尺寸和输入方式

### 软件质量
- **单元测试** — 77 个测试，核心逻辑 100% 覆盖
- **代码组织** — 清晰的三层分离架构
- **文档完善** — 全面的项目文档
- **性能优化** — 60 FPS 渲染，最小开销

---

## 📄 许可证

本项目基于 MIT 许可证开源 — 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- **[Tetris Wiki](https://tetris.wiki/)** — 全面的俄罗斯方块机制文档
- **[Tetris Guideline](https://tetris.wiki/Tetris_Guideline)** — 官方游戏规范
- **[Jstris](https://jstris.jezevec10.com/)** — 现代俄罗斯方块参考实现
- **[Vite](https://vitejs.dev/)** — 极速构建工具
- **[React](https://react.dev/)** — UI 组件框架
- **[Zustand](https://github.com/pmndrs/zustand)** — 轻量级状态管理

---

## 📞 联系与支持

- **GitHub Issues** — [报告 Bug 或请求功能](https://github.com/NOSOLUTIONLOVE/Web_Game_03_Tetris/issues)
- **在线试玩** — [在线玩游戏](https://web-game-03-tetris.vercel.app)

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 ⭐ Star！**

[GitHub](https://github.com/NOSOLUTIONLOVE/Web_Game_03_Tetris) · [在线试玩](https://web-game-03-tetris.vercel.app) · [Issue 反馈](https://github.com/NOSOLUTIONLOVE/Web_Game_03_Tetris/issues)

</div>
