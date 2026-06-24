/**
 * useGameStore - Zustand 全局状态
 *
 * 桥接 UI 层（React）与游戏层（GameEngine）
 * - GameEngine 通过 actions 通知 UI 状态变化
 * - UI 通过 actions 触发 GameEngine 行为
 * - 持久化 highScore + audioEnabled 到 localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CONFIG, type GamePhase, type Grid, type TetrominoType } from '../config';
import { storage } from '../lib/storage';
import { type GameStats } from '../engine/GameEngine';

interface GameStore {
  // ============ 状态 ============
  phase: GamePhase;
  score: number;
  highScore: number;
  level: number;
  lines: number;
  combo: number;
  holdType: TetrominoType | null;
  nextQueue: TetrominoType[];
  isNewRecord: boolean;
  audioEnabled: boolean;
  /** B2B（Back-to-Back）是否激活 */
  b2b: boolean;
  /** 游戏统计数据 */
  stats: GameStats;

  /** DAS（延迟自动移动）毫秒数，可运行时调整 */
  dasMs: number;
  /** ARR（自动重复速率）毫秒数，可运行时调整 */
  arrMs: number;
  /** 音量（0-100） */
  volume: number;

  // ============ actions（GameEngine 调用）============
  setPhase: (phase: GamePhase) => void;
  setScore: (score: number, highScore: number) => void;
  setLevel: (level: number) => void;
  setLines: (lines: number) => void;
  setCombo: (combo: number) => void;
  setHold: (type: TetrominoType | null) => void;
  setNext: (queue: TetrominoType[]) => void;
  setNewRecord: (highScore: number) => void;
  setHighScore: (score: number) => void;
  setB2B: (b2b: boolean) => void;
  setStats: (stats: GameStats) => void;

  // ============ actions（UI 调用）============
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  resetRound: () => void;
  setDAS: (ms: number) => void;
  setARR: (ms: number) => void;
  setVolume: (v: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // 初始状态
      phase: 'menu',
      score: 0,
      highScore: storage.get<number>(CONFIG.STORAGE_KEY, 0),
      level: 1,
      lines: 0,
      combo: 0,
      holdType: null,
      nextQueue: [],
      isNewRecord: false,
      audioEnabled: true,
      b2b: false,
      stats: {
        pieces: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        tetrises: 0,
        tSpins: 0,
        tSpinMinis: 0,
        perfectClears: 0,
        maxCombo: 0,
        maxB2B: 0,
        startTime: 0,
        duration: 0,
      },
      dasMs: CONFIG.INPUT.DAS_MS,
      arrMs: CONFIG.INPUT.ARR_MS,
      volume: CONFIG.AUDIO.DEFAULT_VOLUME,

      // GameEngine 回调
      setPhase: (phase) => set({ phase }),
      setScore: (score, highScore) =>
        set(() => ({ score, highScore, isNewRecord: score > 0 && score >= highScore })),
      setLevel: (level) => set({ level }),
      setLines: (lines) => set({ lines }),
      setCombo: (combo) => set({ combo }),
      setHold: (holdType) => set({ holdType }),
      setNext: (nextQueue) => set({ nextQueue }),
      setNewRecord: (highScore) => set({ highScore, isNewRecord: true }),
      setHighScore: (score) => set({ highScore: score, isNewRecord: true }),
      setB2B: (b2b) => set({ b2b }),
      setStats: (stats) => set({ stats }),

      // UI 回调
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      resetRound: () =>
        set({
          score: 0,
          lines: 0,
          combo: 0,
          isNewRecord: false,
          b2b: false,
          stats: {
            pieces: 0,
            singles: 0,
            doubles: 0,
            triples: 0,
            tetrises: 0,
            tSpins: 0,
            tSpinMinis: 0,
            perfectClears: 0,
            maxCombo: 0,
            maxB2B: 0,
            startTime: 0,
            duration: 0,
          },
        }),
      setDAS: (ms) => set({ dasMs: ms }),
      setARR: (ms) => set({ arrMs: ms }),
      setVolume: (v) => set({ volume: v }),
    }),
    {
      name: 'tetris:store',
      // 只持久化 highScore、audioEnabled、dasMs、arrMs、volume
      partialize: (s) => ({
        highScore: s.highScore,
        audioEnabled: s.audioEnabled,
        dasMs: s.dasMs,
        arrMs: s.arrMs,
        volume: s.volume,
      }),
    }
  )
);

/** 初始空网格（用于类型导出） */
export type { Grid };
