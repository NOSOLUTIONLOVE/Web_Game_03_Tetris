/**
 * ScoringSystem - 计分系统
 *
 * 职责：
 * - 处理所有消行计分逻辑（单/双/三/Tetris）
 * - T-Spin 计分（full / mini）
 * - B2B（Back-to-Back）连击奖励
 * - Combo 连击奖励
 * - Perfect Clear 全清奖励
 *
 * 设计：
 * - 内部维护 B2B 状态
 * - 每次调用 calculate() 返回得分结果并更新 B2B
 */

import { CONFIG } from '../config';

export type LineClearType = 'single' | 'double' | 'triple' | 'tetris';
export type TSpinType = 'none' | 'mini' | 'full';

export interface ScoreInput {
  /** 消除行数 */
  lineCount: number;
  /** 当前等级 */
  level: number;
  /** 当前连击数（≥0） */
  combo: number;
  /** T-Spin 类型 */
  isTSpin: TSpinType;
  /** 是否 Perfect Clear */
  isPerfectClear: boolean;
}

export interface ScoreResult {
  /** 本次得分 */
  points: number;
  /** B2B 链是否继续/开始 */
  newB2B: boolean;
  /** 本次是否享受 B2B 加成 */
  isB2B: boolean;
}

export class ScoringSystem {
  /** B2B 是否激活（上一次为 Tetris 或 T-Spin 消行） */
  private b2bActive = false;

  /** 重置 B2B 状态 */
  reset(): void {
    this.b2bActive = false;
  }

  calculate(input: ScoreInput): ScoreResult {
    const { lineCount, level, combo, isTSpin, isPerfectClear } = input;

    // 无消行且无 T-Spin → 0 分
    if (lineCount === 0 && isTSpin === 'none') {
      return { points: 0, newB2B: this.b2bActive, isB2B: false };
    }

    // 判断是否为"硬消行"（Tetris 或 T-Spin 带行）
    const isTetris = lineCount >= 4;
    const isTSpinWithLines = isTSpin !== 'none' && lineCount > 0;
    const isHardClear = isTetris || isTSpinWithLines;

    // 基础分
    let baseScore = 0;
    const lineTypes = [
      0,
      CONFIG.SCORE.SINGLE,
      CONFIG.SCORE.DOUBLE,
      CONFIG.SCORE.TRIPLE,
      CONFIG.SCORE.TETRIS,
    ];

    // T-Spin / Perfect Clear 分数表（索引对应消行数）
    const tspinScores = [
      0,
      CONFIG.SCORE.TSPIN_SINGLE,
      CONFIG.SCORE.TSPIN_DOUBLE,
      CONFIG.SCORE.TSPIN_TRIPLE,
    ];
    const tspinMiniScores = [
      0,
      CONFIG.SCORE.TSPIN_MINI_SINGLE,
      CONFIG.SCORE.TSPIN_MINI_DOUBLE,
      CONFIG.SCORE.TSPIN_MINI_TRIPLE,
    ];
    const pcScores = [
      0,
      CONFIG.SCORE.PC_SINGLE,
      CONFIG.SCORE.PC_DOUBLE,
      CONFIG.SCORE.PC_TRIPLE,
      CONFIG.SCORE.PC_TETRIS,
    ];

    if (isTSpin === 'full') {
      // T-Spin Full 计分（按消行数）
      baseScore = (tspinScores[lineCount] ?? 0) * level;
      if (lineCount === 0) baseScore = 400 * level; // T-Spin 无消行
    } else if (isTSpin === 'mini') {
      // T-Spin Mini 计分
      baseScore = (tspinMiniScores[lineCount] ?? 0) * level;
      if (lineCount === 0) baseScore = 100 * level; // T-Spin Mini 无消行
    } else {
      // 普通消行计分
      baseScore = (lineTypes[lineCount] ?? 0) * level;
    }

    // B2B 加成
    let isB2B = false;
    if (isHardClear && this.b2bActive) {
      baseScore = Math.floor(baseScore * 1.5);
      isB2B = true;
    }

    // Combo 连击奖励
    let comboBonus = 0;
    if (combo > 0 && lineCount > 0) {
      comboBonus = CONFIG.SCORE.COMBO_BONUS * combo;
    }

    // Perfect Clear 奖励
    let pcBonus = 0;
    if (isPerfectClear && lineCount > 0) {
      pcBonus = (pcScores[lineCount] ?? 0) * level;
    }

    const points = baseScore + comboBonus + pcBonus;

    // 更新 B2B 状态：硬消行保持/启动 B2B，否则中断
    this.b2bActive = isHardClear;

    return { points, newB2B: this.b2bActive, isB2B };
  }
}
