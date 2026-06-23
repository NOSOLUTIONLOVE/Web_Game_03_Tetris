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
  /** 一次性事件标记 */
  flashLines: number | null; // 最近消行数
  isTetris: boolean;
  levelUpLevel: number | null; // 最近升级目标

  // ============ actions（GameEngine 调用）============
  setPhase: (phase: GamePhase) => void;
  setScore: (score: number, highScore: number) => void;
  setLevel: (level: number) => void;
  setLines: (lines: number) => void;
  setCombo: (combo: number) => void;
  setHold: (type: TetrominoType | null) => void;
  setNext: (queue: TetrominoType[]) => void;
  setLinesClear: (count: number, isTetris: boolean) => void;
  setLevelUp: (level: number) => void;
  setNewRecord: (highScore: number) => void;

  // ============ actions（UI 调用）============
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  resetRound: () => void;
  clearFlash: () => void;
  clearLevelUp: () => void;
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
      flashLines: null,
      isTetris: false,
      levelUpLevel: null,

      // GameEngine 回调
      setPhase: (phase) => set({ phase }),
      setScore: (score, highScore) =>
        set(() => ({ score, highScore, isNewRecord: score > 0 && score >= highScore })),
      setLevel: (level) => set({ level }),
      setLines: (lines) => set({ lines }),
      setCombo: (combo) => set({ combo }),
      setHold: (holdType) => set({ holdType }),
      setNext: (nextQueue) => set({ nextQueue }),
      setLinesClear: (count, isTetris) => set({ flashLines: count, isTetris }),
      setLevelUp: (level) => set({ levelUpLevel: level }),
      setNewRecord: (highScore) => set({ highScore, isNewRecord: true }),

      // UI 回调
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      resetRound: () =>
        set({
          score: 0,
          lines: 0,
          combo: 0,
          isNewRecord: false,
          flashLines: null,
          isTetris: false,
          levelUpLevel: null,
        }),
      clearFlash: () => set({ flashLines: null, isTetris: false }),
      clearLevelUp: () => set({ levelUpLevel: null }),
    }),
    {
      name: 'tetris:store',
      // 只持久化 highScore 和 audioEnabled
      partialize: (s) => ({
        highScore: s.highScore,
        audioEnabled: s.audioEnabled,
      }),
    }
  )
);

/** 初始空网格（用于类型导出） */
export type { Grid };
