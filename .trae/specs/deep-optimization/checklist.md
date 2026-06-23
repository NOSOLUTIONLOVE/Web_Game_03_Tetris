# Checklist

## 阶段 A：关键 Bug 修复 + 输入系统重构

- [x] 软降：按住 ↓ 键持续下落，松开停止（`softDropActive` 由 keydown/keyup 配对维护）
- [x] 软降：`GameEngine.endSoftDrop()` 已删除，改为 Input 内部调用 `stopSoftDrop`
- [x] DAS/ARR：按住 ←/→ 超过 DAS 延迟后以 ARR 间隔自动重复移动
- [x] DAS/ARR：仅 moveLeft/moveRight/softDrop 重复，旋转/Hold/硬降不重复
- [x] DAS/ARR：keyup 立即停止自动重复
- [x] 状态时序：`spawnNext` 触发 gameOver 后不再 `pushState`
- [x] 死代码：`Board.isColumnOverflow()` 已删除
- [x] 死代码：`CONFIG.TOUCH.SWIPE_*` 未使用常量已删除
- [x] 死代码：无其他未引用的导出残留

## 阶段 B：现代 Tetris 玩法补全

- [x] LockDelayManager：触底后 500ms 延迟锁定
- [x] LockDelayManager：移动/旋转重置延迟，最多 15 次重置
- [x] LockDelayManager：延迟到期或重置上限时强制锁定
- [x] ScoringSystem：NES 基础计分迁移正确（Single 100 / Double 300 / Triple 500 / Tetris 800 × level）
- [x] ScoringSystem：Combo 连击加成（50 × combo）正确
- [x] T-Spin：3-corner 法检测正确（T 块旋转后中心四角 ≥3 占据）
- [x] T-Spin：区分 T-Spin 与 T-Spin Mini
- [x] T-Spin：计分正确（T-Spin Single 800 / Mini 200 / Double 1200 / Triple 1600 × level）
- [x] Back-to-Back：连续 Tetris 或 T-Spin ×1.5 倍分
- [x] Back-to-Back：非 Tetris/T-Spin 消行重置 B2B 链
- [x] Perfect Clear：消行后棋盘全空时额外加分
- [x] Perfect Clear：加分量正确（Single 800 / Double 1200 / Triple 1800 / Tetris 2000 × level）
- [x] 统计数据：方块数、各类消行计数、T-Spin 计数、Perfect Clear 计数正确跟踪
- [x] GameOverModal：显示统计数据

## 阶段 C：性能与渲染优化

- [x] DPI：Canvas backing store 按 `devicePixelRatio` 缩放
- [x] DPI：`ctx.scale(dpr, dpr)` 统一坐标系
- [x] DPI：Retina 屏渲染清晰无模糊
- [x] 响应式：容器宽度 < 设计宽度时 Canvas 等比缩放
- [x] 响应式：移动端不溢出，保持比例
- [x] 选择性推送：`pushState` 仅推送变化字段
- [x] 选择性推送：移动/旋转后 React re-render 减少
- [x] 下落间隔缓存：`getDropInterval` 按 level 缓存，不再每 tick `Math.pow`
- [x] 可见性：标签页隐藏时自动暂停（仅 playing 状态）
- [x] 可见性：恢复时 `lastTime` 重置，无 delta 暴跳

## 阶段 D：代码质量与架构

- [x] 配置驱动：出生位置从 `CONFIG.SPAWN` 读取，无魔法数字 `{x:3, y:0}`
- [x] 配置驱动：DAS/ARR/Lock Delay 参数集中在 CONFIG
- [x] Error Boundary：`TetrisGame` 被包裹，异常时显示友好提示 + 重试
- [x] GameEngine：ScoringSystem 与 LockDelayManager 已提取，主类行数减少

## 阶段 E：UX 体验增强

- [x] 移动端控制：触屏设备显示底部虚拟 D-pad
- [x] 移动端控制：6 按钮（左/右/下/旋转/Hold/硬降）均可触发对应动作
- [x] 移动端控制：桌面设备不显示虚拟按键
- [x] HUD：Combo 连击数 > 0 时显示
- [x] HUD：Back-to-Back 标记显示
- [x] 设置面板：DAS / ARR 滑块可调节
- [x] 设置面板：DAS/ARR 配置持久化到 localStorage
- [x] 设置面板：变更后同步到 Input 系统
- [x] 键盘提示：Footer 按状态显示不同快捷键提示

## 阶段 F：测试补全

- [x] `ScoringSystem.test.ts` 覆盖 NES + T-Spin + B2B + Perfect Clear 计分
- [x] `LockDelayManager.test.ts` 覆盖延迟/重置/上限
- [x] `Board.test.ts` 补充 T-Spin 检测 + isEmpty
- [x] `GameEngine.test.ts` 补充软降持续 + DAS/ARR + Lock Delay 集成
- [x] 全部测试通过，总数 ≥ 100

## 阶段 G：全量验证

- [x] `npm run type-check` 0 错误
- [x] `npm run lint` 0 错误
- [x] `npm run test` 全绿
- [x] `npm run build` 成功
- [x] 手动验证：软降按住持续下落
- [x] 手动验证：DAS/ARR 按住方向键自动重复
- [x] 手动验证：Lock Delay 触底后可移动重置
- [x] 手动验证：T-Spin 检测与计分
- [x] 手动验证：Back-to-Back 加成
- [x] 手动验证：Perfect Clear 加成
- [x] 手动验证：Retina 屏渲染清晰
- [x] 手动验证：移动端响应式 + 虚拟控制
