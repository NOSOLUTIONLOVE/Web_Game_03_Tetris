# Checklist

## 阶段 A：关键 Bug 修复（P0）

- [x] SRS：`reverseKickTable` 映射修正，R→0 用 Set B、2→R 用 Set A
- [x] SRS：`Tetromino.test.ts` 补充 CCW 各转换踢墙偏移值断言
- [x] SRS：靠墙逆时针旋转场景验证通过
- [x] Game Over：`onGameOver` 回调使用 `_score` 而非旧 `highScore` 写入 `setNewRecord`
- [x] Game Over：破纪录时 GameOverModal 显示本次 score
- [x] isNewRecord：snapshot 与 gameOver 判定统一为 `score > highScore`
- [x] isNewRecord：相等分数时 HUD 不显示 NEW、结束不认定新纪录
- [x] DAS/ARR：按下新方向键时取消旧方向定时器
- [x] DAS/ARR：按住 ← DAS 中按 → 不抖动，仅 → 生效
- [x] 软降：`RepeatableAction` 仅含 `moveLeft`/`moveRight`，不含 `softDrop`
- [x] 软降：按住 ↓ 仅以 dropInterval/10 重力加速，不触发 ARR 重复
- [x] tryHold：互换分支 gameOver 后跳过 pushState
- [x] tryHold：Hold 触发 Game Over 时不推送不一致状态

## 阶段 B：代码清理与死代码移除（P1）

- [x] store：`flashLines`/`isTetris`/`levelUpLevel` 状态字段已移除
- [x] store：`setLinesClear`/`setLevelUp`/`clearFlash`/`clearLevelUp` action 已移除
- [x] TetrisGame：`onLinesClear`/`onLevelUp` 中 setTimeout 死代码已移除
- [x] 消行/升级时无报错
- [x] package.json：`react-hook-form`/`@hookform/resolvers` 已移除
- [x] `src/components/ui/card.tsx` 已删除
- [x] `src/components/ui/separator.tsx` 已删除
- [x] `npm install` 依赖树正常
- [x] highScore：引擎不再直接读写 `localStorage[CONFIG.STORAGE_KEY]`
- [x] highScore：store persist 统一管理（key: `tetris:store`）
- [x] highScore：引擎初始化从 store 读取、gameOver 回写 store
- [x] highScore：持久化与读取一致
- [x] Footer：`over` 阶段 Esc 返回菜单生效
- [x] Audio：`AudioSystem.close()` 方法已新增
- [x] Audio：`GameEngine.stop()` 调用 `audio.close()`
- [x] Audio：StrictMode 下无 AudioContext 泄漏
- [x] Renderer：`resize` 事件监听已添加，调用 `handleDPRChange`
- [x] Renderer：跨屏移动画布保持清晰
- [x] GameEngine：`handleLineClear` 升级时调用 `renderer.setLevelUpAnimation(level)`
- [x] GameEngine：升级时画布显示"LEVEL X"动画
- [x] GameEngine：`public stopSoftDrop()` 方法已移除
- [x] 软降停止功能正常（通过 handleAction 内部路径）

## 阶段 C：文档同步（P1）

- [x] README：测试数 badge 77 → 131
- [x] README：质量门禁测试数 77 → 131
- [x] README：项目结构图补 `ErrorBoundary.tsx`/`MobileControls.tsx`/`ScoringSystem.ts`/`LockDelayManager.ts`
- [x] README：触屏操作说明改为虚拟按键描述
- [x] README：版本历史补 v2.0 深度优化记录
- [x] README：PWA 安装说明已补充
- [x] docs/01：T-Spin/Lock Delay 从"未列入"改为"已实现"
- [x] docs/02：测试数 77 → 131，补 T-Spin/DAS/ARR/Lock Delay/Perfect Clear/B2B 条目
- [x] docs/03：tsconfig 配置与实际对齐
- [x] docs/04：目录结构补 4 个新文件
- [x] docs/04：测试明细补 ScoringSystem/LockDelayManager
- [x] docs/04："不做 DAS"改为"已实现"
- [x] docs/05：测试数更新、迭代方向勾选已实现项
- [x] docs/06：测试数更新、构建产物体积实测更新

## 阶段 D：工程化与性能（P2）

- [x] PWA：`vite-plugin-pwa` 依赖已安装
- [x] PWA：`vite.config.ts` 配置 manifest + workbox
- [x] PWA：`index.html` 添加 manifest link 与 apple-touch-icon
- [x] PWA：图标资源已生成（192/512）
- [x] PWA：`npm run build` 后 sw 注册成功
- [x] PWA：离线可访问
- [x] Vite：`manualChunks` 拆分 react/framer-motion/radix
- [x] Vite：`server.host: true` 支持局域网
- [x] Vite：build 产物 chunk 分布合理
- [x] HUD：`onStateChange` 合并为单次批量更新
- [x] HUD：`useGameStore` 使用 `shallow` 比较订阅
- [x] HUD：`NumberCard` 等纯展示组件添加 `React.memo`
- [x] HUD：`NumberCard` pulse 颜色使用 accent prop 而非硬编码
- [x] HUD：移动方块时 re-render 次数减少
- [x] ScoringSystem：CONFIG 新增 `SCORE.TSPIN_*`/`SCORE.PC_*` 配置
- [x] ScoringSystem：从 CONFIG 读取分数表，移除方法内硬编码
- [x] ScoringSystem：`ScoreInput.b2bActive` 未使用字段已移除
- [x] ScoringSystem：计分结果不变

## 阶段 E：UX 体验增强（P2）

- [x] SettingsPanel：store 新增 `volume` 状态（持久化）
- [x] SettingsPanel：`AudioSystem.setVolume(v)` 方法已新增
- [x] SettingsPanel：音量滑块（0-100）已添加
- [x] SettingsPanel：音量调节实时生效
- [x] SettingsPanel："恢复默认"按钮已添加
- [x] SettingsPanel：重置 DAS/ARR/音量为默认值工作正常
- [x] GameOverModal：stats 新增 `maxCombo`/`maxB2B`/`startTime`/`duration`
- [x] GameOverModal：GameSnapshot stats 字段同步扩展
- [x] GameOverModal：补 Singles/Doubles/最大 Combo/游戏时长显示
- [x] GameOverModal：统计数据显示完整
- [x] MainMenu：根据 `isTouch` 显示虚拟按键说明
- [x] a11y：canvas 添加 `aria-label` 描述游戏状态
- [x] a11y：GameOverModal/MainMenu/PauseOverlay 添加 `role="dialog"`/`aria-modal`
- [x] a11y：`prefers-reduced-motion` 媒体查询降低动画幅度
- [x] a11y：屏幕阅读器可读游戏状态、降低动效模式生效

## 阶段 F：测试补全（P2）

- [x] `Tetromino.test.ts`：CCW 各转换踢墙偏移值断言（0→L/R→0/2→R/L→2）
- [x] `Input.test.ts`：DAS/ARR 定时行为
- [x] `Input.test.ts`：左右键互斥
- [x] `Input.test.ts`：softDrop 不触发 ARR
- [x] `ScoringSystem.test.ts`：T-Spin Double/Triple
- [x] `ScoringSystem.test.ts`：T-Spin + Perfect Clear 组合
- [x] `ScoringSystem.test.ts`：B2B 跨链（T-Spin→Tetris→T-Spin）
- [x] `GameEngine.test.ts`：Hold 触发 Game Over
- [x] `GameEngine.test.ts`：Lock Delay + Hard Drop 立即锁定
- [x] `GameEngine.test.ts`：Lock Delay RESET_MAX 上限
- [x] 全部测试通过，总数 ≥ 145

## 阶段 G：全量验证

- [x] `npm run type-check` 0 错误
- [x] `npm run lint` 0 错误
- [x] `npm run test` 全绿（≥ 145）
- [x] `npm run build` 成功，产物含 PWA sw
- [x] 手动验证：靠墙逆时针旋转
- [x] 手动验证：DAS/ARR 左右切换不抖动
- [x] 手动验证：软降不叠加 ARR
- [x] 手动验证：Game Over 新纪录显示正确
- [x] 手动验证：over 阶段 Esc 返回菜单
- [x] 手动验证：跨屏 DPR 画布清晰
- [x] 手动验证：PWA 离线可访问
- [x] 手动验证：音量调节实时生效
- [x] 手动验证：升级动画显示
