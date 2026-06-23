/**
 * LockDelayManager 单元测试
 *
 * 覆盖：启动 / tick / shouldLock / reset / stop / RESET_MAX 限制 / 完整生命周期
 *
 * 配置：LOCK_DELAY.DELAY_MS=500，LOCK_DELAY.RESET_MAX=15
 */

import { describe, it, expect } from 'vitest';
import { LockDelayManager } from '../LockDelayManager';
import { CONFIG } from '../../config';

describe('LockDelayManager - 初始状态', () => {
  it('初始状态：未激活', () => {
    const ld = new LockDelayManager();
    expect(ld.isActive()).toBe(false);
  });

  it('初始状态：shouldLock 返回 false', () => {
    const ld = new LockDelayManager();
    expect(ld.shouldLock()).toBe(false);
  });
});

describe('LockDelayManager - start()', () => {
  it('start() 后激活，elapsed=0，resetCount=0', () => {
    const ld = new LockDelayManager();
    ld.start();
    expect(ld.isActive()).toBe(true);
    // 通过 tick 间接验证 elapsed=0：tick(0) 后 shouldLock 仍为 false
    expect(ld.shouldLock()).toBe(false);
  });
});

describe('LockDelayManager - tick()', () => {
  it('tick(dt) 累加经过时间', () => {
    const ld = new LockDelayManager();
    ld.start();
    ld.tick(100);
    // 100 < 500，不应锁定
    expect(ld.shouldLock()).toBe(false);
    ld.tick(400);
    // 100 + 400 = 500 >= 500，应锁定
    expect(ld.shouldLock()).toBe(true);
  });

  it('未激活时 tick() 无效', () => {
    const ld = new LockDelayManager();
    ld.tick(1000);
    // 未激活，shouldLock 始终为 false
    expect(ld.shouldLock()).toBe(false);
    expect(ld.isActive()).toBe(false);
  });
});

describe('LockDelayManager - shouldLock()', () => {
  it('elapsed < DELAY_MS → false', () => {
    const ld = new LockDelayManager();
    ld.start();
    ld.tick(CONFIG.LOCK_DELAY.DELAY_MS - 1);
    expect(ld.shouldLock()).toBe(false);
  });

  it('elapsed >= DELAY_MS → true', () => {
    const ld = new LockDelayManager();
    ld.start();
    ld.tick(CONFIG.LOCK_DELAY.DELAY_MS);
    expect(ld.shouldLock()).toBe(true);
  });
});

describe('LockDelayManager - reset()', () => {
  it('reset() 后 elapsed 归零，resetCount 递增', () => {
    const ld = new LockDelayManager();
    ld.start();
    ld.tick(400);
    ld.reset();
    // reset 后 elapsed=0，shouldLock 为 false
    expect(ld.shouldLock()).toBe(false);
    // 再 tick 少量时间不应锁定
    ld.tick(100);
    expect(ld.shouldLock()).toBe(false);
  });

  it('未激活时 reset() 无操作', () => {
    const ld = new LockDelayManager();
    // 未激活时 reset 不应抛错也不应激活
    ld.reset();
    expect(ld.isActive()).toBe(false);
  });

  it('reset() 超过 RESET_MAX 后不再重置', () => {
    const ld = new LockDelayManager();
    ld.start();
    // 进行 RESET_MAX 次 reset（每次先 tick 接近锁定再 reset）
    for (let i = 0; i < CONFIG.LOCK_DELAY.RESET_MAX; i++) {
      ld.tick(CONFIG.LOCK_DELAY.DELAY_MS - 1);
      ld.reset();
    }
    // resetCount 已达上限，此时 elapsed=0（最后一次 reset 重置了）
    // tick 到接近锁定，再尝试 reset 应无效
    ld.tick(CONFIG.LOCK_DELAY.DELAY_MS - 1);
    ld.reset(); // 应为 no-op
    // 再 tick 1ms 使 elapsed 达到 DELAY_MS → 应锁定
    ld.tick(1);
    expect(ld.shouldLock()).toBe(true);
  });
});

describe('LockDelayManager - stop()', () => {
  it('stop() 后未激活，elapsed=0，resetCount=0', () => {
    const ld = new LockDelayManager();
    ld.start();
    ld.tick(300);
    ld.reset();
    ld.stop();
    expect(ld.isActive()).toBe(false);
    expect(ld.shouldLock()).toBe(false);
    // stop 后重新 start，resetCount 应归零
    ld.start();
    ld.tick(CONFIG.LOCK_DELAY.DELAY_MS - 1);
    ld.reset();
    // resetCount 从 0 开始，reset 后应为 1
    ld.tick(CONFIG.LOCK_DELAY.DELAY_MS - 1);
    expect(ld.shouldLock()).toBe(false);
  });
});

describe('LockDelayManager - 完整生命周期', () => {
  it('start → tick → shouldLock → stop 完整流程', () => {
    const ld = new LockDelayManager();
    // 初始未激活
    expect(ld.isActive()).toBe(false);
    // 启动
    ld.start();
    expect(ld.isActive()).toBe(true);
    // 累加时间未到阈值
    ld.tick(200);
    expect(ld.shouldLock()).toBe(false);
    // 累加到阈值
    ld.tick(300);
    expect(ld.shouldLock()).toBe(true);
    // 停止
    ld.stop();
    expect(ld.isActive()).toBe(false);
    expect(ld.shouldLock()).toBe(false);
  });
});
