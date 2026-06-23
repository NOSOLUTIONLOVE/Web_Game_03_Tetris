/**
 * Board 单元测试
 *
 * 覆盖：碰撞检测 / 锁定 / 消行 / 边界 / Ghost / Game Over
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../Board';
import { Tetromino } from '../Tetromino';
import { CONFIG } from '../../config';

describe('Board - 基础', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('初始状态：完整网格 = ROWS + BUFFER_ROWS 行', () => {
    const grid = board.getFullGrid();
    expect(grid.length).toBe(CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS);
    grid.forEach((row) => {
      expect(row.length).toBe(CONFIG.GRID.COLS);
    });
  });

  it('初始状态：所有格子为 null', () => {
    const grid = board.getFullGrid();
    grid.forEach((row) => {
      row.forEach((cell) => expect(cell).toBeNull());
    });
  });

  it('reset 后清空网格', () => {
    const piece = new Tetromino('O', { x: 0, y: 0 });
    board.lockPiece(piece);
    // O 块 4×4 矩阵 r=0,1 全 1 → 锁定到全局 y=0,1
    expect(board.getCell(0, 0)).toBe('O');
    expect(board.getCell(1, 0)).toBe('O');
    expect(board.getCell(0, 1)).toBe('O');
    expect(board.getCell(1, 1)).toBe('O');

    board.reset();
    board.getFullGrid().forEach((row) => {
      row.forEach((cell) => expect(cell).toBeNull());
    });
  });
});

describe('Board - 碰撞检测', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('方块在空网格中央合法', () => {
    const piece = new Tetromino('T', { x: 3, y: 0 });
    expect(board.isValidPosition(piece)).toBe(true);
  });

  it('方块超出左边界 → 不合法', () => {
    const piece = new Tetromino('I', { x: -1, y: 0 });
    expect(board.isValidPosition(piece)).toBe(false);
  });

  it('方块超出右边界 → 不合法', () => {
    // I 块宽 4，起点 x = 7 时部分超出
    const piece = new Tetromino('I', { x: 7, y: 0 });
    expect(board.isValidPosition(piece)).toBe(false);
  });

  it('方块超出下边界 → 不合法', () => {
    // 强制放置到下边界外
    const piece = new Tetromino('O', { x: 0, y: 22 });
    expect(board.isValidPosition(piece)).toBe(false);
  });

  it('方块与已锁定方块重叠 → 不合法', () => {
    const a = new Tetromino('O', { x: 4, y: 0 });
    board.lockPiece(a);
    const b = new Tetromino('O', { x: 4, y: 0 });
    expect(board.isValidPosition(b)).toBe(false);
  });

  it('方块上方无限制（允许 y < 0）', () => {
    const piece = new Tetromino('I', { x: 3, y: -1 });
    expect(board.isValidPosition(piece)).toBe(true);
  });
});

describe('Board - 锁定方块', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('锁定 O 块（2x2）到 (3, 0)', () => {
    const piece = new Tetromino('O', { x: 3, y: 0 });
    board.lockPiece(piece);
    // O 块形状：[[0,1,1,0],[0,1,1,0]...]] 占用 (3,0), (4,0), (3,1), (4,1)
    expect(board.getCell(3, 0)).toBe('O');
    expect(board.getCell(4, 0)).toBe('O');
    expect(board.getCell(3, 1)).toBe('O');
    expect(board.getCell(4, 1)).toBe('O');
  });

  it('锁定 I 块（1x4）到 (3, 5)', () => {
    const piece = new Tetromino('I', { x: 3, y: 5 });
    board.lockPiece(piece);
    // I 块形状：row=1 全 1，占用 (3,6), (4,6), (5,6), (6,6)
    expect(board.getCell(3, 6)).toBe('I');
    expect(board.getCell(4, 6)).toBe('I');
    expect(board.getCell(5, 6)).toBe('I');
    expect(board.getCell(6, 6)).toBe('I');
  });
});

describe('Board - 消行', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('单行满行 → 消除 1 行', () => {
    // 手动填满第 19 行（显示行 18）
    const row = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1; // 21
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      // 通过锁定方块间接填充
    }
    // 简化：直接修改 grid
    const grid = board.getFullGrid();
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[row]![x] = 'I';
    }
    const fullLines = board.findFullLines();
    expect(fullLines).toEqual([row]);
    expect(board.clearLines(fullLines)).toBe(1);
    // 顶部应该补空行
    expect(board.getCell(0, 0)).toBeNull();
  });

  it('双行满行 → 消除 2 行', () => {
    const row1 = 20;
    const row2 = 21;
    const grid = board.getFullGrid();
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[row1]![x] = 'O';
      grid[row2]![x] = 'T';
    }
    const fullLines = board.findFullLines();
    expect(fullLines).toEqual([row1, row2]);
    expect(board.clearLines(fullLines)).toBe(2);
  });

  it('Tetris 满 4 行 → 消除 4 行', () => {
    const startRow = 18;
    const grid = board.getFullGrid();
    for (let y = startRow; y < startRow + 4; y++) {
      for (let x = 0; x < CONFIG.GRID.COLS; x++) {
        grid[y]![x] = 'I';
      }
    }
    const fullLines = board.findFullLines();
    expect(fullLines.length).toBe(4);
    expect(board.clearLines(fullLines)).toBe(4);
  });

  it('未满行不消除', () => {
    const row = 21;
    const grid = board.getFullGrid();
    for (let x = 0; x < CONFIG.GRID.COLS - 1; x++) {
      grid[row]![x] = 'L';
    }
    expect(board.findFullLines()).toEqual([]);
  });

  it('空行不消除', () => {
    expect(board.findFullLines()).toEqual([]);
    expect(board.clearLines([])).toBe(0);
  });
});

describe('Board - Ghost', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('空网格中：Ghost = 最底部', () => {
    const piece = new Tetromino('O', { x: 4, y: 0 });
    // O 块占用 2 行，在空网格中应该能下落到 y = 18 (ROWS - 2)
    // Buffer rows = 2, so visible y in display = 18 means in full grid y = 20
    const ghostY = board.getGhostY(piece);
    expect(ghostY).toBe(CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 2);
  });

  it('硬降距离正确', () => {
    const piece = new Tetromino('O', { x: 4, y: 0 });
    const distance = board.getHardDropDistance(piece);
    expect(distance).toBeGreaterThan(0);
  });

  it('已锁定方块下方：Ghost 停在锁定方块上方', () => {
    // 在底部行（21）锁定一行方块
    const grid = board.getFullGrid();
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1]![x] = 'I';
    }
    // O 块（2 行）应停在 19（顶部），底部行 20 在锁定行 21 上方
    const piece = new Tetromino('O', { x: 4, y: 0 });
    const ghostY = board.getGhostY(piece);
    expect(ghostY).toBe(19);
  });
});

describe('Board - Game Over', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('空网格中：新方块不游戏结束', () => {
    const piece = new Tetromino('T', { x: 3, y: 0 });
    expect(board.isGameOver(piece)).toBe(false);
  });

  it('新方块在出生位置被占用 → Game Over', () => {
    const grid = board.getFullGrid();
    // 占据 (3, 0), (4, 0), (3, 1), (4, 1) 模拟已有方块
    grid[0]![3] = 'I';
    grid[0]![4] = 'I';
    grid[1]![3] = 'I';
    grid[1]![4] = 'I';
    const piece = new Tetromino('O', { x: 3, y: 0 });
    expect(board.isGameOver(piece)).toBe(true);
  });
});

describe('Board - isEmpty', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('空网格 → true', () => {
    expect(board.isEmpty()).toBe(true);
  });

  it('有一个格子被占 → false', () => {
    const grid = board.getFullGrid();
    grid[0]![0] = 'I';
    expect(board.isEmpty()).toBe(false);
  });

  it('消行后网格全空 → true', () => {
    // 填满最底行
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[bottomRow]![x] = 'I';
    }
    expect(board.isEmpty()).toBe(false);
    // 消除满行后应全空
    board.clearLines([bottomRow]);
    expect(board.isEmpty()).toBe(true);
  });
});

describe('Board - isTSpin', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  /**
   * T-Spin 检测说明：
   * - T 中心位于 piece.position + (1, 1)
   * - 四角：[左上, 右上, 左下, 右下] = [(cx-1,cy-1), (cx+1,cy-1), (cx-1,cy+1), (cx+1,cy+1)]
   * - 旋转 0 的前方两角 = [0, 1] = 左上、右上
   * - ≥3 角被占 且 ≥2 前方角被占 → 'full'
   * - ≥3 角被占 且 <2 前方角被占 → 'mini'
   * - <3 角被占 → 'none'
   *
   * T 块在 position (3, 0)，中心 (4, 1)，四角：
   *   左上 (3,0)，右上 (5,0)，左下 (3,2)，右下 (5,2)
   */

  it('非 T 方块 → none', () => {
    const piece = new Tetromino('O', { x: 3, y: 0 });
    expect(board.isTSpin(piece, true)).toBe('none');
  });

  it('T 方块但 lastMoveWasRotate=false → none', () => {
    const piece = new Tetromino('T', { x: 3, y: 0 });
    expect(board.isTSpin(piece, false)).toBe('none');
  });

  it('T 方块 3 角被占且 2 前方角被占 → full', () => {
    // T 块在 (3,0)，中心 (4,1)
    // 前方角（旋转 0）：左上 (3,0)、右上 (5,0)
    // 填充 (3,0), (5,0), (3,2) → 3 角，前方 2 角全占 → full
    const grid = board.getFullGrid();
    grid[0]![3] = 'I'; // 左上
    grid[0]![5] = 'I'; // 右上
    grid[2]![3] = 'I'; // 左下
    const piece = new Tetromino('T', { x: 3, y: 0 });
    expect(board.isTSpin(piece, true)).toBe('full');
  });

  it('T 方块 3 角被占但 <2 前方角被占 → mini', () => {
    // T 块在 (3,0)，中心 (4,1)
    // 前方角（旋转 0）：左上 (3,0)、右上 (5,0)
    // 填充 (3,0), (3,2), (5,2) → 3 角，前方仅 (3,0) 被占 → mini
    const grid = board.getFullGrid();
    grid[0]![3] = 'I'; // 左上（前方）
    grid[2]![3] = 'I'; // 左下
    grid[2]![5] = 'I'; // 右下
    const piece = new Tetromino('T', { x: 3, y: 0 });
    expect(board.isTSpin(piece, true)).toBe('mini');
  });

  it('T 方块 <3 角被占 → none', () => {
    // T 块在 (3,0)，中心 (4,1)
    // 仅填充 2 角 → none
    const grid = board.getFullGrid();
    grid[0]![3] = 'I'; // 左上
    grid[0]![5] = 'I'; // 右上
    const piece = new Tetromino('T', { x: 3, y: 0 });
    expect(board.isTSpin(piece, true)).toBe('none');
  });
});
