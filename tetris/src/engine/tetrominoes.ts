/**
 * tetrominoes - 7 种方块的形状定义
 *
 * 每个方块定义为 4×4 矩阵（I 块为 4×4，其他可视为 3×3 + padding）
 * 1 表示有方块，0 表示空
 * 旋转状态 0 = spawn state（出生状态）
 *
 * 参考：Tetris Wiki - Tetromino
 */

import type { Rotation, TetrominoType } from '../config';

/** 方块形状：2D 数组，0/1 表示 */
export type Shape = number[][];

/** 单个方块的 4 个旋转状态 */
export type Shapes = [Shape, Shape, Shape, Shape];

/**
 * 7 种方块的初始状态（spawn state）
 * 形状采用 4×4 矩阵以便统一处理 SRS 踢墙
 */
export const TETROMINOES: Record<TetrominoType, Shape> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  T: [
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  L: [
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

/**
 * 7 种方块类型的列表
 */
export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * 顺时针旋转 90°（矩阵转置 + 翻转列）
 * 输入输出都是 4×4 矩阵
 */
export function rotateCW(shape: Shape): Shape {
  const n = shape.length;
  const result: Shape = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = shape[r][c]!;
    }
  }
  return result;
}

/**
 * 逆时针旋转 90°
 */
export function rotateCCW(shape: Shape): Shape {
  const n = shape.length;
  const result: Shape = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[n - 1 - c][r] = shape[r][c]!;
    }
  }
  return result;
}

/**
 * 旋转 180°
 */
export function rotate180(shape: Shape): Shape {
  return rotateCW(rotateCW(shape));
}

/**
 * 计算 4 个旋转状态（spawn + 3 次顺时针）
 * 缓存避免重复计算
 */
const ROTATION_CACHE: Map<TetrominoType, Shapes> = new Map();

export function getRotations(type: TetrominoType): Shapes {
  if (ROTATION_CACHE.has(type)) {
    return ROTATION_CACHE.get(type)!;
  }
  const r0 = TETROMINOES[type];
  const r1 = rotateCW(r0);
  const r2 = rotateCW(r1);
  const r3 = rotateCW(r2);
  const result: Shapes = [r0, r1, r2, r3];
  ROTATION_CACHE.set(type, result);
  return result;
}

/**
 * 获取指定旋转状态的形状
 */
export function getShape(type: TetrominoType, rotation: Rotation): Shape {
  return getRotations(type)[rotation];
}
