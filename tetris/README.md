# Tetris Web · v2.0

> 经典网页版俄罗斯方块 — 7-bag + SRS 旋转 + Hold/Next/Ghost + NES 计分 + 60fps

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Stack](https://img.shields.io/badge/stack-React%2018%20%2B%20Vite%20%2B%20TS-purple)
![Tests](https://img.shields.io/badge/tests-77%2F77-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 一、简介

本项目是 Web_Game_01 项目库的**第三款产品**，复刻现代俄罗斯方块的完整体验：

- 🧩 **7 种方块**（I/O/T/S/Z/J/L）严格按 SRS 旋转表
- 🎲 **7-bag 随机**：每 7 个方块内 7 种都恰好出现 1 次
- 👻 **Ghost 阴影**：当前方块落地位置预览
- 📦 **Hold / Next**：现代机制标配
- ⚡ **60Hz 主循环 + 速度曲线**：每 10 行 +1 级
- 🎵 **9 个 Web Audio 合成音效**：零素材依赖
- 📱 **键盘 + 触屏**：桌面 + 移动端通用
- 💾 **最高分持久化**：localStorage

**质量门禁**：
- ✅ TypeScript 严格模式 + Zod schema
- ✅ 77 个单元测试全绿
- ✅ ESLint 0 错误
- ✅ Vercel 部署就绪

---

## 二、在线试玩

> 🚀 [https://web-game-01-tetris.vercel.app](https://web-game-01-tetris.vercel.app) _(部署后填入)_

---

## 三、操作说明

### 3.1 键盘

| 键 | 动作 |
| --- | --- |
| `←` / `→` 或 `A` / `D` | 左右移动 |
| `↓` 或 `S` | 软降（加速下落） |
| `↑` / `W` / `X` | 顺时针旋转 |
| `Z` | 逆时针旋转 |
| `Space` | 硬降（一键到底） |
| `C` 或 `Shift` | Hold（暂存当前方块） |
| `P` 或 `Esc` | 暂停 / 继续 |
| `R` | 重开 |
| `M` | 切换静音 |
| `Enter` | 开始 / 继续 |

### 3.2 触屏

| 手势 | 动作 |
| --- | --- |
| 左滑 / 右滑 | 左右移动 |
| 上滑 | 硬降 |
| 下滑 | 软降 |
| 点击 | 旋转 |
| 双指点击 | Hold |

### 3.3 移动端

- 横向放置设备获得最佳体验
- Canvas 自动适配屏幕宽度
- 触屏阈值 30px（避免误触）

---

## 四、本地运行

### 4.1 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 4.2 安装与启动

```bash
# 1. 克隆仓库（如未克隆）
git clone <repo-url>
cd Web_Game_01/games/tetris

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# → http://127.0.0.1:5175/

# 4. 构建生产产物
npm run build

# 5. 本地预览生产构建
npm run preview
# → http://127.0.0.1:4175/
```

---

## 五、构建与测试

```bash
# TypeScript 严格模式类型检查
npm run type-check

# ESLint 代码风格检查
npm run lint

# 自动修复 ESLint 错误
npm run lint:fix

# Prettier 格式化
npm run format

# 单元测试（单次运行）
npm run test

# 单元测试（监听模式）
npm run test:watch

# 生产构建
npm run build
```

**质量门禁标准**：
- `type-check` 0 错误
- `lint` 0 错误
- `test` 77/77 全绿
- `build` 成功，产物 ≤ 500KB gzip

---

## 六、项目结构

```
games/tetris/
├── docs/                              # 项目文档（6 篇）
│   ├── 01-项目立项.md
│   ├── 02-需求拆分.md
│   ├── 03-技术选型.md
│   ├── 04-项目架构.md
│   ├── 05-执行规划.md
│   └── 06-部署指南.md
├── public/                            # 静态资源
│   ├── 404.html
│   └── favicon.svg
├── src/
│   ├── components/                    # React UI 层
│   │   ├── ui/                        # shadcn/ui 组件
│   │   ├── TetrisGame.tsx             # Canvas 挂载 + Engine Context
│   │   ├── HUD.tsx                    # 顶部状态栏
│   │   ├── MainMenu.tsx               # 主菜单遮罩
│   │   ├── PauseOverlay.tsx           # 暂停遮罩
│   │   ├── GameOverModal.tsx          # 结束弹窗
│   │   ├── SettingsPanel.tsx          # 设置面板
│   │   ├── Overlays.tsx               # 遮罩统一管理
│   │   └── Footer.tsx                 # 底部快捷键
│   ├── engine/                        # 纯 TS 游戏引擎
│   │   ├── GameEngine.ts              # 编排 + 状态机
│   │   ├── Board.ts                   # 网格核心
│   │   ├── Tetromino.ts               # 方块实体
│   │   ├── tetrominoes.ts             # 7 种方块形状
│   │   ├── srs.ts                     # SRS 踢墙表
│   │   ├── Bag.ts                     # 7-bag 随机
│   │   ├── Renderer.ts                # Canvas 渲染
│   │   ├── Input.ts                   # 键盘 + 触屏
│   │   └── __tests__/                 # 单元测试（77 个）
│   ├── lib/
│   │   ├── audio.ts                   # Web Audio 合成
│   │   ├── storage.ts                 # localStorage 封装
│   │   └── utils.ts                   # cn 工具
│   ├── store/
│   │   └── useGameStore.ts            # Zustand 全局状态
│   ├── config/
│   │   └── index.ts                   # CONFIG + Zod schema
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── components.json                    # shadcn/ui 配置
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                        # Vercel 部署配置
├── vite.config.ts
└── README.md                          # 本文件
```

---

## 七、技术栈

| 类别 | 选型 |
| --- | --- |
| 构建工具 | Vite 5 |
| 框架 | React 18 |
| 语言 | TypeScript 5（strict） |
| 样式 | Tailwind CSS 3 |
| 组件库 | shadcn/ui（Radix UI + CVA） |
| 状态管理 | Zustand 4 |
| 动画 | Framer Motion 11 |
| 图标 | Lucide Icons |
| 渲染 | Canvas 2D |
| 测试 | Vitest 1 + happy-dom 14 |
| Schema 校验 | Zod 3 |
| 部署 | Vercel |

完整技术决策见 [03 - 技术选型](./docs/03-技术选型.md)。

---

## 八、核心架构

### 8.1 三层分离

```
UI 层（React + Framer Motion）
   ↓ Engine Context + Zustand
状态层（Zustand + persist）
   ↓ callbacks（onPhaseChange / onStateChange / ...）
引擎层（Pure TypeScript，框架无关）
   ├─ Board / Tetromino / Bag / SRS
   ├─ GameEngine（编排 + 状态机 + 主循环）
   ├─ Renderer（Canvas 2D）
   ├─ Input（键盘 + 触屏）
   └─ AudioSystem（Web Audio 合成）
```

### 8.2 关键设计

- **引擎不订阅 store**：60fps 主循环通过 callbacks 推送事件，避免 React re-render 卡顿
- **Canvas 一次性绘制**：每帧 clear + 全量重绘，元素少时性能最佳
- **60Hz 固定步长**：物理模拟与帧率解耦，标签页切换不卡顿
- **SRS 严格按 tetris.wiki 官方表**：26 个单元测试逐 case 覆盖

完整架构见 [04 - 项目架构](./docs/04-项目架构.md)。

---

## 九、数据流

### 9.1 引擎 → UI（事件驱动）

```
GameEngine.tickGravity()
   ↓
lockCurrent() → findFullLines() → handleLineClear(rows)
   ↓
callbacks.onLinesClear(count, isTetris)  →  useGameStore.setLinesClear(...)
   ↓
React re-render HUD
```

### 9.2 UI → 引擎（命令驱动）

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

## 十、相关文档

- 📄 [01 - 项目立项](./docs/01-项目立项.md) — 立项动机与范围
- 📄 [02 - 需求拆分](./docs/02-需求拆分.md) — 任务清单 + PRD 映射
- 📄 [03 - 技术选型](./docs/03-技术选型.md) — 技术决策
- 📄 [04 - 项目架构](./docs/04-项目架构.md) — 代码组织
- 📄 [05 - 执行规划](./docs/05-执行规划.md) — 实施步骤
- 📄 [06 - 部署指南](./docs/06-部署指南.md) — Vercel 上线手册
- 📄 [PRD-03 俄罗斯方块](../../docs/prd/PRD-03-俄罗斯方块.md) — 完整产品需求

---

## 十一、贡献

本项目是 Web_Game_01 项目库的一部分，遵循项目库的 v2.0 质量优先栈规范：

- 单一职责：每个类 / 组件只做一件事
- 类型安全：TypeScript 严格模式
- 测试覆盖：核心算法 100% 单测
- 文档齐全：每个项目 6 篇文档 + README
- 部署就绪：Vercel 一键部署

---

## 十二、参考资源

- 🔗 [Tetris Wiki - SRS](https://tetris.wiki/Super_Rotation_System)
- 🔗 [Tetris Guideline](https://tetris.wiki/Tetris_Guideline)
- 🔗 [Jstris - 经典在线俄罗斯方块](https://jstris.jezevec10.com/)
- 🔗 [Vite](https://vitejs.dev/)
- 🔗 [React](https://react.dev/)
- 🔗 [Zustand](https://github.com/pmndrs/zustand)

---

## 十三、版本历史

| 版本 | 日期 | 描述 |
| --- | --- | --- |
| v0.1.0 | 2026-06-23 | 初版：完整可玩 + SRS + Hold + 等级 + 77 测试 + 6 文档 |

---

## 十四、License

MIT © 2026 Web_Game_01
