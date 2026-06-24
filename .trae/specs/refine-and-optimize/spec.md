# Tetris 精细化完善与优化 Spec

## Why

上一轮 `deep-optimization` 已完成现代 Tetris 玩法补全（DAS/ARR、Lock Delay、T-Spin、B2B、Perfect Clear、DPI 渲染、移动端控制、131 测试）。但深度审计发现项目仍存在 **6 个关键 Bug**（SRS 逆时针踢墙表错误、Game Over 高分写入错误、DAS/ARR 左右键冲突、软降叠加问题等）、**大量死代码与过时文档**（README 仍写 77 测试、docs/ 6 篇全面过时、store 中 3 个死状态）、以及 **PWA/性能/可访问性** 等可提升空间。

本变更旨在系统性修复这些问题，使项目从"功能完整"提升到"工程精良"水准。

## What Changes

### A. 关键 Bug 修复（P0）
- **修复 SRS 逆时针踢墙表**：`reverseKickTable` 映射错误导致 R→0 和 2→R 旋转踢墙方向相反，靠墙逆时针旋转失败
- **修复 Game Over 高分写入**：`TetrisGame.tsx` 中 `onGameOver` 回调忽略 `_score` 参数，导致新纪录显示旧分数
- **统一 isNewRecord 判定**：snapshot 用 `>=`、gameOver 用 `>`，相等时 HUD 显示 NEW 但结束不认定新纪录
- **修复 DAS/ARR 左右键冲突**：按住左键 DAS 中再按右键，两方向定时器同时运行导致抖动
- **修复软降 DAS/ARR 叠加**：softDrop 同时触发 10 倍重力和 ARR 重复，下落速度远超预期
- **修复 tryHold 中 gameOver 后 pushState**：与 lockCurrent/spawnNext 模式不一致

### B. 代码清理与死代码移除（P1）
- **清理 store 死状态**：`flashLines`/`isTetris`/`levelUpLevel` 及对应 action/setTimeout 无组件读取
- **移除未使用依赖**：`react-hook-form`、`@hookform/resolvers` 在 src 中无 import
- **移除未使用组件**：`ui/card.tsx`、`ui/separator.tsx` 无业务引用
- **移除死代码方法**：`GameEngine.stopSoftDrop()` 公开方法、`Renderer.setLevelUpAnimation()`（或接入调用）
- **统一 highScore 存储**：引擎写 `tetris:best_score`、store 写 `tetris:store`，双源不一致
- **修复 Footer Esc 提示**：`over` 阶段 Esc 不响应，但 Footer 提示可返回菜单
- **关闭 AudioContext**：`GameEngine.stop()` 不释放 AudioContext，StrictMode 下泄漏
- **接入 DPR 变化监听**：`handleDPRChange` 从未调用，跨屏移动后画布模糊

### C. 文档同步（P1）
- **更新 README.md**：测试数 131、项目结构补全 4 个新文件、触屏说明改为虚拟按键、版本历史补 v2.0
- **更新 docs/ 6 篇**：01-立项（T-Spin/Lock Delay 已实现）、02-需求（测试数）、03-选型（tsconfig 配置）、04-架构（目录结构+测试明细）、05-规划（迭代方向勾选）、06-部署（测试数+产物体积）

### D. 工程化与性能（P2）
- **PWA 支持**：集成 `vite-plugin-pwa`，manifest + Service Worker + 离线支持
- **Vite chunk 分割**：React/Framer Motion/Radix 拆分，优化首屏
- **HUD 性能优化**：合并 store set 调用、添加 React.memo
- **ScoringSystem 分数表迁移**：T-Spin/Perfect Clear 硬编码分数移入 CONFIG

### E. UX 体验增强（P2）
- **SettingsPanel 扩展**：恢复默认按钮、音量调节滑块
- **GameOverModal 统计完善**：补 Singles/Doubles、最大 Combo、游戏时长
- **MainMenu 移动端提示**：触屏设备显示虚拟按键说明
- **a11y 改进**：canvas aria-label、Dialog role、prefers-reduced-motion

### F. 测试补全（P2）
- **SRS CCW 踢墙偏移值测试**：验证实际偏移而非仅数量
- **Input 类测试**：DAS/ARR、键盘去重、多键冲突
- **ScoringSystem 补充**：T-Spin Double Triple、T-Spin + Perfect Clear、B2B 跨链
- **GameEngine 集成**：Hold 触发 Game Over、Lock Delay + Hard Drop、Lock Delay RESET_MAX

## Impact

- **Affected specs**: deep-optimization（前序 spec，已完成，本变更在其基础上修复遗留问题）
- **Affected code**:
  - `src/engine/srs.ts` — 修复 reverseKickTable
  - `src/engine/GameEngine.ts` — isNewRecord 统一、tryHold pushState、stopSoftDrop 清理、AudioContext 释放、highScore 单源
  - `src/engine/Input.ts` — DAS/ARR 左右冲突、softDrop 移出 RepeatableAction
  - `src/engine/Renderer.ts` — DPR 监听接入、setLevelUpAnimation 处理
  - `src/engine/ScoringSystem.ts` — 分数表迁移 CONFIG、b2bActive 字段清理
  - `src/components/TetrisGame.tsx` — onGameOver 修复、setTimeout 清理、Overlays 渲染统一
  - `src/components/HUD.tsx` — 性能优化、pulse 颜色修复
  - `src/components/Footer.tsx` — Esc 提示修复
  - `src/components/SettingsPanel.tsx` — 重置按钮、音量调节
  - `src/components/GameOverModal.tsx` — 统计完善、a11y
  - `src/components/MainMenu.tsx` — 移动端提示
  - `src/store/useGameStore.ts` — 死状态清理、highScore 单源
  - `src/config/index.ts` — T-Spin/PC 分数表、音量配置
  - `src/lib/audio.ts` — close 方法、音量控制
  - `vite.config.ts` — PWA 插件、chunk 分割
  - `package.json` — 移除未用依赖、添加 vite-plugin-pwa
  - `README.md` + `docs/01-06-*.md` — 全面同步
  - `src/engine/__tests__/` — 补充测试

## ADDED Requirements

### Requirement: SRS 逆时针踢墙正确性
系统 SHALL 按 tetris.wiki 官方 SRS 表提供正确的逆时针旋转踢墙偏移，确保 R→0 和 2→R 转换使用正确的 Set A/B。

#### Scenario: 靠墙逆时针旋转
- **WHEN** 方块在 R 状态（rotation=1）紧贴右墙执行逆时针旋转
- **THEN** 使用 Set B 踢墙偏移（而非错误的 Set A），旋转成功

### Requirement: DAS/ARR 方向键互斥
系统 SHALL 在按下新方向键时取消旧方向的 DAS/ARR 定时器，避免左右键同时按住时抖动。

#### Scenario: 左键 DAS 中按右键
- **WHEN** 用户按住 ← 进入 DAS 计时，再按下 →
- **THEN** 立即取消 ← 的 DAS/ARR 定时器，仅 → 生效

### Requirement: 软降不触发 ARR
系统 SHALL 仅对 moveLeft/moveRight 启用 DAS/ARR 自动重复，softDrop 由 softDropActive 标志驱动重力加速，避免双重下落。

#### Scenario: 按住软降
- **WHEN** 用户按住 ↓
- **THEN** 仅以 dropInterval/10 重力加速下落，不触发 ARR 重复 tryMove

### Requirement: Game Over 高分正确写入
系统 SHALL 在游戏结束触发新纪录时，将最终分数（而非旧 highScore）写入 store 的 newRecord 状态。

#### Scenario: 破纪录
- **WHEN** 游戏结束且 score > highScore
- **THEN** GameOverModal 显示的 BEST 为本次 score，NEW RECORD 徽章亮起

### Requirement: PWA 离线支持
系统 SHALL 作为 PWA 可安装并支持离线运行，通过 Service Worker 缓存静态资源。

#### Scenario: 离线访问
- **WHEN** 用户首次访问后断网再次打开
- **THEN** 游戏可正常加载与运行

### Requirement: AudioContext 资源释放
系统 SHALL 在引擎停止时关闭 AudioContext，避免 StrictMode 下的资源泄漏。

#### Scenario: 组件卸载
- **WHEN** TetrisGame 组件卸载触发 engine.stop()
- **THEN** AudioContext.close() 被调用，资源释放

### Requirement: DPR 变化响应
系统 SHALL 监听窗口 resize 与 devicePixelRatio 变化，重新设置 Canvas backing store。

#### Scenario: 跨屏移动
- **WHEN** 用户将浏览器窗口拖到不同 DPI 的显示器
- **THEN** Canvas 重新按新 DPR 缩放，保持清晰

## MODIFIED Requirements

### Requirement: isNewRecord 判定（修订）
统一 snapshot 与 gameOver 的判定为 `score > highScore`（严格大于），避免相等时 HUD 与结束判定不一致。

### Requirement: tryHold 状态推送（修订）
holdType 互换后若触发 gameOver，不再 pushState，与 lockCurrent/spawnNext 保持一致。

### Requirement: highScore 存储（修订）
统一为单一数据源：引擎不再直接写 `tetris:best_score`，由 store 通过 persist 中间件统一管理 `tetris:store`。

### Requirement: 升级动画（修订）
接入 `renderer.setLevelUpAnimation()` 调用，或移除该方法。本变更选择接入，使升级时画布显示"LEVEL X"文字动画。

### Requirement: store 状态（修订）
移除未被任何组件读取的 `flashLines`/`isTetris`/`levelUpLevel` 状态及对应 action 与 setTimeout 清理逻辑。

### Requirement: Footer 提示（修订）
`over` 阶段增加 Esc 返回菜单支持，使 Footer 提示与实际行为一致。

### Requirement: ScoringSystem 配置（修订）
T-Spin/Perfect Clear 分数表从方法内硬编码迁移到 CONFIG，遵循单一数据源原则。

## REMOVED Requirements

### Requirement: react-hook-form 依赖
**Reason**: src 中无任何 import，未使用依赖。
**Migration**: 从 package.json 移除 `react-hook-form` 和 `@hookform/resolvers`。

### Requirement: ui/card 与 ui/separator 组件
**Reason**: 无业务代码 import，死代码。
**Migration**: 删除 `src/components/ui/card.tsx` 和 `src/components/ui/separator.tsx`。

### Requirement: GameEngine.stopSoftDrop 公开方法
**Reason**: 从未被外部调用，softDrop 由 handleAction 内部处理。
**Migration**: 移除 public 修饰符或删除该方法（保留内部 handleAction 路径）。
