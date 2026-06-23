/**
 * Bag 单元测试
 *
 * 覆盖：7-bag 随机性 / 7 个不重复 / 偷看 / 重置
 */

import { describe, it, expect } from 'vitest';
import { Bag } from '../Bag';
import { TETROMINO_TYPES } from '../tetrominoes';

describe('Bag - 7-bag 随机生成', () => {
  it('take(7) 返回 7 个不同的方块', () => {
    const bag = new Bag();
    const result = bag.take(7);
    expect(result.length).toBe(7);
    expect(new Set(result).size).toBe(7); // 全部唯一
  });

  it('take(7) 包含所有 7 种方块', () => {
    const bag = new Bag();
    const result = bag.take(7);
    for (const type of TETROMINO_TYPES) {
      expect(result).toContain(type);
    }
  });

  it('连续 take(7) 两次，每次 7 个都唯一', () => {
    const bag = new Bag();
    const r1 = bag.take(7);
    const r2 = bag.take(7);
    expect(new Set(r1).size).toBe(7);
    expect(new Set(r2).size).toBe(7);
  });

  it('连续 14 个方块中每种至少出现 2 次', () => {
    const bag = new Bag();
    const result = bag.take(14);
    const counts = new Map<string, number>();
    result.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
    for (const type of TETROMINO_TYPES) {
      expect(counts.get(type)).toBe(2);
    }
  });
});

describe('Bag - peek', () => {
  it('peek(3) 不消耗队列', () => {
    const bag = new Bag();
    const peeked = bag.peek(3);
    expect(peeked.length).toBe(3);
    const taken = bag.take(3);
    expect(taken).toEqual(peeked);
  });

  it('peek 跨越多个 bag', () => {
    const bag = new Bag();
    const peeked = bag.peek(14);
    expect(peeked.length).toBe(14);
    // 应该是 7 + 7 = 14 个，覆盖两个 bag
  });
});

describe('Bag - next', () => {
  it('next() 返回单个方块', () => {
    const bag = new Bag();
    const t = bag.next();
    expect(TETROMINO_TYPES).toContain(t);
  });
});

describe('Bag - reset', () => {
  it('reset 后可继续生成', () => {
    const bag = new Bag();
    bag.take(5);
    bag.reset();
    const result = bag.take(7);
    expect(new Set(result).size).toBe(7);
  });
});

describe('Bag - 固定 RNG 测试', () => {
  it('固定种子产生可预测序列', () => {
    // 简单的 LCG 用于测试；每个 bag 独立 RNG 闭包，避免共享 seed 污染
    const makeRng = (initial: number) => {
      let seed = initial;
      return () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
    };
    const bag1 = new Bag(makeRng(42));
    const bag2 = new Bag(makeRng(42));
    const seq1 = bag1.take(7);
    const seq2 = bag2.take(7);
    expect(seq1).toEqual(seq2);
  });
});
