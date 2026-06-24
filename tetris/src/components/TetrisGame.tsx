/**
 * TetrisGame - Canvas 挂载点 + GameEngine 生命周期
 *
 * 职责：
 * - 实例化 GameEngine（useEffect 内）
 * - 把 engine 的回调转发到 Zustand store
 * - 同步 audioEnabled 到 engine
 * - 用 Context 暴露 engine 给子组件
 * - 渲染 Canvas + HUD + Overlays
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../store/useGameStore';
import { HUD } from './HUD';
import { Overlays } from './Overlays';
import { MobileControls } from './MobileControls';

const EngineContext = createContext<GameEngine | null>(null);

/** 子组件中获取 engine 实例（必须在 TetrisGame 内使用） */
export function useEngine(): GameEngine {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error('useEngine must be used within TetrisGame');
  }
  return engine;
}

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);

  // 实例化引擎
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const e = new GameEngine({
      canvas,
      initialHighScore: useGameStore.getState().highScore,
      initialVolume: useGameStore.getState().volume,
      callbacks: {
        onPhaseChange: (p) => {
          useGameStore.getState().setPhase(p);
          if (p === 'playing') {
            useGameStore.getState().resetRound();
          }
        },
        onStateChange: (snapshot) => {
          // 批量更新：单次 setState 合并所有字段，避免多次独立 set 触发多余 re-render
          useGameStore.setState({
            score: snapshot.score,
            highScore: snapshot.highScore,
            level: snapshot.level,
            lines: snapshot.lines,
            combo: snapshot.combo,
            holdType: snapshot.holdType,
            nextQueue: snapshot.nextQueue,
            b2b: snapshot.b2b,
            stats: snapshot.stats,
            isNewRecord: snapshot.isNewRecord,
          });
        },
        onLinesClear: () => {
          // 音效由引擎内部播放（audio.playClear）；store 闪光状态已移除
        },
        onLevelUp: () => {
          // 音效由引擎内部播放（audio.playLevelUp）；store 升级状态已移除
        },
        onGameOver: (_score, isNewRecord) => {
          if (isNewRecord) {
            useGameStore.getState().setHighScore(_score);
          }
        },
      },
    });
    setEngine(e);
    e.start();

    return () => {
      e.stop();
      setEngine(null);
    };
  }, []);

  // 同步 audioEnabled 到 engine
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  useEffect(() => {
    if (engine) {
      engine.getAudio().setEnabled(audioEnabled);
    }
  }, [audioEnabled, engine]);

  // 同步持久化的 DAS/ARR 到 engine（页面加载时应用用户配置）
  const dasMs = useGameStore((s) => s.dasMs);
  const arrMs = useGameStore((s) => s.arrMs);
  useEffect(() => {
    if (engine) {
      engine.getInput().setDAS(dasMs);
    }
  }, [dasMs, engine]);
  useEffect(() => {
    if (engine) {
      engine.getInput().setARR(arrMs);
    }
  }, [arrMs, engine]);

  const phase = useGameStore((s) => s.phase);

  // canvas 无障碍标签：根据游戏阶段 + 分数 + 等级动态生成
  const canvasAriaLabel = useGameStore((s) => {
    const phaseText: Record<string, string> = {
      menu: '主菜单',
      playing: '游戏中',
      paused: '已暂停',
      over: '游戏结束',
    };
    return `俄罗斯方块游戏区域，${phaseText[s.phase] ?? s.phase}，当前得分 ${s.score}，等级 ${s.level}`;
  });

  return (
    <EngineContext.Provider value={engine}>
      <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
        <HUD />
        <div className="relative mx-auto inline-block max-w-full">
          <canvas
            ref={canvasRef}
            aria-label={canvasAriaLabel}
            className="rounded-xl ring-1 ring-white/10 shadow-2xl shadow-purple-500/20 touch-none max-w-full !h-auto"
          />
          {engine && (phase === 'menu' || phase === 'paused') && (
            <div className="absolute inset-0 pointer-events-auto">
              <Overlays />
            </div>
          )}
        </div>
        <MobileControls />
        {engine && (phase === 'over') && <Overlays />}
      </div>
    </EngineContext.Provider>
  );
}
