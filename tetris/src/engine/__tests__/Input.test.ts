// @vitest-environment happy-dom

/**
 * Input 单元测试
 *
 * 覆盖：
 * - DAS/ARR 定时行为（立即触发、DAS 延迟、ARR 重复、keyup 停止）
 * - 左右键互斥（Task 4 修复：按下反向键取消当前 DAS/ARR）
 * - softDrop 不触发 ARR（Task 5 修复：softDrop 由 softDropActive 标志驱动）
 * - 键盘去重（pressedKeys 集合防止 keydown 重复触发）
 *
 * 设计：
 * - happy-dom 提供 window / document / KeyboardEvent
 * - vi.useFakeTimers 控制 DAS/ARR 定时器
 * - 通过 window.dispatchEvent 模拟键盘事件
 * - mock onAction 回调收集实际触发的动作序列
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Input, type Action } from '../Input';
import { CONFIG } from '../../config';

let input: Input;
let actions: Action[];
let target: HTMLElement;

beforeEach(() => {
  vi.useFakeTimers();
  input = new Input();
  actions = [];
  target = document.createElement('div');
  input.bind({ onAction: (a) => actions.push(a) }, target);
});

afterEach(() => {
  input.unbind();
  vi.useRealTimers();
});

describe('Input - DAS/ARR 定时行为', () => {
  it('按下方向键立即触发一次移动', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveLeft']);
  });

  it('按住超过 DAS 延迟后以 ARR 间隔重复', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveLeft']);

    // DAS 延迟内无重复（DAS 定时器刚触发，启动 ARR 但未产生回调）
    vi.advanceTimersByTime(CONFIG.INPUT.DAS_MS);
    expect(actions).toEqual(['moveLeft']);

    // 第一个 ARR 间隔触发重复
    vi.advanceTimersByTime(CONFIG.INPUT.ARR_MS);
    expect(actions).toEqual(['moveLeft', 'moveLeft']);

    // 第二个 ARR 间隔
    vi.advanceTimersByTime(CONFIG.INPUT.ARR_MS);
    expect(actions).toEqual(['moveLeft', 'moveLeft', 'moveLeft']);
  });

  it('keyup 立即停止重复', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    vi.advanceTimersByTime(CONFIG.INPUT.DAS_MS);
    vi.advanceTimersByTime(CONFIG.INPUT.ARR_MS * 3);
    // 1 次初始 + 3 次 ARR = 4
    expect(actions.length).toBe(4);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));

    // 推进足够长时间，不应再有回调
    vi.advanceTimersByTime(CONFIG.INPUT.ARR_MS * 10);
    expect(actions.length).toBe(4);
  });
});

describe('Input - 左右键互斥', () => {
  it('按住 ← 进入 DAS 计时，再按 →，← 的定时器被取消', () => {
    // 按下 ←，立即触发一次
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveLeft']);

    // 推进部分 DAS 时间（DAS 未触发）
    vi.advanceTimersByTime(Math.floor(CONFIG.INPUT.DAS_MS / 2));

    // 按下 →（← 仍按住），← 的 DAS 被取消，→ 立即触发
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(actions).toEqual(['moveLeft', 'moveRight']);

    // 推进超过 ← 原本的 DAS 触发时间，← 不应再触发
    // → 的 DAS 在此刻刚触发（启动 ARR），但还未产生 ARR 回调
    vi.advanceTimersByTime(CONFIG.INPUT.DAS_MS);
    expect(actions).toEqual(['moveLeft', 'moveRight']);

    // 推进一个 ARR 间隔，→ 重复
    vi.advanceTimersByTime(CONFIG.INPUT.ARR_MS);
    expect(actions).toEqual(['moveLeft', 'moveRight', 'moveRight']);

    // 验证 ← 只触发了一次（初始按下），DAS/ARR 已被取消
    expect(actions.filter((a) => a === 'moveLeft')).toHaveLength(1);
  });

  it('反之亦然：按住 → 再按 ←，→ 的定时器被取消', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(actions).toEqual(['moveRight']);

    vi.advanceTimersByTime(Math.floor(CONFIG.INPUT.DAS_MS / 2));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveRight', 'moveLeft']);

    // 推进超过 → 原本的 DAS 触发时间，→ 不应再触发
    vi.advanceTimersByTime(CONFIG.INPUT.DAS_MS);
    expect(actions).toEqual(['moveRight', 'moveLeft']);

    // ← 的 ARR 重复
    vi.advanceTimersByTime(CONFIG.INPUT.ARR_MS);
    expect(actions).toEqual(['moveRight', 'moveLeft', 'moveLeft']);

    // 验证 → 只触发了一次
    expect(actions.filter((a) => a === 'moveRight')).toHaveLength(1);
  });
});

describe('Input - softDrop 不触发 ARR', () => {
  it('按住 ↓ 不触发 DAS/ARR 重复', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(actions).toEqual(['softDrop']);

    // 推进远超 DAS + ARR 时间，softDrop 不应重复
    vi.advanceTimersByTime(CONFIG.INPUT.DAS_MS * 5);
    vi.advanceTimersByTime(CONFIG.INPUT.ARR_MS * 10);

    // 仍然只有一次 softDrop
    expect(actions).toEqual(['softDrop']);
  });

  it('softDrop keyup 触发 stopSoftDrop（由标志位驱动，非 DAS/ARR）', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(actions).toEqual(['softDrop']);

    // 推进时间，确认无重复
    vi.advanceTimersByTime(CONFIG.INPUT.DAS_MS * 2);
    expect(actions).toEqual(['softDrop']);

    // keyup 触发 stopSoftDrop
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
    expect(actions).toEqual(['softDrop', 'stopSoftDrop']);
  });
});

describe('Input - 键盘去重', () => {
  it('同一键 keydown 重复触发不重复执行（pressedKeys 集合去重）', () => {
    // 第一次按下
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveLeft']);

    // 浏览器自动重复（e.repeat = true），pressedKeys 已包含 'arrowleft'
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true }));

    // 仍然只有一次 moveLeft
    expect(actions).toEqual(['moveLeft']);
  });

  it('keyup 后再次 keydown 可以再次触发', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveLeft']);

    // keyup 清除 pressedKeys
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveLeft']);

    // 再次按下应触发（pressedKeys 已清空）
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(actions).toEqual(['moveLeft', 'moveLeft']);
  });

  it('非游戏按键不触发任何动作', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F1' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(actions).toEqual([]);
  });
});
