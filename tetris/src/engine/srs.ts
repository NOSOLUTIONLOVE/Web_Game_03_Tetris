/**
 * SRS - Super Rotation System 踢墙表
 *
 * 严格按 tetris.wiki 官方表实现：
 * - J/L/S/T/Z 共用一套踢墙表
 * - I 方块使用单独踢墙表
 * - 每个方块 4×5 = 20 个偏移位置（4 种旋转状态 × 5 个测试点）
 *
 * 旋转状态：0 = spawn, 1 = R (right/CW), 2 = 2 (180), 3 = L (left/CCW)
 * 踢墙偏移格式：[dx, dy]（dx: 水平, dy: 垂直，y 向下为正）
 */

import type { Rotation } from '../config';

/** 踢墙偏移 [dx, dy] */
export type KickOffset = [number, number];

/** 踢墙表：4 种旋转状态 × 5 个测试偏移 */
export type KickTable = Record<Rotation, KickOffset[]>;

/**
 * J/L/S/T/Z 方块踢墙表
 * 来源：https://tetris.wiki/Super_Rotation_System
 */
export const KICKS_JLSTZ: KickTable = {
  // 0 -> R
  0: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  // R -> 0
  1: [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  // R -> 2
  2: [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  // 2 -> L
  3: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
};

/**
 * I 方块踢墙表
 * 来源：https://tetris.wiki/Super_Rotation_System
 */
export const KICKS_I: KickTable = {
  // 0 -> R
  0: [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  // R -> 0
  1: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  // R -> 2
  2: [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  // 2 -> L
  3: [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
};

/**
 * J/L/S/T/Z 方块逆时针旋转踢墙表
 * 来源：https://tetris.wiki/Super_Rotation_System
 * 索引为 fromRotation：0=0→L, 1=R→0, 2=2→R, 3=L→2
 */
export const KICKS_JLSTZ_CCW: KickTable = {
  // 0 -> L
  0: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  // R -> 0
  1: [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  // 2 -> R
  2: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  // L -> 2
  3: [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
};

/**
 * I 方块逆时针旋转踢墙表
 * 来源：https://tetris.wiki/Super_Rotation_System
 * 索引为 fromRotation：0=0→L, 1=R→0, 2=2→R, 3=L→2
 */
export const KICKS_I_CCW: KickTable = {
  // 0 -> L
  0: [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  // R -> 0
  1: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  // 2 -> R
  2: [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  // L -> 2
  3: [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
};

/**
 * 获取顺时针旋转的踢墙表
 */
export function getKicksCW(type: 'I' | 'JLSTZ', fromRotation: Rotation): KickOffset[] {
  const table = type === 'I' ? KICKS_I : KICKS_JLSTZ;
  return table[fromRotation]!;
}

/**
 * 获取逆时针旋转的踢墙表
 */
export function getKicksCCW(type: 'I' | 'JLSTZ', fromRotation: Rotation): KickOffset[] {
  const table = type === 'I' ? KICKS_I_CCW : KICKS_JLSTZ_CCW;
  return table[fromRotation]!;
}
