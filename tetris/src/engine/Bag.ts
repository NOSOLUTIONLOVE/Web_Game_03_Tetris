/**
 * Bag - 7-bag 随机方块生成器
 *
 * 经典 Tetris Guideline 算法：
 * - 每次从 7 种方块中随机打乱顺序
 * - 保证每 7 个方块内所有 7 种都恰好出现一次
 * - 比纯随机更可控、更可预测
 *
 * 用法：
 *   const bag = new Bag();
 *   const next = bag.take(5);  // 取接下来 5 个
 */

import { type TetrominoType } from '../config';
import { TETROMINO_TYPES } from './tetrominoes';

export class Bag {
  private current: TetrominoType[];
  private rng: () => number;

  /** 自定义 RNG（用于测试时注入固定种子） */
  constructor(rng?: () => number) {
    this.rng = rng ?? Math.random;
    this.current = this.shuffle();
  }

  /**
   * 取出接下来 n 个方块（同时补足 bag）
   */
  take(n: number): TetrominoType[] {
    const result: TetrominoType[] = [];
    for (let i = 0; i < n; i++) {
      if (this.current.length === 0) {
        this.current = this.shuffle();
      }
      result.push(this.current.shift()!);
    }
    return result;
  }

  /**
   * 偷看接下来 n 个方块（不消耗）
   */
  peek(n: number): TetrominoType[] {
    const result: TetrominoType[] = [];
    let lookAheadBag = [...this.current];
    for (let i = 0; i < n; i++) {
      if (lookAheadBag.length === 0) {
        lookAheadBag = this.shuffle();
      }
      result.push(lookAheadBag[0]!);
      lookAheadBag = lookAheadBag.slice(1);
    }
    return result;
  }

  /**
   * 取下一个方块（单个）
   */
  next(): TetrominoType {
    return this.take(1)[0]!;
  }

  /**
   * Fisher-Yates 洗牌算法
   */
  private shuffle(): TetrominoType[] {
    const arr = [...TETROMINO_TYPES];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  }

  /**
   * 重置（重新洗牌）
   */
  reset(): void {
    this.current = this.shuffle();
  }
}
