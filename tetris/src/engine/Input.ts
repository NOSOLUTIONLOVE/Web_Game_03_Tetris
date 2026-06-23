/**
 * Input - 输入系统
 *
 * - 键盘 + 触屏双输入
 * - 通过回调向 GameEngine 发送事件（观察者模式）
 * - 防止默认行为（如方向键滚动）
 * - DAS（Delayed Auto Shift）/ ARR（Auto Repeat Rate）自动重复
 *   - 按住方向键：立即触发一次 → DAS 延迟后 → 按 ARR 间隔持续触发
 */

import { CONFIG } from '../config';

export type Action =
  | 'moveLeft'
  | 'moveRight'
  | 'softDrop'
  | 'stopSoftDrop'
  | 'hardDrop'
  | 'rotateCW'
  | 'rotateCCW'
  | 'rotate180'
  | 'hold'
  | 'pause'
  | 'reset'
  | 'confirm'
  | 'toggleMute';

/** 支持 DAS/ARR 自动重复的动作 */
type RepeatableAction = 'moveLeft' | 'moveRight' | 'softDrop';

export interface InputCallbacks {
  onAction: (action: Action) => void;
}

/** 单个按键的 DAS/ARR 定时器状态 */
interface RepeatTimer {
  dasTimer: ReturnType<typeof setTimeout> | null;
  arrInterval: ReturnType<typeof setInterval> | null;
}

export class Input {
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;
  private touchStartHandler: ((e: TouchEvent) => void) | null = null;
  private touchEndHandler: ((e: TouchEvent) => void) | null = null;
  private boundElement: HTMLElement | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  /** 当前按下的按键集合（用于去重） */
  private pressedKeys = new Set<string>();

  /** 每个可重复动作的定时器 */
  private repeatTimers = new Map<RepeatableAction, RepeatTimer>();

  /** DAS 延迟（ms），可运行时调整 */
  private dasMs: number = CONFIG.INPUT.DAS_MS;
  /** ARR 间隔（ms），可运行时调整 */
  private arrMs: number = CONFIG.INPUT.ARR_MS;

  /** 回调引用（unbind 时置空） */
  private callbacks: InputCallbacks | null = null;

  bind(callbacks: InputCallbacks, target: HTMLElement): void {
    this.callbacks = callbacks;
    this.boundElement = target;

    this.keyHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.keyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);
    window.addEventListener('keydown', this.keyHandler);
    window.addEventListener('keyup', this.keyUpHandler);

    this.touchStartHandler = (e: TouchEvent) => this.handleTouchStart(e);
    this.touchEndHandler = (e: TouchEvent) => this.handleTouchEnd(e);
    target.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    target.addEventListener('touchend', this.touchEndHandler, { passive: true });
  }

  unbind(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    if (this.keyUpHandler) {
      window.removeEventListener('keyup', this.keyUpHandler);
      this.keyUpHandler = null;
    }
    if (this.boundElement) {
      if (this.touchStartHandler) {
        this.boundElement.removeEventListener('touchstart', this.touchStartHandler);
      }
      if (this.touchEndHandler) {
        this.boundElement.removeEventListener('touchend', this.touchEndHandler);
      }
      this.touchStartHandler = null;
      this.touchEndHandler = null;
      this.boundElement = null;
    }
    // 清理所有定时器
    this.clearAllTimers();
    this.pressedKeys.clear();
    this.callbacks = null;
  }

  /** 运行时设置 DAS 延迟 */
  setDAS(ms: number): void {
    this.dasMs = ms;
  }

  /** 运行时设置 ARR 间隔 */
  setARR(ms: number): void {
    this.arrMs = ms;
  }

  // ============ 键盘 ============

  /** 将按键映射为动作，返回 null 表示非游戏按键 */
  private keyToAction(key: string): Action | null {
    // 方向键
    if (key === 'arrowleft' || key === 'a') return 'moveLeft';
    if (key === 'arrowright' || key === 'd') return 'moveRight';
    if (key === 'arrowdown' || key === 's') return 'softDrop';
    if (key === 'arrowup' || key === 'w' || key === 'x') return 'rotateCW';
    if (key === 'z') return 'rotateCCW';
    // 操作键
    if (key === ' ') return 'hardDrop';
    if (key === 'c' || key === 'shift') return 'hold';
    if (key === 'p' || key === 'escape') return 'pause';
    if (key === 'r') return 'reset';
    if (key === 'enter') return 'confirm';
    if (key === 'm') return 'toggleMute';
    return null;
  }

  /** 判断动作是否支持 DAS/ARR 自动重复 */
  private isRepeatable(action: Action): action is RepeatableAction {
    return action === 'moveLeft' || action === 'moveRight' || action === 'softDrop';
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.callbacks) return;
    const key = e.key.toLowerCase();
    const action = this.keyToAction(key);
    if (!action) return;

    e.preventDefault();

    // 防止 keydown 重复触发（浏览器自动重复）
    if (this.pressedKeys.has(key)) return;
    this.pressedKeys.add(key);

    // 立即触发一次
    this.callbacks.onAction(action);

    // 对可重复动作启动 DAS/ARR
    if (this.isRepeatable(action)) {
      this.startRepeat(action);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (!this.callbacks) return;
    const key = e.key.toLowerCase();
    if (!this.pressedKeys.has(key)) return;
    this.pressedKeys.delete(key);

    const action = this.keyToAction(key);
    if (!action) return;

    // 清除该按键的 DAS/ARR 定时器
    if (this.isRepeatable(action)) {
      this.stopRepeat(action);
      // 软降松开时通知引擎停止软降
      if (action === 'softDrop') {
        this.callbacks.onAction('stopSoftDrop');
      }
    }
  }

  /** 启动 DAS/ARR 自动重复 */
  private startRepeat(action: RepeatableAction): void {
    if (!this.callbacks) return;
    const cb = this.callbacks;
    const timer: RepeatTimer = { dasTimer: null, arrInterval: null };

    // DAS 延迟后开始 ARR 重复
    timer.dasTimer = setTimeout(() => {
      // ARR 间隔持续触发
      timer.arrInterval = setInterval(() => {
        cb.onAction(action);
      }, this.arrMs);
    }, this.dasMs);

    this.repeatTimers.set(action, timer);
  }

  /** 停止某个动作的 DAS/ARR */
  private stopRepeat(action: RepeatableAction): void {
    const timer = this.repeatTimers.get(action);
    if (!timer) return;
    if (timer.dasTimer) clearTimeout(timer.dasTimer);
    if (timer.arrInterval) clearInterval(timer.arrInterval);
    this.repeatTimers.delete(action);
  }

  /** 清理所有定时器 */
  private clearAllTimers(): void {
    for (const [, timer] of this.repeatTimers) {
      if (timer.dasTimer) clearTimeout(timer.dasTimer);
      if (timer.arrInterval) clearInterval(timer.arrInterval);
    }
    this.repeatTimers.clear();
  }

  // ============ 触屏 ============

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (!this.callbacks) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const dt = Date.now() - this.touchStartTime;
    const threshold = CONFIG.TOUCH.THRESHOLD;

    // 点击（短按且无移动）→ 旋转
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold && dt < 250) {
      this.callbacks.onAction('rotateCW');
      return;
    }

    // 滑动
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= threshold) {
        this.callbacks.onAction(dx > 0 ? 'moveRight' : 'moveLeft');
      }
    } else {
      if (Math.abs(dy) >= threshold) {
        this.callbacks.onAction(dy > 0 ? 'softDrop' : 'hardDrop');
      }
    }
  }
}
