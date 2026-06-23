/**
 * Input - 输入系统
 *
 * - 键盘 + 触屏双输入
 * - 通过回调向 GameEngine 发送事件（观察者模式）
 * - 防止默认行为（如方向键滚动）
 */

import { CONFIG } from '../config';

export type Action =
  | 'moveLeft'
  | 'moveRight'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateCW'
  | 'rotateCCW'
  | 'rotate180'
  | 'hold'
  | 'pause'
  | 'reset'
  | 'confirm'
  | 'toggleMute';

export interface InputCallbacks {
  onAction: (action: Action) => void;
}

export class Input {
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private touchStartHandler: ((e: TouchEvent) => void) | null = null;
  private touchEndHandler: ((e: TouchEvent) => void) | null = null;
  private boundElement: HTMLElement | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  bind(callbacks: InputCallbacks, target: HTMLElement): void {
    this.boundElement = target;

    this.keyHandler = (e: KeyboardEvent) => this.handleKey(e, callbacks);
    window.addEventListener('keydown', this.keyHandler);

    this.touchStartHandler = (e: TouchEvent) => this.handleTouchStart(e);
    this.touchEndHandler = (e: TouchEvent) => this.handleTouchEnd(e, callbacks);
    target.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    target.addEventListener('touchend', this.touchEndHandler, { passive: true });
  }

  unbind(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
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
  }

  // ============ 键盘 ============

  private handleKey(e: KeyboardEvent, cb: InputCallbacks): void {
    const key = e.key.toLowerCase();

    // 方向键
    if (key === 'arrowleft' || key === 'a') {
      cb.onAction('moveLeft');
      e.preventDefault();
      return;
    }
    if (key === 'arrowright' || key === 'd') {
      cb.onAction('moveRight');
      e.preventDefault();
      return;
    }
    if (key === 'arrowdown' || key === 's') {
      cb.onAction('softDrop');
      e.preventDefault();
      return;
    }
    if (key === 'arrowup' || key === 'w' || key === 'x') {
      cb.onAction('rotateCW');
      e.preventDefault();
      return;
    }
    if (key === 'z') {
      cb.onAction('rotateCCW');
      e.preventDefault();
      return;
    }

    // 操作键
    if (key === ' ') {
      cb.onAction('hardDrop');
      e.preventDefault();
      return;
    }
    if (key === 'c' || key === 'shift') {
      cb.onAction('hold');
      e.preventDefault();
      return;
    }
    if (key === 'p' || key === 'escape') {
      cb.onAction('pause');
      e.preventDefault();
      return;
    }
    if (key === 'r') {
      cb.onAction('reset');
      e.preventDefault();
      return;
    }
    if (key === 'enter') {
      cb.onAction('confirm');
      e.preventDefault();
      return;
    }
    if (key === 'm') {
      cb.onAction('toggleMute');
      return;
    }
  }

  // ============ 触屏 ============

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  private handleTouchEnd(e: TouchEvent, cb: InputCallbacks): void {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const dt = Date.now() - this.touchStartTime;
    const threshold = CONFIG.TOUCH.THRESHOLD;

    // 点击（短按且无移动）→ 旋转
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold && dt < 250) {
      cb.onAction('rotateCW');
      return;
    }

    // 滑动
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= threshold) {
        cb.onAction(dx > 0 ? 'moveRight' : 'moveLeft');
      }
    } else {
      if (Math.abs(dy) >= threshold) {
        cb.onAction(dy > 0 ? 'softDrop' : 'hardDrop');
      }
    }
  }
}
