# Tasks

## 阶段 A：关键 Bug 修复 + 输入系统重构

- [x] Task 1: 修复软降持续下落逻辑
  - [x] SubTask 1.1: 在 `Input.ts` 中新增 keydown/keyup 配对跟踪，维护 `pressedKeys` 集合
  - [x] SubTask 1.2: `Input.bind` 注册 keyup 监听器，`unbind` 清理
  - [x] SubTask 1.3: `GameEngine.handleAction` 的 `softDrop` 改为设置 `softDropActive=true`，新增 `stopSoftDrop` 设置 `false`
  - [x] SubTask 1.4: 删除 `GameEngine.endSoftDrop()`，改为 Input 直接调用 `stopSoftDrop`
  - [x] SubTask 1.5: 验证按住 ↓ 持续下落，松开停止

- [x] Task 2: 实现 DAS/ARR 自动重复
  - [x] SubTask 2.1: `CONFIG` 新增 `INPUT.DAS_MS`（默认 167）、`INPUT.ARR_MS`（默认 33）
  - [x] SubTask 2.2: `Input.ts` 新增 DAS/ARR 定时器：首次按下立即移动，按住超过 DAS 后以 ARR 间隔重复
  - [x] SubTask 2.3: 仅对 `moveLeft`/`moveRight`/`softDrop` 启用自动重复，旋转/Hold/硬降不重复
  - [x] SubTask 2.4: keyup 清除对应键的定时器
  - [x] SubTask 2.5: 验证按住 ←/→ 延迟后连续移动

- [x] Task 3: 修复状态推送时序
  - [x] SubTask 3.1: `lockCurrent` 中 `spawnNext` 返回 gameOver 标志，若 gameOver 则跳过 `pushState`
  - [x] SubTask 3.2: `spawnNext` 改为返回 `boolean`（是否触发 gameOver）
  - [x] SubTask 3.3: 验证 Game Over 时不推送不一致快照

- [x] Task 4: 清理死代码
  - [x] SubTask 4.1: 删除 `Board.isColumnOverflow()` 方法
  - [x] SubTask 4.2: 删除 `CONFIG.TOUCH.SWIPE_*` 未使用常量
  - [x] SubTask 4.3: 检查并移除其他未引用的导出

## 阶段 B：现代 Tetris 玩法补全

- [x] Task 5: 新增 LockDelayManager
  - [x] SubTask 5.1: 新建 `src/engine/LockDelayManager.ts`
  - [x] SubTask 5.2: 实现 `start()`/`reset()`/`tick(dt)`/`shouldLock()`/`forceLock()`
  - [x] SubTask 5.3: 配置 `CONFIG.LOCK_DELAY_MS`（500）、`CONFIG.LOCK_RESET_MAX`（15）
  - [x] SubTask 5.4: `GameEngine.tickGravity` 触底时启动 LockDelay，移动/旋转时 reset
  - [x] SubTask 5.5: `update()` 中 `lockDelay.tick(dt)`，到时强制锁定

- [x] Task 6: 新增 ScoringSystem 计分模块
  - [x] SubTask 6.1: 新建 `src/engine/ScoringSystem.ts`
  - [x] SubTask 6.2: 迁移 NES 计分逻辑（Single/Double/Triple/Tetris × level + combo）
  - [x] SubTask 6.3: 新增 T-Spin 计分表（T-Spin Single 800 / Mini 200 / Double 1200 / Triple 1600）
  - [x] SubTask 6.4: 新增 Back-to-Back ×1.5 逻辑（连续 Tetris 或 T-Spin）
  - [x] SubTask 6.5: 新增 Perfect Clear 奖励分
  - [x] SubTask 6.6: `GameEngine.handleLineClear` 改为委托 `ScoringSystem.calculate()`

- [x] Task 7: T-Spin 检测
  - [x] SubTask 7.1: `Board.ts` 新增 `isTSpin(piece, lastMoveWasRotate)`：3-corner 法
  - [x] SubTask 7.2: 检测 T 块旋转后中心四角的占据情况（≥3 角且含前向角 = T-Spin）
  - [x] SubTask 7.3: 区分 T-Spin Mini（仅 2 前角 + 1 后角）与 T-Spin（3 角含 2 前角）
  - [x] SubTask 7.4: `GameEngine` 跟踪 `lastMoveWasRotate`，锁定时传入检测

- [x] Task 8: Perfect Clear 检测
  - [x] SubTask 8.1: `Board.ts` 新增 `isEmpty()` 方法
  - [x] SubTask 8.2: `handleLineClear` 消行后检测 `board.isEmpty()`，触发 Perfect Clear 加成

- [x] Task 9: 统计数据跟踪
  - [x] SubTask 9.1: `GameEngine` 新增 `stats` 对象（pieces / lineClears by type / tSpins / perfectClears）
  - [x] SubTask 9.2: `GameSnapshot` 新增 `stats` 字段
  - [x] SubTask 9.3: `useGameStore` 新增 `stats` 状态与 `setStats` action
  - [x] SubTask 9.4: `GameOverModal` 显示统计数据

## 阶段 C：性能与渲染优化

- [x] Task 10: DPI 感知 Canvas 渲染
  - [x] SubTask 10.1: `Renderer` 构造时按 `window.devicePixelRatio` 设置 backing store 尺寸
  - [x] SubTask 10.2: `ctx.scale(dpr, dpr)` 统一坐标系
  - [x] SubTask 10.3: Canvas CSS 尺寸保持设计尺寸，backing store = CSS × dpr
  - [x] SubTask 10.4: 验证 Retina 屏无模糊

- [x] Task 11: 响应式 Canvas
  - [x] SubTask 11.1: `TetrisGame.tsx` 用 `ResizeObserver` 监听容器宽度
  - [x] SubTask 11.2: 容器宽度 < 设计宽度时，Canvas CSS `max-width: 100%` + `height: auto`
  - [x] SubTask 11.3: 保持比例，不变形
  - [x] SubTask 11.4: 验证移动端不溢出

- [x] Task 12: 选择性状态推送
  - [x] SubTask 12.1: `GameSnapshot` 新增字段级脏标记（或对比前后值）
  - [x] SubTask 12.2: `pushState` 仅推送变化字段到 store（如 score 变化才调 `setScore`）
  - [x] SubTask 12.3: 避免每次移动全量推送 8+ 字段

- [x] Task 13: 下落间隔缓存 + 可见性处理
  - [x] SubTask 13.1: `GameEngine` 缓存 `level → dropInterval` 映射，避免每 tick `Math.pow`
  - [x] SubTask 13.2: `document.visibilitychange` 监听，隐藏时自动 `togglePause`（仅 playing 状态）
  - [x] SubTask 13.3: 恢复时 `lastTime` 重置，避免 delta 暴跳

## 阶段 D：代码质量与架构

- [x] Task 14: 配置驱动重构
  - [x] SubTask 14.1: `CONFIG.SPAWN` 新增出生位置 `{ x: 3, y: 0 }`，替换魔法数字
  - [x] SubTask 14.2: `CONFIG.LOCK_DELAY`、`CONFIG.INPUT` 集中管理
  - [x] SubTask 14.3: `Tetromino` 默认位置从 CONFIG 读取

- [x] Task 15: React Error Boundary
  - [x] SubTask 15.1: 新建 `src/components/ErrorBoundary.tsx`
  - [x] SubTask 15.2: 包裹 `TetrisGame`，捕获异常显示友好提示 + 重试按钮
  - [x] SubTask 15.3: `App.tsx` 引入 ErrorBoundary

## 阶段 E：UX 体验增强

- [x] Task 16: 移动端虚拟控制
  - [x] SubTask 16.1: 新建 `src/components/MobileControls.tsx`
  - [x] SubTask 16.2: 检测触屏设备（`'ontouchstart' in window`）
  - [x] SubTask 16.3: 底部 D-pad：左/右/下/旋转/Hold/硬降 6 按钮
  - [x] SubTask 16.4: 按钮触发对应 `engine.handleAction`（需暴露 public 方法）
  - [x] SubTask 16.5: 仅触屏设备显示，桌面隐藏

- [x] Task 17: HUD 增强
  - [x] SubTask 17.1: `useGameStore` 新增 `b2b`（Back-to-Back 标记）状态
  - [x] SubTask 17.2: `HUD` 显示 Combo 连击数（combo > 0 时）
  - [x] SubTask 17.3: `HUD` 显示 B2B 标记（b2b 为 true 时）

- [x] Task 18: 设置面板扩展
  - [x] SubTask 18.1: `useGameStore` 新增 `dasMs`/`arrMs` 配置（持久化）
  - [x] SubTask 18.2: `SettingsPanel` 新增 DAS / ARR 滑块（范围 50-300ms / 0-100ms）
  - [x] SubTask 18.3: 变更后同步到 `Input` 系统

- [x] Task 19: 键盘提示常驻
  - [x] SubTask 19.1: `Footer.tsx` 增强为游戏中常驻快捷键提示
  - [x] SubTask 19.2: 按状态（menu/playing/paused）显示不同提示

## 阶段 F：测试补全

- [x] Task 20: 新增单元测试
  - [x] SubTask 20.1: `ScoringSystem.test.ts` — NES 计分 + T-Spin + B2B + Perfect Clear
  - [x] SubTask 20.2: `LockDelayManager.test.ts` — 延迟/重置/上限
  - [x] SubTask 20.3: `Board.test.ts` 补充 — T-Spin 检测 + isEmpty
  - [x] SubTask 20.4: `GameEngine.test.ts` 补充 — 软降持续 + DAS/ARR + Lock Delay 集成
  - [x] SubTask 20.5: 验证全部测试通过，总数 ≥ 100

## 阶段 G：验证与文档

- [x] Task 21: 全量验证
  - [x] SubTask 21.1: `npm run type-check` 0 错误
  - [x] SubTask 21.2: `npm run lint` 0 错误
  - [x] SubTask 21.3: `npm run test` 全绿
  - [x] SubTask 21.4: `npm run build` 成功
  - [x] SubTask 21.5: 手动验证：软降持续、DAS/ARR、Lock Delay、T-Spin、B2B、响应式、移动端控制

# Task Dependencies

- Task 2 (DAS/ARR) 依赖 Task 1（软降修复，共用 keyup 跟踪）
- Task 5 (LockDelay) 依赖 Task 3（状态时序修复）
- Task 6 (ScoringSystem) 依赖 Task 7（T-Spin 检测）与 Task 8（Perfect Clear）
- Task 9 (统计) 依赖 Task 6（计分模块）
- Task 12 (选择性推送) 依赖 Task 9（snapshot 字段扩展）
- Task 17 (HUD) 依赖 Task 6（B2B 状态）
- Task 18 (设置) 依赖 Task 2（DAS/ARR 配置）
- Task 20 (测试) 依赖 Task 1-9 全部完成
- Task 21 (验证) 依赖 Task 1-20 全部完成

# Parallelizable Work

- Task 4（清理死代码）可与 Task 1-3 并行
- Task 10（DPI）与 Task 11（响应式）可与阶段 B 并行
- Task 14（配置重构）可与 Task 5-8 并行
- Task 15（Error Boundary）独立，可任意时机并行
- Task 19（键盘提示）独立，可并行
