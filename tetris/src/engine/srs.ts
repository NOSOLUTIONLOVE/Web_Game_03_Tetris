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

/** 反向踢墙表（用于逆时针旋转） */
function reverseKickTable(table: KickTable): KickTable {
  // 0->R 是 R->0 的反向，1->L 是 3->R 的反向
  return {
    0: table[1]!,
    1: table[3]!,
    2: table[1]!,
    3: table[3]!,
  };
}

/**
 * 获取顺时针旋转的踢墙表
 */
export function getKicksCW(type: 'I' | 'JLSTZ', fromRotation: Rotation): KickOffset[] {
  const table = type === 'I' ? KICKS_I : KICKS_JLSTZ;
  return table[fromRotation]!;
}

/**
 * 获取逆时针旋转的踢墙表
 * 逆时针 R->0 对应顺时针 0->R 的反向
 */
export function getKicksCCW(type: 'I' | 'JLSTZ', fromRotation: Rotation): KickOffset[] {
  const table = type === 'I' ? KICKS_I : KICKS_JLSTZ;
  const reversed = reverseKickTable(table);
  return reversed[fromRotation]!;
}
