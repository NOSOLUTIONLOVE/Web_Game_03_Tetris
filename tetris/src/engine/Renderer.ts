/**
 * Renderer - Canvas 2D 渲染
 *
 * 职责：
 * - 多区域渲染：主网格 + Hold + Next
 * - 已锁定方块 + 当前方块 + Ghost 阴影
 * - 消行闪烁 + Tetris 闪光 + 等级提升文字
 * - 消行和升级时推送动画事件给 UI
 *
 * 设计要点：
 * - 框架无关：只依赖 Canvas API
 * - 每帧清空 + 重绘，性能优先
 * - 动画状态由外部驱动（通过 updateAnimation）
 */

import { CONFIG, type GridCell, type TetrominoType } from '../config';
import type { Tetromino } from './Tetromino';
import { TETROMINOES } from './tetrominoes';

export interface ClearAnimation {
  rows: number[]; // 被消除的行（在完整网格中）
  startTime: number;
  isTetris: boolean;
}

export interface LevelUpAnimation {
  level: number;
  startTime: number;
}

export interface RenderSnapshot {
  grid: GridCell[][]; // 完整网格（含缓冲区）
  current: Tetromino | null;
  ghostY: number;
  holdType: TetrominoType | null;
  nextQueue: TetrominoType[];
  score: number;
  level: number;
  lines: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private cellSize: number;
  private playfieldX: number;
  private playfieldY: number;
  private playfieldWidth: number;
  private playfieldHeight: number;
  private holdX: number;
  private nextX: number;
  private panelWidth: number;
  private panelY: number;
  private panelHeight: number;
  private clearAnimation: ClearAnimation | null = null;
  private levelUpAnimation: LevelUpAnimation | null = null;
  // 设计尺寸（CSS 像素）与 DPR，用于高分辨率渲染
  private designWidth: number;
  private designHeight: number;
  private dpr: number;
  /** resize 监听器引用（用于 destroy 时移除） */
  private resizeHandler: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = ctx;

    this.cellSize = CONFIG.GRID.CELL_SIZE;
    const gap = CONFIG.CANVAS.GAP;
    const padding = CONFIG.CANVAS.PADDING;

    // 布局：主网格 + Hold 在左 + Next 在右
    this.playfieldWidth = CONFIG.GRID.COLS * this.cellSize;
    this.playfieldHeight = CONFIG.GRID.ROWS * this.cellSize;
    this.panelWidth = 4 * this.cellSize + padding * 2;
    this.panelHeight = 4 * this.cellSize + padding * 2;

    // 总宽度 = Hold + gap + 主网格 + gap + Next
    const totalWidth = this.panelWidth + gap + this.playfieldWidth + gap + this.panelWidth;
    const totalHeight = this.playfieldHeight;

    // 保存设计尺寸（CSS 像素）
    this.designWidth = totalWidth;
    this.designHeight = totalHeight;

    // DPI 感知：backing store 按 devicePixelRatio 放大
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.designWidth * this.dpr;
    this.canvas.height = this.designHeight * this.dpr;
    // CSS 尺寸保持设计尺寸（由外部样式控制）
    this.canvas.style.width = `${this.designWidth}px`;
    this.canvas.style.height = `${this.designHeight}px`;
    // 统一坐标系：所有绘制按设计尺寸，ctx 自动缩放
    this.ctx.scale(this.dpr, this.dpr);

    this.playfieldX = this.panelWidth + gap;
    this.playfieldY = 0;
    this.holdX = 0;
    this.nextX = this.panelWidth + gap + this.playfieldWidth + gap;
    this.panelY = 0;

    // 监听窗口 resize（跨屏移动后 DPR 可能变化，需重新计算 backing store）
    this.resizeHandler = this.handleDPRChange.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  }

  // ============ 公开 API ============

  /** 设置消行动画（外部调用，触发动画渲染） */
  setClearAnimation(rows: number[], isTetris: boolean): void {
    this.clearAnimation = {
      rows,
      startTime: performance.now(),
      isTetris,
    };
  }

  /** 设置升级动画 */
  setLevelUpAnimation(level: number): void {
    this.levelUpAnimation = {
      level,
      startTime: performance.now(),
    };
  }

  /** 清除所有动画 */
  clearAnimations(): void {
    this.clearAnimation = null;
    this.levelUpAnimation = null;
  }

  /** 销毁渲染器，移除事件监听（在 GameEngine.stop 中调用） */
  destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  /** 重新计算 DPI 缩放（窗口拖到不同 DPI 显示器时） */
  handleDPRChange(): void {
    const newDpr = window.devicePixelRatio || 1;
    if (newDpr === this.dpr) return;
    this.dpr = newDpr;
    // 重新设置 backing store
    this.canvas.width = this.designWidth * this.dpr;
    this.canvas.height = this.designHeight * this.dpr;
    this.canvas.style.width = `${this.designWidth}px`;
    this.canvas.style.height = `${this.designHeight}px`;
    // 重新应用缩放（重置 width/height 会清除变换矩阵）
    this.ctx.scale(this.dpr, this.dpr);
  }

  // ============ 主渲染流程 ============

  render(snapshot: RenderSnapshot): void {
    this.clear();
    this.drawPanel(this.holdX, this.panelY, 'HOLD', snapshot.holdType);
    this.drawPlayfield(snapshot);
    this.drawNextPanel(snapshot.nextQueue);
    this.drawAnimations(snapshot);
  }

  /** 清空画布 */
  private clear(): void {
    this.ctx.fillStyle = CONFIG.COLORS.BG;
    this.ctx.fillRect(0, 0, this.designWidth, this.designHeight);
  }

  // ============ 主网格 ============

  private drawPlayfield(snapshot: RenderSnapshot): void {
    const { grid, current, ghostY } = snapshot;
    const padding = 4;

    // 外框
    this.ctx.fillStyle = CONFIG.COLORS.PANEL_BG;
    this.ctx.fillRect(
      this.playfieldX - padding,
      this.playfieldY - padding,
      this.playfieldWidth + padding * 2,
      this.playfieldHeight + padding * 2
    );

    // 网格线
    this.drawGridLines();

    // 已锁定方块（跳过缓冲区）
    for (let y = CONFIG.GRID.BUFFER_ROWS; y < grid.length; y++) {
      for (let x = 0; x < CONFIG.GRID.COLS; x++) {
        const cell = grid[y]?.[x];
        if (cell) {
          this.drawCell(
            this.playfieldX + x * this.cellSize,
            this.playfieldY + (y - CONFIG.GRID.BUFFER_ROWS) * this.cellSize,
            cell
          );
        }
      }
    }

    // Ghost 阴影
    if (current && ghostY !== current.position.y) {
      this.drawGhost(current, ghostY);
    }

    // 当前方块
    if (current) {
      this.drawTetromino(current);
    }

    // 消行动画闪烁
    if (this.clearAnimation) {
      this.drawClearFlash(this.clearAnimation);
    }
  }

  private drawGridLines(): void {
    this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    for (let i = 1; i < CONFIG.GRID.COLS; i++) {
      const x = this.playfieldX + i * this.cellSize;
      this.ctx.moveTo(x, this.playfieldY);
      this.ctx.lineTo(x, this.playfieldY + this.playfieldHeight);
    }
    for (let i = 1; i < CONFIG.GRID.ROWS; i++) {
      const y = this.playfieldY + i * this.cellSize;
      this.ctx.moveTo(this.playfieldX, y);
      this.ctx.lineTo(this.playfieldX + this.playfieldWidth, y);
    }
    this.ctx.stroke();
  }

  // ============ Hold / Next 面板 ============

  private drawPanel(x: number, y: number, label: string, type: TetrominoType | null): void {
    const padding = CONFIG.CANVAS.PADDING;

    // 背景
    this.ctx.fillStyle = CONFIG.COLORS.PANEL_BG;
    this.ctx.fillRect(x, y, this.panelWidth, this.panelHeight);

    // 边框
    this.ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, this.panelWidth, this.panelHeight);

    // 标签
    this.ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    this.ctx.font = 'bold 11px -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(label, x + this.panelWidth / 2, y + 4);

    // 方块
    if (type) {
      this.drawMiniTetromino(type, x + padding, y + padding + 18);
    }
  }

  private drawNextPanel(queue: TetrominoType[]): void {
    const padding = CONFIG.CANVAS.PADDING;
    const y = this.panelY;

    // 背景
    this.ctx.fillStyle = CONFIG.COLORS.PANEL_BG;
    this.ctx.fillRect(this.nextX, y, this.panelWidth, this.playfieldHeight);

    // 边框
    this.ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.nextX, y, this.panelWidth, this.playfieldHeight);

    // 标签
    this.ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    this.ctx.font = 'bold 11px -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('NEXT', this.nextX + this.panelWidth / 2, y + 4);

    // 三个方块
    const startY = y + 24;
    const itemHeight = (this.playfieldHeight - 24) / 3;
    for (let i = 0; i < Math.min(queue.length, 3); i++) {
      this.drawMiniTetromino(
        queue[i]!,
        this.nextX + padding,
        startY + i * itemHeight
      );
    }
  }

  // ============ 方块绘制 ============

  private drawTetromino(piece: Tetromino): void {
    const shape = piece.shape();
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r]!.length; c++) {
        if (shape[r]![c] === 1) {
          const x = this.playfieldX + (piece.position.x + c) * this.cellSize;
          const y = this.playfieldY + (piece.position.y + r - CONFIG.GRID.BUFFER_ROWS) * this.cellSize;
          // 跳过缓冲区中看不见的部分
          if (piece.position.y + r - CONFIG.GRID.BUFFER_ROWS < 0) continue;
          this.drawCell(x, y, piece.type);
        }
      }
    }
  }

  private drawGhost(piece: Tetromino, ghostY: number): void {
    const shape = piece.shape();
    this.ctx.save();
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r]!.length; c++) {
        if (shape[r]![c] === 1) {
          const screenY = ghostY + r - CONFIG.GRID.BUFFER_ROWS;
          if (screenY < 0) continue;
          const x = this.playfieldX + (piece.position.x + c) * this.cellSize;
          const y = this.playfieldY + screenY * this.cellSize;
          this.drawGhostCell(x, y, piece.type);
        }
      }
    }
    this.ctx.restore();
  }

  /**
   * 绘制单个方块格子
   */
  private drawCell(x: number, y: number, type: TetrominoType): void {
    const size = this.cellSize;
    const padding = 1;
    const color = this.getColor(type);

    // 主体
    this.ctx.fillStyle = color;
    this.roundRect(x + padding, y + padding, size - padding * 2, size - padding * 2, 4);
    this.ctx.fill();

    // 高光（左上）
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.roundRect(x + padding + 2, y + padding + 2, size - padding * 2 - 8, 2, 1);
    this.ctx.fill();

    // 阴影（右下）
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.roundRect(
      x + padding + 2,
      y + size - padding - 4,
      size - padding * 2 - 4,
      2,
      1
    );
    this.ctx.fill();
  }

  /**
   * 绘制 Ghost 格子（半透明轮廓）
   */
  private drawGhostCell(x: number, y: number, type: TetrominoType): void {
    const size = this.cellSize;
    const padding = 2;
    const color = this.getColor(type);

    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = 0.35;
    this.ctx.lineWidth = 2;
    this.roundRect(x + padding, y + padding, size - padding * 2, size - padding * 2, 4);
    this.ctx.stroke();

    // 内部填充（更透明）
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.08;
    this.roundRect(x + padding, y + padding, size - padding * 2, size - padding * 2, 4);
    this.ctx.fill();

    this.ctx.globalAlpha = 1;
  }

  /**
   * 绘制迷你方块（用于 Hold/Next 面板）
   */
  private drawMiniTetromino(type: TetrominoType, x: number, y: number): void {
    // 用 4×4 矩阵的 1/2 尺寸绘制
    const shape = TETROMINOES[type];
    const miniSize = this.cellSize / 2;
    const padding = 4;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (shape[r]?.[c] === 1) {
          this.drawMiniCell(
            x + padding + c * miniSize,
            y + padding + r * miniSize,
            type,
            miniSize
          );
        }
      }
    }
  }

  private drawMiniCell(x: number, y: number, type: TetrominoType, size: number): void {
    const padding = 1;
    const color = this.getColor(type);
    this.ctx.fillStyle = color;
    this.roundRect(x + padding, y + padding, size - padding * 2, size - padding * 2, 2);
    this.ctx.fill();
  }

  // ============ 动画 ============

  private drawClearFlash(anim: ClearAnimation): void {
    const elapsed = performance.now() - anim.startTime;
    const duration = 400;
    if (elapsed > duration) {
      this.clearAnimation = null;
      return;
    }

    // 闪烁 3 次
    const flash = Math.sin((elapsed / duration) * Math.PI * 3) > 0;

    if (flash) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (const y of anim.rows) {
        const screenY = y - CONFIG.GRID.BUFFER_ROWS;
        if (screenY < 0) continue;
        this.ctx.fillRect(
          this.playfieldX,
          this.playfieldY + screenY * this.cellSize,
          this.playfieldWidth,
          this.cellSize
        );
      }
    }

    // Tetris 全屏闪光
    if (anim.isTetris) {
      const alpha = Math.max(0, 1 - elapsed / 300) * 0.4;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fillRect(0, 0, this.designWidth, this.designHeight);
    }
  }

  private drawAnimations(_snapshot: RenderSnapshot): void {
    // 等级提升文字
    if (this.levelUpAnimation) {
      const elapsed = performance.now() - this.levelUpAnimation.startTime;
      const duration = 1200;
      if (elapsed > duration) {
        this.levelUpAnimation = null;
      } else {
        const alpha = elapsed < 600 ? elapsed / 600 : 1 - (elapsed - 600) / 600;
        this.ctx.save();
        this.ctx.fillStyle = `rgba(160, 0, 240, ${alpha})`;
        this.ctx.font = 'bold 48px -apple-system, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(160, 0, 240, 0.8)';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText(
          `LEVEL ${this.levelUpAnimation.level}`,
          this.playfieldX + this.playfieldWidth / 2,
          this.playfieldY + this.playfieldHeight / 2
        );
        this.ctx.restore();
      }
    }
  }

  // ============ 工具 ============

  private getColor(type: TetrominoType): string {
    return CONFIG.COLORS[type];
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  /** 获取画布尺寸（外部布局用，返回设计尺寸即 CSS 像素） */
  getDimensions(): { width: number; height: number } {
    return { width: this.designWidth, height: this.designHeight };
  }
}
