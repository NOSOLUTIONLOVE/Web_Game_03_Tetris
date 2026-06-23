# Tetris 深度完善与优化 Spec

## Why

当前 Tetris 项目已具备完整可玩的基础功能（SRS + 7-bag + Hold + Ghost + 77 测试），但在**核心玩法、性能渲染、代码质量、用户体验**四个维度存在明显短板，距离"现代俄罗斯方块"标准仍有差距：

1. **关键 Bug**：软降逻辑失效（`softDropActive` 置位后立即复位，无法持续下落）；无 DAS/ARR 导致按住方向键只移动一格，高等级不可玩。
2. **玩法缺失**：无 Lock Delay、无 T-Spin、无 Back-to-Back、无 Perfect Clear，不符合 Tetris Guideline 现代标准。
3. **性能问题**：Canvas 未做 DPI 缩放（Retina 屏模糊）、固定尺寸不响应式、每次移动全量推送 snapshot 造成多余 re-render。
4. **代码质量**：GameEngine 520 行上帝类、魔法数字散落、死代码残留（`isColumnOverflow`/`endSoftDrop` 未使用）。

本变更旨在系统性修复上述问题，使项目达到"完整 + 深度优化"的现代 Tetris 水准。

## What Changes

### A. 关键 Bug 修复
- **修复软降持续下落**：引入 keydown/keyup 配对跟踪，按住 ↓ 时持续以 1/10 速度下落，松开停止
- **实现 DAS/ARR**（Delayed Auto Shift / Auto Repeat Rate）：按住 ←/→ 延迟后自动重复移动，可配置
- **修复状态推送时序**：`lockCurrent` 中 `spawnNext` 触发 `gameOver` 后不再 `pushState`，避免推送不一致快照
- **清理死代码**：移除未调用的 `endSoftDrop()`、`isColumnOverflow()`、未使用的 `TOUCH.SWIPE_*` 常量

### B. 现代 Tetris 玩法补全
- **Lock Delay**：方块触底后延迟 500ms 锁定，移动/旋转重置延迟（最多 15 次重置），符合 Tetris Guideline
- **T-Spin 检测**：3-corner 识别法，检测 T 块旋转后形成的 T-Spin / T-Spin Mini
- **Back-to-Back 加成**：连续 Tetris 或 T-Spin 消行 ×1.5 倍分
- **Perfect Clear 加成**：消行后棋盘全空时额外奖励
- **统计数据**：方块数、各类消行计数、T-Spin 计数

### C. 性能与渲染优化
- **DPI 感知渲染**：按 `devicePixelRatio` 缩放 Canvas backing store，Retina 屏清晰显示
- **响应式 Canvas**：根据容器宽度自适应缩放，移动端不再溢出
- **选择性状态推送**：`pushState` 拆分为按需推送（仅变化字段），减少 React re-render
- **下落间隔缓存**：按 level 缓存 `getDropInterval` 结果，避免每 tick `Math.pow`
- **可见性处理**：标签页隐藏时自动暂停，恢复时不暴跳

### D. 代码质量与架构
- **拆分 GameEngine**：提取 `ScoringSystem`（计分 + B2B + T-Spin）、`LockDelayManager`（锁定延迟 + 重置计数）
- **配置驱动**：出生位置、DAS/ARR、Lock Delay 等参数移入 CONFIG
- **React Error Boundary**：包裹根组件，防止 Canvas/引擎异常白屏

### E. UX 体验增强
- **移动端控制按钮**：屏幕底部虚拟 D-pad（左/右/下/旋转/Hold/硬降）
- **HUD 增强**：显示 Combo 连击数、Back-to-Back 标记
- **设置面板扩展**：DAS / ARR 滑块配置
- **键盘提示**：游戏中底部常驻快捷键提示

## Impact

- **Affected specs**: F-03（下落）、F-04（移动）、F-09（计分）、F-13（等级）、F-14（连击）、F-17（触屏）
- **Affected code**:
  - `src/engine/GameEngine.ts` — 主循环、软降、DAS/ARR、Lock Delay、状态推送
  - `src/engine/Input.ts` — keydown/keyup 配对、DAS/ARR 定时器
  - `src/engine/Board.ts` — T-Spin 检测、Perfect Clear 检测
  - `src/engine/Renderer.ts` — DPI 缩放、响应式布局
  - `src/engine/ScoringSystem.ts`（新增）— 计分 + B2B + T-Spin 逻辑
  - `src/engine/LockDelayManager.ts`（新增）— 锁定延迟管理
  - `src/config/index.ts` — 新增 DAS/ARR/Lock Delay/T-Spin 配置
  - `src/store/useGameStore.ts` — 新增 combo/b2b/stats 状态
  - `src/components/TetrisGame.tsx` — 响应式 Canvas、Error Boundary
  - `src/components/HUD.tsx` — Combo/B2B 显示
  - `src/components/SettingsPanel.tsx` — DAS/ARR 配置
  - `src/components/MobileControls.tsx`（新增）— 虚拟按键
  - `src/engine/__tests__/` — 新增 ScoringSystem / LockDelay / T-Spin 测试

## ADDED Requirements

### Requirement: 持续软降
系统 SHALL 在用户按住软降键期间持续以当前等级 1/10 速度下落方块，松开时恢复常规重力。

#### Scenario: 按住软降键
- **WHEN** 用户按下 ↓ 键并保持
- **THEN** 方块以 `dropInterval / 10` 速度持续下落，每格 +1 分
- **WHEN** 用户松开 ↓ 键
- **THEN** 恢复常规重力速度

### Requirement: DAS/ARR 自动重复
系统 SHALL 支持按住左右方向键时的延迟自动移动（DAS）与自动重复速率（ARR），参数可配置。

#### Scenario: 按住方向键
- **WHEN** 用户按住 ← 或 → 键超过 DAS 延迟（默认 167ms）
- **THEN** 以 ARR 间隔（默认 33ms）自动重复移动
- **WHEN** 用户松开方向键
- **THEN** 立即停止自动重复

### Requirement: Lock Delay 锁定延迟
系统 SHALL 在方块触底后延迟 500ms 锁定，期间移动或旋转重置延迟（最多 15 次重置）。

#### Scenario: 触底后移动
- **WHEN** 方块触底，用户在 500ms 内移动或旋转
- **THEN** 锁定延迟重置为 500ms，重置计数 +1
- **WHEN** 重置计数达到 15 或延迟到期
- **THEN** 方块锁定

### Requirement: T-Spin 检测
系统 SHALL 在 T 块旋转锁定后，通过 3-corner 法检测 T-Spin 与 T-Spin Mini。

#### Scenario: T-Spin 消行
- **WHEN** T 块旋转后锁定，且至少 3 个角（含朝向中心角）被占据，且消行数 > 0
- **THEN** 标记为 T-Spin，按 T-Spin Single/Double 计分

### Requirement: Back-to-Back 加成
系统 SHALL 在连续完成 Tetris 或 T-Spin 消行时给予 ×1.5 倍分加成。

#### Scenario: 连续 Tetris
- **WHEN** 上一次消行为 Tetris，本次仍为 Tetris
- **THEN** 本次得分 ×1.5，标记 Back-to-Back

### Requirement: Perfect Clear 加成
系统 SHALL 在消行后棋盘全空时给予额外奖励分。

#### Scenario: 清空棋盘
- **WHEN** 消行后棋盘无任何已锁定方块
- **THEN** 额外加分（Single 800 / Double 1200 / Triple 1800 / Tetris 2000）× level

### Requirement: DPI 感知渲染
系统 SHALL 按 `devicePixelRatio` 缩放 Canvas backing store，确保高 DPI 屏幕清晰渲染。

#### Scenario: Retina 屏
- **WHEN** 设备 `devicePixelRatio = 2`
- **THEN** Canvas backing store 尺寸 = CSS 尺寸 × 2，绘制清晰无模糊

### Requirement: 响应式 Canvas
系统 SHALL 根据容器宽度自适应缩放 Canvas，移动端不溢出。

#### Scenario: 窄屏适配
- **WHEN** 容器宽度 < Canvas 设计宽度
- **THEN** Canvas 等比缩放至容器宽度，保持比例

### Requirement: 移动端虚拟控制
系统 SHALL 在触屏设备显示底部虚拟 D-pad，支持左/右/下/旋转/Hold/硬降。

#### Scenario: 触屏设备
- **WHEN** 检测到触屏设备（`ontouchstart` 存在）
- **THEN** 显示底部虚拟按键，可点击触发对应动作

## MODIFIED Requirements

### Requirement: 软降（F-04 修订）
原实现为单次触发，现改为持续按住生效。`softDropActive` 由 keydown/keyup 配对维护，`update()` 中根据该标志选择有效下落间隔。

### Requirement: 计分（F-09 修订）
原 NES 计分基础上新增：T-Spin 计分表、Back-to-Back ×1.5、Perfect Clear 奖励、Combo 连击加成（已有但需对接 B2B）。

### Requirement: 状态推送（修订）
`pushState` 改为按需推送：仅当字段实际变化时更新对应 store slice，避免每次移动全量推送。

## REMOVED Requirements

### Requirement: endSoftDrop 公开方法
**Reason**: 软降逻辑重构为 Input 内部 keyup 跟踪，不再需要外部调用。
**Migration**: 删除 `GameEngine.endSoftDrop()`，软降状态由 Input 系统直接管理。

### Requirement: isColumnOverflow 方法
**Reason**: 从未调用，Game Over 判定已由 `isGameOver` 覆盖。
**Migration**: 直接删除。
