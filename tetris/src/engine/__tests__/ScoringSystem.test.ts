/**
 * ScoringSystem 单元测试
 *
 * 覆盖：NES 基础计分 / Combo 连击 / T-Spin / Back-to-Back / Perfect Clear / reset
 *
 * 设计要点：
 * - ScoringSystem 内部维护 B2B 状态，通过连续调用 calculate() 测试 B2B 链
 * - ScoreInput.b2bActive 字段为信息性参数，calculate 内部使用 this.b2bActive
 * - 每次 calculate() 调用会更新内部 B2B 状态
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringSystem } from '../ScoringSystem';
import { CONFIG } from '../../config';

describe('ScoringSystem - NES 基础计分', () => {
  let scoring: ScoringSystem;

  beforeEach(() => {
    scoring = new ScoringSystem();
  });

  it('Single（1 行）level 1 = 100', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.SINGLE);
  });

  it('Double（2 行）level 1 = 300', () => {
    const result = scoring.calculate({
      lineCount: 2,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.DOUBLE);
  });

  it('Triple（3 行）level 1 = 500', () => {
    const result = scoring.calculate({
      lineCount: 3,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.TRIPLE);
  });

  it('Tetris（4 行）level 1 = 800', () => {
    const result = scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.TETRIS);
  });

  it('Single level 5 = 500（100 × 5）', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 5,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.SINGLE * 5);
  });

  it('Tetris level 10 = 8000（800 × 10）', () => {
    const result = scoring.calculate({
      lineCount: 4,
      level: 10,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.TETRIS * 10);
  });
});

describe('ScoringSystem - Combo 连击', () => {
  let scoring: ScoringSystem;

  beforeEach(() => {
    scoring = new ScoringSystem();
  });

  it('combo=1，1 行，level 1 = 100 + 50 = 150', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 1,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.SINGLE + CONFIG.SCORE.COMBO_BONUS * 1);
  });

  it('combo=3，1 行，level 1 = 100 + 150 = 250', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 3,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.SINGLE + CONFIG.SCORE.COMBO_BONUS * 3);
  });

  it('combo=0 → 无连击奖励', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.SINGLE);
  });

  it('combo>0 但 lineCount=0 → 无连击奖励', () => {
    const result = scoring.calculate({
      lineCount: 0,
      level: 1,
      combo: 2,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    // 无消行且无 T-Spin → 0 分
    expect(result.points).toBe(0);
  });
});

describe('ScoringSystem - T-Spin 计分', () => {
  let scoring: ScoringSystem;

  beforeEach(() => {
    scoring = new ScoringSystem();
  });

  it('T-Spin full，0 行，level 1 = 400', () => {
    const result = scoring.calculate({
      lineCount: 0,
      level: 1,
      combo: 0,
      isTSpin: 'full',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(400);
  });

  it('T-Spin full，1 行，level 1 = 800', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 0,
      isTSpin: 'full',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(800);
  });

  it('T-Spin full，2 行，level 1 = 1200', () => {
    const result = scoring.calculate({
      lineCount: 2,
      level: 1,
      combo: 0,
      isTSpin: 'full',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(1200);
  });

  it('T-Spin mini，0 行，level 1 = 100', () => {
    const result = scoring.calculate({
      lineCount: 0,
      level: 1,
      combo: 0,
      isTSpin: 'mini',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(100);
  });

  it('T-Spin mini，1 行，level 1 = 200', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 0,
      isTSpin: 'mini',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(200);
  });
});

describe('ScoringSystem - Back-to-Back', () => {
  let scoring: ScoringSystem;

  beforeEach(() => {
    scoring = new ScoringSystem();
  });

  it('首次 Tetris：无 B2B 加成（isB2B=false），newB2B=true', () => {
    const result = scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.TETRIS);
    expect(result.isB2B).toBe(false);
    expect(result.newB2B).toBe(true);
  });

  it('连续第二次 Tetris：B2B 加成 ×1.5（800×1.5=1200），isB2B=true', () => {
    // 第一次 Tetris：建立 B2B 链
    scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    // 第二次 Tetris：享受 B2B 加成
    const result = scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(Math.floor(CONFIG.SCORE.TETRIS * 1.5));
    expect(result.isB2B).toBe(true);
    expect(result.newB2B).toBe(true);
  });

  it('Tetris 后接 Single：无 B2B 加成，newB2B=false（链中断）', () => {
    // 先 Tetris 建立 B2B 链
    scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    // 再 Single：中断 B2B 链
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.SINGLE);
    expect(result.isB2B).toBe(false);
    expect(result.newB2B).toBe(false);
  });

  it('Tetris 后接 T-Spin（带行）：B2B 加成生效', () => {
    // 先 Tetris 建立 B2B 链
    scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    // 再 T-Spin full 1 行：享受 B2B 加成
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 0,
      isTSpin: 'full',
      isPerfectClear: false,
      b2bActive: false,
    });
    // T-Spin full 1 行基础分 800，B2B ×1.5 = 1200
    expect(result.points).toBe(Math.floor(800 * 1.5));
    expect(result.isB2B).toBe(true);
  });
});

describe('ScoringSystem - Perfect Clear', () => {
  let scoring: ScoringSystem;

  beforeEach(() => {
    scoring = new ScoringSystem();
  });

  it('PC 1 行，level 1 = 100 + 800 = 900', () => {
    const result = scoring.calculate({
      lineCount: 1,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: true,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.SINGLE + 800);
  });

  it('PC 4 行，level 1 = 800 + 2000 = 2800', () => {
    const result = scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: true,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.TETRIS + 2000);
  });

  it('PC 0 行 → 无 PC 奖励（0 分）', () => {
    const result = scoring.calculate({
      lineCount: 0,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: true,
      b2bActive: false,
    });
    // lineCount=0 且无 T-Spin → 0 分
    expect(result.points).toBe(0);
  });
});

describe('ScoringSystem - reset()', () => {
  it('reset 后 B2B 链中断', () => {
    const scoring = new ScoringSystem();
    // 先 Tetris 建立 B2B 链
    scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    // reset 清除 B2B 状态
    scoring.reset();
    // 再 Tetris：不应享受 B2B 加成
    const result = scoring.calculate({
      lineCount: 4,
      level: 1,
      combo: 0,
      isTSpin: 'none',
      isPerfectClear: false,
      b2bActive: false,
    });
    expect(result.points).toBe(CONFIG.SCORE.TETRIS);
    expect(result.isB2B).toBe(false);
  });
});
