/**
 * LockDelayManager - 锁定延迟管理器
 *
 * 职责：
 * - 方块落地后给予玩家操作缓冲时间（可移动/旋转重置延迟）
 * - 限制最大重置次数，防止无限延迟
 *
 * 规则（Tetris Guideline）：
 * - 方块落地后启动锁定延迟
 * - 玩家成功移动/旋转时重置延迟（受 RESET_MAX 限制）
 * - 延迟到期或硬降时锁定方块
 */

import { CONFIG } from '../config';

export class LockDelayManager {
  /** 是否处于锁定延迟中 */
  private active = false;
  /** 已经过的延迟时间（ms） */
  private elapsed = 0;
  /** 已重置次数 */
  private resetCount = 0;

  /** 启动锁定延迟 */
  start(): void {
    this.active = true;
    this.elapsed = 0;
    this.resetCount = 0;
  }

  /** 重置延迟计时（受最大重置次数限制） */
  reset(): void {
    if (!this.active) return;
    if (this.resetCount >= CONFIG.LOCK_DELAY.RESET_MAX) return;
    this.elapsed = 0;
    this.resetCount++;
  }

  /** 每帧累加经过的时间 */
  tick(dt: number): void {
    if (this.active) this.elapsed += dt;
  }

  /** 是否应该锁定 */
  shouldLock(): boolean {
    return this.active && this.elapsed >= CONFIG.LOCK_DELAY.DELAY_MS;
  }

  /** 停止锁定延迟 */
  stop(): void {
    this.active = false;
    this.elapsed = 0;
    this.resetCount = 0;
  }

  /** 是否处于激活状态 */
  isActive(): boolean {
    return this.active;
  }
}
