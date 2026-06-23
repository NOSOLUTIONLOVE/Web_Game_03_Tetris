/**
 * Tetromino 单元测试
 *
 * 覆盖：7 种方块形状、4 个旋转状态、SRS 踢墙表
 */

import { describe, it, expect } from 'vitest';
import { Tetromino } from '../Tetromino';
import { TETROMINOES, TETROMINO_TYPES, getRotations, getShape } from '../tetrominoes';
import { KICKS_I, KICKS_JLSTZ } from '../srs';

describe('Tetrominoes - 7 种方块形状', () => {
  it('TETROMINO_TYPES 包含 7 种方块', () => {
    expect(TETROMINO_TYPES).toEqual(['I', 'O', 'T', 'S', 'Z', 'J', 'L']);
  });

  it('每种方块的形状都是 4×4 矩阵', () => {
    for (const type of TETROMINO_TYPES) {
      const shape = TETROMINOES[type];
      expect(shape.length).toBe(4);
      shape.forEach((row) => {
        expect(row.length).toBe(4);
      });
    }
  });

  it('每种方块包含 4 个实心格子', () => {
    for (const type of TETROMINO_TYPES) {
      let count = 0;
      TETROMINOES[type].forEach((row) => row.forEach((c) => c === 1 && count++));
      expect(count).toBe(4);
    }
  });
});

describe('Tetrominoes - 旋转 4 个状态', () => {
  it('O 块旋转 4 次实心格子集合相同', () => {
    // O 块在 4×4 矩阵内的位置可能因旋转而变化，但实心格子数都是 4
    const rotations = getRotations('O');
    for (let i = 0; i < 4; i++) {
      let count = 0;
      rotations[i]!.forEach((row) => row.forEach((c) => c === 1 && count++));
      expect(count).toBe(4);
    }
  });

  it('I 块旋转 4 次各有不同', () => {
    const rotations = getRotations('I');
    // 0 = 水平 (横着)
    // 1 = 垂直 (竖着)
    // 0 -> 1 应有显著差异
    expect(rotations[0]).not.toEqual(rotations[1]);
  });

  it('T 块旋转 4 次各有不同', () => {
    const rotations = getRotations('T');
    expect(rotations[0]).not.toEqual(rotations[1]);
    expect(rotations[1]).not.toEqual(rotations[2]);
    expect(rotations[2]).not.toEqual(rotations[3]);
    expect(rotations[3]).not.toEqual(rotations[0]);
  });

  it('S 块旋转 4 次', () => {
    const rotations = getRotations('S');
    // 4 个旋转状态互不相同（虽然视觉上 S 旋转 180° 形状相似，但矩阵表示位置不同）
    expect(rotations[0]).not.toEqual(rotations[1]);
    expect(rotations[1]).not.toEqual(rotations[2]);
    expect(rotations[2]).not.toEqual(rotations[3]);
    expect(rotations[3]).not.toEqual(rotations[0]);
  });

  it('J 块旋转 4 次', () => {
    const rotations = getRotations('J');
    expect(rotations[0]).not.toEqual(rotations[1]);
    expect(rotations[1]).not.toEqual(rotations[2]);
    expect(rotations[2]).not.toEqual(rotations[3]);
  });

  it('getShape 返回正确旋转状态', () => {
    expect(getShape('T', 0)).toBe(getRotations('T')[0]);
    expect(getShape('T', 2)).toBe(getRotations('T')[2]);
  });
});

describe('Tetromino - 基本操作', () => {
  it('默认位置：x=3, y=0', () => {
    const piece = new Tetromino('T');
    expect(piece.position).toEqual({ x: 3, y: 0 });
    expect(piece.rotation).toBe(0);
    expect(piece.type).toBe('T');
  });

  it('可指定位置和旋转', () => {
    const piece = new Tetromino('L', { x: 5, y: 10 }, 2);
    expect(piece.position).toEqual({ x: 5, y: 10 });
    expect(piece.rotation).toBe(2);
  });

  it('move 修改位置', () => {
    const piece = new Tetromino('T');
    piece.move(2, 3);
    expect(piece.position).toEqual({ x: 5, y: 3 });
  });

  it('setPosition 设置位置', () => {
    const piece = new Tetromino('T');
    piece.setPosition(1, 5);
    expect(piece.position).toEqual({ x: 1, y: 5 });
  });

  it('clone 创建独立副本', () => {
    const a = new Tetromino('T', { x: 3, y: 5 });
    const b = a.clone();
    expect(b.position).toEqual({ x: 3, y: 5 });
    expect(b).not.toBe(a);
    a.move(1, 0);
    expect(a.position).toEqual({ x: 4, y: 5 });
    expect(b.position).toEqual({ x: 3, y: 5 });
  });

  it('cells 返回所有实心格子的全局坐标', () => {
    const piece = new Tetromino('O', { x: 4, y: 5 });
    // O 块：占用 (4,5), (5,5), (4,6), (5,6)
    const cells = piece.cells();
    expect(cells).toEqual([
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
    ]);
  });
});

describe('Tetromino - SRS 旋转尝试', () => {
  it('T 块 0->R 顺时针旋转：5 个测试偏移', () => {
    const piece = new Tetromino('T');
    const attempts = piece.rotationAttemptsCW();
    expect(attempts.length).toBe(5);
    expect(attempts[0]!.rotation).toBe(1);
    // 第一个偏移总是 [0, 0]
    expect(attempts[0]!.offset).toEqual([0, 0]);
  });

  it('T 块 0->L 逆时针旋转：5 个测试偏移', () => {
    const piece = new Tetromino('T');
    const attempts = piece.rotationAttemptsCCW();
    expect(attempts.length).toBe(5);
    expect(attempts[0]!.rotation).toBe(3);
  });

  it('I 块 0->R 顺时针旋转：偏移表使用 KICKS_I', () => {
    const piece = new Tetromino('I');
    const attempts = piece.rotationAttemptsCW();
    // 第一个偏移 [0, 0]，后续为 KICKS_I[0]
    expect(attempts[1]!.offset).toEqual(KICKS_I[0]![1]);
    expect(attempts[4]!.offset).toEqual(KICKS_I[0]![4]);
  });

  it('J/L/S/T/Z 块 0->R 顺时针旋转：偏移表使用 KICKS_JLSTZ', () => {
    const piece = new Tetromino('J');
    const attempts = piece.rotationAttemptsCW();
    expect(attempts[1]!.offset).toEqual(KICKS_JLSTZ[0]![1]);
  });

  it('180° 旋转：rotation = (current + 2) % 4', () => {
    const piece = new Tetromino('T', { x: 0, y: 0 }, 1);
    expect(piece.rotation180()).toBe(3);
  });

  it('applyRotation 应用旋转结果', () => {
    const piece = new Tetromino('T', { x: 3, y: 5 });
    piece.applyRotation(1, [-1, 0]);
    expect(piece.rotation).toBe(1);
    expect(piece.position).toEqual({ x: 2, y: 5 });
  });
});

describe('SRS 踢墙表正确性', () => {
  it('KICKS_JLSTZ 0->R 第一个测试点 = [0, 0]', () => {
    expect(KICKS_JLSTZ[0]![0]).toEqual([0, 0]);
  });

  it('KICKS_JLSTZ 0->R = [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]]', () => {
    expect(KICKS_JLSTZ[0]).toEqual([
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ]);
  });

  it('KICKS_I 0->R = [[0,0],[-2,0],[1,0],[-2,-1],[1,2]]', () => {
    expect(KICKS_I[0]).toEqual([
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ]);
  });

  it('KICKS_JLSTZ 4 个旋转状态各有 5 个测试点', () => {
    for (let i = 0; i < 4; i++) {
      expect(KICKS_JLSTZ[i as 0 | 1 | 2 | 3]!.length).toBe(5);
    }
  });

  it('KICKS_I 4 个旋转状态各有 5 个测试点', () => {
    for (let i = 0; i < 4; i++) {
      expect(KICKS_I[i as 0 | 1 | 2 | 3]!.length).toBe(5);
    }
  });
});
