/**
 * Tetris Web - 全局配置（v2.0）
 *
 * 所有可调参数集中在此处，单一数据源原则
 * 含 Zod schema 用于运行时校验
 */

import { z } from 'zod';

/**
 * Zod schema - 用于校验配置
 */
export const gameConfigSchema = z.object({
  grid: z.object({
    cols: z.number().int().positive(),
    rows: z.number().int().positive(),
    cellSize: z.number().int().positive(),
  }),
  canvas: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  speed: z.object({
    initialMs: z.number().positive(),
    minMs: z.number().positive(),
    accel: z.number().positive(),
    linesPerLevel: z.number().int().positive(),
  }),
  score: z.object({
    single: z.number().int().positive(),
    double: z.number().int().positive(),
    triple: z.number().int().positive(),
    tetris: z.number().int().positive(),
    softDrop: z.number().int().positive(),
    hardDrop: z.number().int().positive(),
    comboBonus: z.number().int().nonnegative(),
  }),
  audio: z.object({
    enabled: z.boolean(),
  }),
});

export type GameConfig = z.infer<typeof gameConfigSchema>;

/**
 * 游戏阶段（替代旧 GameState 枚举）
 */
export type GamePhase = 'menu' | 'playing' | 'paused' | 'over';

/**
 * 方块类型（7 种 Tetromino）
 */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/**
 * 旋转状态（0-3，0 = 初始状态）
 */
export type Rotation = 0 | 1 | 2 | 3;

/**
 * 坐标点
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 网格：二维数组，null 表示空，否则为已锁定的方块类型
 */
export type GridCell = TetrominoType | null;
export type Grid = GridCell[][];

/**
 * 配置常量
 *
 * 网格尺寸：10×20（标准 SRS）
 * 单元格：30×30 px
 * 主网格：300×600 px
 * Hold/Next 区域：4×4 = 120×120 px
 */
export const CONFIG = {
  GRID: {
    COLS: 10,
    ROWS: 20,
    /** 缓冲区行（顶部不可见区域，用于方块生成） */
    BUFFER_ROWS: 2,
    CELL_SIZE: 30,
  },

  CANVAS: {
    /** 主网格宽（含 padding） */
    PLAYFIELD_WIDTH: 10 * 30, // 300
    /** 主网格高（含 padding） */
    PLAYFIELD_HEIGHT: 20 * 30, // 600
    /** Hold/Next 区域宽（4×4 + padding） */
    PANEL_WIDTH: 4 * 30 + 16, // 136
    /** Hold/Next 区域高（4×4 + padding） */
    PANEL_HEIGHT: 4 * 30 + 16, // 136
    /** 三区域间距 */
    GAP: 16,
    /** 区域内边距 */
    PADDING: 8,
  },

  /**
   * 速度曲线（Tetris Guideline 参考）
   * 下落间隔（ms / 行）
   * Level 1 = 1000ms, Level 20+ = 16ms
   */
  SPEED: {
    INITIAL_MS: 1000,
    MIN_MS: 16,
    /** 每升一级减少的百分比 */
    ACCEL: 0.85,
    /** 升级所需行数 */
    LINES_PER_LEVEL: 10,
  },

  /**
   * 计分（NES 经典风格）
   * 基础分 × 当前等级
   */
  SCORE: {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2,
    COMBO_BONUS: 50,
  },

  /**
   * 颜色（经典 SRS 配色）
   */
  COLORS: {
    BG: '#000814',
    GRID_LINE: '#1a2332',
    PANEL_BG: 'rgba(255, 255, 255, 0.04)',
    PANEL_BORDER: 'rgba(255, 255, 255, 0.08)',
    TEXT: '#e5e7eb',
    TEXT_DIM: '#9ca3af',
    /** 7 种方块颜色 */
    I: '#00f0f0', // 青
    O: '#f0f000', // 黄
    T: '#a000f0', // 紫
    S: '#00f000', // 绿
    Z: '#f00000', // 红
    J: '#0000f0', // 蓝
    L: '#f0a000', // 橙
    GHOST: 'rgba(255, 255, 255, 0.18)',
  },

  /** Next 预览数量 */
  NEXT_COUNT: 3,

  /** 方块出生位置（水平居中，顶部缓冲区） */
  SPAWN: {
    X: 3,
    Y: 0,
  },

  /** 输入系统：DAS（延迟自动移动）/ ARR（自动重复速率） */
  INPUT: {
    /** 按住方向键后开始自动重复的延迟（ms） */
    DAS_MS: 167,
    /** 自动重复间隔（ms） */
    ARR_MS: 33,
  },

  /** 锁定延迟：方块落地后给予的操作缓冲时间 */
  LOCK_DELAY: {
    /** 锁定延迟时长（ms） */
    DELAY_MS: 500,
    /** 最大重置次数（防止无限延迟） */
    RESET_MAX: 15,
  },

  /** 触屏滑动阈值 */
  TOUCH: {
    THRESHOLD: 30,
  },

  STORAGE_KEY: 'tetris:best_score',
} as const;
