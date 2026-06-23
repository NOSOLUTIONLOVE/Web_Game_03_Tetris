/**
 * Board - 10×20 网格核心算法
 *
 * 职责：
 * - 维护已锁定的方块网格
 * - 碰撞检测
 * - 锁定方块
 * - 消除满行
 * - 计算 Ghost 位置
 * - Game Over 判定
 *
 * 设计：
 * - 网格使用 10 列 × 20 行
 * - row 0 在顶部（Canvas 渲染时 y 向下）
 * - 顶部预留 2 行缓冲区（不显示），用于方块生成
 * - 内部 grid 包含缓冲区（共 22 行），但对外暴露 20 行
 *
 * 坐标系统：
 * - x: 0-9（左到右）
 * - y: 0-19（上到下）
 */

import { CONFIG, type GridCell, type Point } from '../config';
import type { Tetromino } from './Tetromino';

export class Board {
  /** 完整网格（含顶部缓冲区），大小 = ROWS + BUFFER_ROWS = 22 */
  private grid: GridCell[][];

  constructor() {
    this.grid = this.createEmptyGrid();
  }

  /**
   * 创建空网格（包含顶部缓冲区）
   */
  private createEmptyGrid(): GridCell[][] {
    const totalRows = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS;
    return Array.from({ length: totalRows }, () =>
      new Array<GridCell>(CONFIG.GRID.COLS).fill(null)
    );
  }

  /**
   * 重置为空网格
   */
  reset(): void {
    this.grid = this.createEmptyGrid();
  }

  /**
   * 获取完整网格（包含缓冲区）
   */
  getFullGrid(): GridCell[][] {
    return this.grid;
  }

  /**
   * 获取显示网格（不含缓冲区，20 行）
   */
  getDisplayGrid(): GridCell[][] {
    return this.grid.slice(CONFIG.GRID.BUFFER_ROWS);
  }

  /**
   * 获取指定格子的值
   */
  getCell(x: number, y: number): GridCell {
    if (x < 0 || x >= CONFIG.GRID.COLS) return null;
    if (y < 0 || y >= CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS) return null;
    return this.grid[y]?.[x] ?? null;
  }

  /**
   * 检查方块位置是否合法（不超出边界 + 不与已锁定方块重叠）
   * @param piece 待检测的方块
   * @returns 是否合法
   */
  isValidPosition(piece: Tetromino): boolean {
    const cells = piece.cells();
    for (const { x, y } of cells) {
      // 超出左/右边界
      if (x < 0 || x >= CONFIG.GRID.COLS) return false;
      // 超出底部边界
      if (y >= CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS) return false;
      // 上方不限制（允许 y < 0，让方块从顶部进入）
      // 与已锁定方块重叠
      if (y >= 0 && this.getCell(x, y) !== null) return false;
    }
    return true;
  }

  /**
   * 锁定方块到网格
   * @returns 被锁定的格子列表（用于消行检测）
   */
  lockPiece(piece: Tetromino): Point[] {
    const locked: Point[] = [];
    const cells = piece.cells();
    for (const { x, y } of cells) {
      // 越界的不锁定（理论上不应发生）
      if (
        y < 0 ||
        y >= CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS ||
        x < 0 ||
        x >= CONFIG.GRID.COLS
      ) {
        continue;
      }
      this.grid[y]![x] = piece.type;
      locked.push({ x, y });
    }
    return locked;
  }

  /**
   * 找出所有满行索引（基于显示网格）
   * @returns 满行的 y 坐标列表
   */
  findFullLines(): number[] {
    const result: number[] = [];
    for (let y = CONFIG.GRID.BUFFER_ROWS; y < CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS; y++) {
      if (this.isLineFull(y)) {
        result.push(y);
      }
    }
    return result;
  }

  /**
   * 判断某一行是否填满
   */
  private isLineFull(y: number): boolean {
    const row = this.grid[y];
    if (!row) return false;
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      if (row[x] === null) return false;
    }
    return true;
  }

  /**
   * 消除满行
   * @param rows 要消除的行索引（基于完整网格）
   * @returns 实际消除的行数
   */
  clearLines(rows: number[]): number {
    if (rows.length === 0) return 0;
    // 按行号升序排序（先消除底部的行）
    const sortedRows = [...rows].sort((a, b) => a - b);

    // 从满行中移除，其他行下沉
    // 简化算法：保留非满行，再在顶部补空行
    const remaining: GridCell[][] = [];
    for (let y = 0; y < this.grid.length; y++) {
      if (!sortedRows.includes(y)) {
        remaining.push(this.grid[y]!);
      }
    }

    // 在顶部补充空行
    const emptyRow: GridCell[] = new Array(CONFIG.GRID.COLS).fill(null);
    while (remaining.length < this.grid.length) {
      remaining.unshift([...emptyRow]);
    }

    this.grid = remaining;
    return sortedRows.length;
  }

  /**
   * 计算方块硬降后的位置（Ghost 预览）
   * @param piece 当前方块
   * @returns Ghost 的 y 坐标
   */
  getGhostY(piece: Tetromino): number {
    let ghostY = piece.position.y;
    const ghost = piece.clone();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      ghost.position = { x: piece.position.x, y: ghostY + 1 };
      if (!this.isValidPosition(ghost)) break;
      ghostY++;
    }
    return ghostY;
  }

  /**
   * 计算硬降后下降的格子数
   * @returns 下降的格数
   */
  getHardDropDistance(piece: Tetromino): number {
    return this.getGhostY(piece) - piece.position.y;
  }

  /**
   * Game Over 判定：方块在出生位置就重叠
   */
  isGameOver(piece: Tetromino): boolean {
    return !this.isValidPosition(piece);
  }

  /**
   * 检查网格是否完全为空（用于 Perfect Clear 判定）
   */
  isEmpty(): boolean {
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < CONFIG.GRID.COLS; x++) {
        if (this.grid[y]![x] !== null) return false;
      }
    }
    return true;
  }

  /**
   * T-Spin 检测：基于 T 方块中心四角填充情况
   *
   * 规则（Tetris Guideline）：
   * - 仅当方块类型为 T 且上一步为旋转时检测
   * - T 中心位于 piece.position + (1, 1)
   * - 检查中心四角是否被占据（越界视为已占据）
   * - ≥3 角被占 且 ≥2 个"前方"角被占 → full T-Spin
   * - ≥3 角被占 且 <2 个"前方"角被占 → mini T-Spin
   *
   * @param piece 当前方块
   * @param lastMoveWasRotate 上一步是否为旋转
   * @returns 'none' | 'mini' | 'full'
   */
  isTSpin(piece: Tetromino, lastMoveWasRotate: boolean): 'none' | 'mini' | 'full' {
    if (piece.type !== 'T' || !lastMoveWasRotate) return 'none';

    // T 中心的全局坐标
    const centerX = piece.position.x + 1;
    const centerY = piece.position.y + 1;

    // 四角坐标：[左上, 右上, 左下, 右下]
    const corners = [
      { x: centerX - 1, y: centerY - 1 }, // 0: 左上
      { x: centerX + 1, y: centerY - 1 }, // 1: 右上
      { x: centerX - 1, y: centerY + 1 }, // 2: 左下
      { x: centerX + 1, y: centerY + 1 }, // 3: 右下
    ];

    // 各旋转状态的"前方"两角索引
    const frontCornersByRotation: Record<number, [number, number]> = {
      0: [0, 1], // 旋转 0：左上、右上
      1: [1, 3], // 旋转 1（CW）：右上、右下
      2: [2, 3], // 旋转 2：左下、右下
      3: [0, 2], // 旋转 3：左上、左下
    };

    // 统计被占据的角数
    let filledCount = 0;
    const filled = [false, false, false, false];
    for (let i = 0; i < corners.length; i++) {
      const c = corners[i]!;
      if (this.isCellOccupied(c.x, c.y)) {
        filled[i] = true;
        filledCount++;
      }
    }

    if (filledCount < 3) return 'none';

    // 统计前方角被占据数
    const frontIndices = frontCornersByRotation[piece.rotation] ?? [0, 1];
    const frontFilled = frontIndices.filter((i) => filled[i]).length;

    return frontFilled >= 2 ? 'full' : 'mini';
  }

  /**
   * 检查指定格子是否被占据（越界视为已占据）
   */
  private isCellOccupied(x: number, y: number): boolean {
    // 越界视为已占据
    if (x < 0 || x >= CONFIG.GRID.COLS) return true;
    if (y < 0 || y >= CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS) return true;
    return this.grid[y]![x] !== null;
  }
}
