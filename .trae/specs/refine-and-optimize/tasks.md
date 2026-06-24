# Tasks

## 阶段 A：关键 Bug 修复（P0）

- [x] Task 1: 修复 SRS 逆时针踢墙表
  - [ ] SubTask 1.1: 阅读 `src/engine/srs.ts` 的 `reverseKickTable` 函数，对照 tetris.wiki 官方 SRS CCW 表确认正确映射
  - [ ] SubTask 1.2: 修正 `reverseKickTable` 的映射逻辑，确保 R→0 用 Set B、2→R 用 Set A
  - [ ] SubTask 1.3: 在 `Tetromino.test.ts` 中补充 CCW 踢墙偏移值断言（验证实际偏移而非仅数量）
  - [ ] SubTask 1.4: 验证靠墙逆时针旋转场景通过

- [x] Task 2: 修复 Game Over 高分写入
  - [ ] SubTask 2.1: 修改 `src/components/TetrisGame.tsx` 的 `onGameOver` 回调，将 `setNewRecord(useGameStore.getState().highScore)` 改为 `setNewRecord(_score)`
  - [ ] SubTask 2.2: 验证破纪录时 GameOverModal 显示本次 score

- [x] Task 3: 统一 isNewRecord 判定
  - [ ] SubTask 3.1: 修改 `src/engine/GameEngine.ts` snapshot 中 `isNewRecord` 为 `this.score > this.highScore`（严格大于）
  - [ ] SubTask 3.2: 确认 gameOver 中已是 `>`，两处一致
  - [ ] SubTask 3.3: 验证相等分数时 HUD 不显示 NEW、结束不认定新纪录

- [x] Task 4: 修复 DAS/ARR 左右键冲突
  - [ ] SubTask 4.1: 修改 `src/engine/Input.ts` 的 `handleKeyDown`，按下新方向键时先 `stopRepeat` 反方向动作
  - [ ] SubTask 4.2: 验证按住 ← DAS 中按 → 不抖动，仅 → 生效

- [x] Task 5: 修复软降 DAS/ARR 叠加
  - [ ] SubTask 5.1: 修改 `src/engine/Input.ts` 的 `RepeatableAction` 类型，移除 `'softDrop'`，仅保留 `'moveLeft' | 'moveRight'`
  - [ ] SubTask 5.2: 验证按住 ↓ 仅以 dropInterval/10 重力加速，不触发 ARR 重复

- [x] Task 6: 修复 tryHold 中 gameOver 后 pushState
  - [ ] SubTask 6.1: 修改 `src/engine/GameEngine.ts` 的 `tryHold`，互换分支中 `gameOver()` 后跳过 `pushState`
  - [ ] SubTask 6.2: 验证 Hold 触发 Game Over 时不推送不一致状态

## 阶段 B：代码清理与死代码移除（P1）

- [x] Task 7: 清理 store 死状态
  - [ ] SubTask 7.1: 从 `src/store/useGameStore.ts` 移除 `flashLines`/`isTetris`/`levelUpLevel` 状态字段
  - [ ] SubTask 7.2: 移除 `setLinesClear`/`setLevelUp`/`clearFlash`/`clearLevelUp` action
  - [ ] SubTask 7.3: 修改 `src/components/TetrisGame.tsx`，移除 `onLinesClear`/`onLevelUp` 中的 setTimeout 死代码
  - [ ] SubTask 7.4: 验证消行/升级时无报错

- [x] Task 8: 移除未使用依赖与组件
  - [ ] SubTask 8.1: 从 `package.json` 移除 `react-hook-form` 和 `@hookform/resolvers`
  - [ ] SubTask 8.2: 删除 `src/components/ui/card.tsx` 和 `src/components/ui/separator.tsx`
  - [ ] SubTask 8.3: 运行 `npm install` 确认依赖树正常

- [ ] Task 9: 统一 highScore 存储
  - [ ] SubTask 9.1: 修改 `src/engine/GameEngine.ts`，不再直接读写 `localStorage[CONFIG.STORAGE_KEY]`，改为通过回调或构造参数传入 highScore
  - [ ] SubTask 9.2: 修改 `src/store/useGameStore.ts`，persist 中间件统一管理 highScore（key: `tetris:store`）
  - [ ] SubTask 9.3: 修改 `src/components/TetrisGame.tsx`，引擎初始化时从 store 读取 highScore，gameOver 时回写 store
  - [ ] SubTask 9.4: 验证 highScore 持久化与读取一致

- [x] Task 10: 修复 Footer Esc 提示与 AudioContext 释放
  - [ ] SubTask 10.1: 修改 `src/engine/GameEngine.ts` 的 `handleAction`，`over` 阶段增加 `pause` 处理（调用 `backToMenu`）
  - [ ] SubTask 10.2: 修改 `src/lib/audio.ts`，新增 `close()` 方法调用 `AudioContext.close()`
  - [ ] SubTask 10.3: 修改 `src/engine/GameEngine.ts` 的 `stop()`，调用 `audio.close()`
  - [ ] SubTask 10.4: 验证 over 阶段 Esc 返回菜单、StrictMode 下无 AudioContext 泄漏

- [ ] Task 11: 接入 DPR 变化监听与升级动画
  - [ ] SubTask 11.1: 修改 `src/engine/Renderer.ts`，新增 `window.addEventListener('resize', handleDPRChange)`，unmount 时移除
  - [ ] SubTask 11.2: 修改 `src/engine/GameEngine.ts` 的 `handleLineClear`，升级时调用 `renderer.setLevelUpAnimation(level)`
  - [ ] SubTask 11.3: 验证跨屏移动画布清晰、升级时画布显示"LEVEL X"动画

- [x] Task 12: 移除 GameEngine.stopSoftDrop 公开方法
  - [ ] SubTask 12.1: 修改 `src/engine/GameEngine.ts`，移除 `public stopSoftDrop()` 方法（保留 `handleAction('stopSoftDrop')` 内部路径）
  - [ ] SubTask 12.2: 验证软降停止功能正常

## 阶段 C：文档同步（P1）

- [x] Task 13: 更新 README.md
  - [ ] SubTask 13.1: 测试数 77 → 131（badge、质量门禁、版本历史）
  - [ ] SubTask 13.2: 项目结构图补 `ErrorBoundary.tsx`/`MobileControls.tsx`/`ScoringSystem.ts`/`LockDelayManager.ts`
  - [ ] SubTask 13.3: 触屏操作说明从手势改为虚拟按键描述
  - [ ] SubTask 13.4: 版本历史补 v2.0 深度优化记录
  - [ ] SubTask 13.5: 补充 PWA 安装说明（待阶段 D 完成）

- [ ] Task 14: 更新 docs/ 6 篇文档
  - [ ] SubTask 14.1: `01-项目立项.md` — T-Spin/Lock Delay 从"未列入"改为"已实现"
  - [ ] SubTask 14.2: `02-需求拆分.md` — 测试数 77 → 131，补 T-Spin/DAS/ARR/Lock Delay/Perfect Clear/B2B 条目
  - [ ] SubTask 14.3: `03-技术选型.md` — tsconfig 配置与实际对齐（noUncheckedIndexedAccess 状态）
  - [ ] SubTask 14.4: `04-项目架构.md` — 目录结构补 4 个新文件、测试明细补 ScoringSystem/LockDelayManager、"不做 DAS"改为"已实现"
  - [ ] SubTask 14.5: `05-执行规划.md` — 测试数更新、迭代方向勾选已实现项
  - [ ] SubTask 14.6: `06-部署指南.md` — 测试数更新、构建产物体积实测更新

## 阶段 D：工程化与性能（P2）

- [x] Task 15: PWA 支持
  - [ ] SubTask 15.1: 安装 `vite-plugin-pwa` 依赖
  - [ ] SubTask 15.2: 配置 `vite.config.ts` 的 PWA 插件（manifest: name/icons/theme_color，workbox: precache）
  - [ ] SubTask 15.3: 在 `index.html` 添加 `<link rel="manifest">` 与 apple-touch-icon
  - [ ] SubTask 15.4: 生成 PWA 图标（复用 favicon.svg 或生成 192/512 png）
  - [ ] SubTask 15.5: 验证 `npm run build` 后 sw 注册、离线可访问

- [x] Task 16: Vite chunk 分割与工程配置
  - [ ] SubTask 16.1: 配置 `vite.config.ts` 的 `build.rollupOptions.output.manualChunks`，拆分 react/react-dom、framer-motion、radix
  - [ ] SubTask 16.2: 配置 `server.host: true` 支持局域网测试
  - [ ] SubTask 16.3: 验证 build 产物 chunk 分布合理

- [ ] Task 17: HUD 性能优化
  - [ ] SubTask 17.1: 修改 `src/components/TetrisGame.tsx` 的 `onStateChange`，合并多次 `set` 为单次批量更新
  - [ ] SubTask 17.2: 修改 `src/components/HUD.tsx`，使用 `useGameStore` 的 `shallow` 比较订阅多字段
  - [ ] SubTask 17.3: 为 `NumberCard` 等纯展示组件添加 `React.memo`
  - [ ] SubTask 17.4: 修复 `NumberCard` pulse 动画颜色硬编码（使用 accent prop）
  - [ ] SubTask 17.5: 验证移动方块时 HUD re-render 次数减少

- [x] Task 18: ScoringSystem 分数表迁移 CONFIG
  - [ ] SubTask 18.1: 修改 `src/config/index.ts`，新增 `SCORE.TSPIN_*`/`SCORE.TSPIN_MINI_*`/`SCORE.PC_*` 配置
  - [ ] SubTask 18.2: 修改 `src/engine/ScoringSystem.ts`，从 CONFIG 读取分数表，移除方法内硬编码
  - [ ] SubTask 18.3: 移除 `ScoreInput.b2bActive` 未使用字段
  - [ ] SubTask 18.4: 验证计分结果不变

## 阶段 E：UX 体验增强（P2）

- [ ] Task 19: SettingsPanel 扩展
  - [ ] SubTask 19.1: 修改 `src/store/useGameStore.ts`，新增 `volume` 状态（持久化）
  - [ ] SubTask 19.2: 修改 `src/lib/audio.ts`，`masterGain.gain.value` 从 store volume 读取，新增 `setVolume(v)` 方法
  - [ ] SubTask 19.3: 修改 `src/components/SettingsPanel.tsx`，新增音量滑块（0-100）
  - [ ] SubTask 19.4: 新增"恢复默认"按钮，重置 DAS/ARR/音量为默认值
  - [ ] SubTask 19.5: 验证音量调节实时生效、重置按钮工作

- [x] Task 20: GameOverModal 统计完善
  - [ ] SubTask 20.1: 修改 `src/engine/GameEngine.ts`，stats 新增 `maxCombo`/`maxB2B`/`startTime`/`duration` 字段
  - [ ] SubTask 20.2: 修改 `GameSnapshot`，stats 字段同步扩展
  - [ ] SubTask 20.3: 修改 `src/components/GameOverModal.tsx`，补 Singles/Doubles/最大 Combo/游戏时长显示
  - [ ] SubTask 20.4: 验证统计数据显示完整

- [x] Task 21: MainMenu 移动端提示与 a11y
  - [ ] SubTask 21.1: 修改 `src/components/MainMenu.tsx`，根据 `isTouch` 显示虚拟按键说明
  - [ ] SubTask 21.2: 修改 `src/components/TetrisGame.tsx`，canvas 添加 `aria-label` 描述游戏状态
  - [ ] SubTask 21.3: 修改 `src/components/GameOverModal.tsx`/`MainMenu.tsx`/`PauseOverlay.tsx`，添加 `role="dialog"`/`aria-modal`
  - [ ] SubTask 21.4: 添加 `prefers-reduced-motion` 媒体查询，降低 Framer Motion 动画幅度
  - [ ] SubTask 21.5: 验证屏幕阅读器可读游戏状态、降低动效模式生效

## 阶段 F：测试补全（P2）

- [ ] Task 22: SRS 与 Input 测试
  - [ ] SubTask 22.1: `Tetromino.test.ts` 补充 CCW 各转换的踢墙偏移值断言（0→L/R→0/2→R/L→2）
  - [ ] SubTask 22.2: 新建 `Input.test.ts`，覆盖 DAS/ARR 定时、左右键互斥、softDrop 不重复
  - [ ] SubTask 22.3: 验证测试通过

- [x] Task 23: ScoringSystem 与 GameEngine 集成测试
  - [ ] SubTask 23.1: `ScoringSystem.test.ts` 补充 T-Spin Double/Triple、T-Spin + Perfect Clear、B2B 跨链（T-Spin→Tetris→T-Spin）
  - [ ] SubTask 23.2: `GameEngine.test.ts` 补充 Hold 触发 Game Over、Lock Delay + Hard Drop 立即锁定、Lock Delay RESET_MAX 上限
  - [ ] SubTask 23.3: 验证全部测试通过，总数 ≥ 145

## 阶段 G：全量验证

- [x] Task 24: 全量验证
  - [ ] SubTask 24.1: `npm run type-check` 0 错误
  - [ ] SubTask 24.2: `npm run lint` 0 错误
  - [ ] SubTask 24.3: `npm run test` 全绿（≥ 145）
  - [ ] SubTask 24.4: `npm run build` 成功，产物含 PWA sw
  - [ ] SubTask 24.5: 手动验证：靠墙逆时针旋转、DAS/ARR 左右切换、软降不叠加、Game Over 新纪录显示、Esc 返回菜单、跨屏 DPR、PWA 离线、音量调节、升级动画

# Task Dependencies

- Task 2/3（高分相关）可与 Task 1（SRS）并行
- Task 4/5（Input 修复）依赖 Task 1-3 完成（避免冲突）
- Task 6（tryHold）独立
- Task 7（store 死状态）依赖 Task 2/3（高分逻辑稳定后再清理）
- Task 9（highScore 单源）依赖 Task 2/3/7
- Task 10（Footer/Audio）独立
- Task 11（DPR/动画）独立
- Task 12（stopSoftDrop 清理）依赖 Task 5（softDrop 重构完成）
- Task 13/14（文档）依赖 Task 1-12 完成（功能稳定后同步）
- Task 15（PWA）独立，可与 Task 1-12 并行
- Task 16（chunk 分割）依赖 Task 15（PWA 插件配置后）
- Task 17（HUD 性能）依赖 Task 7（store 清理后）
- Task 18（ScoringSystem CONFIG）独立
- Task 19（SettingsPanel）依赖 Task 18（CONFIG 扩展）
- Task 20（GameOverModal 统计）依赖 Task 9（highScore 稳定）
- Task 21（MainMenu/a11y）独立
- Task 22/23（测试）依赖 Task 1-6, 18 完成（被测代码稳定）
- Task 24（验证）依赖 Task 1-23 全部完成

# Parallelizable Work

- Task 1（SRS）/Task 2-3（高分）/Task 6（tryHold）/Task 10（Footer/Audio）/Task 11（DPR/动画）/Task 15（PWA）/Task 18（ScoringSystem CONFIG）/Task 21（a11y）可并行
- Task 4/5（Input）在 Task 1-3 后并行
- Task 7/8/12（清理类）在对应功能修复后并行
- Task 13/14（文档）在功能阶段完成后并行
- Task 22/23（测试）在被测代码稳定后并行
