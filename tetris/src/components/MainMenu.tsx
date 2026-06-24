/**
 * MainMenu - 主菜单遮罩
 *
 * 显示：标题 + 开始按钮 + 操作说明（触屏/键盘自适应）
 * 覆盖在 Canvas 上层，不使用 Dialog 以避免键盘事件被吞
 */

import { motion } from 'framer-motion';
import { Play, Trophy } from 'lucide-react';
import { useEngine } from './TetrisGame';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/button';

/** 检测是否为触屏设备 */
const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

export function MainMenu() {
  const engine = useEngine();
  const highScore = useGameStore((s) => s.highScore);

  const handleStart = () => {
    engine.startGame();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="主菜单"
      className="absolute inset-0 flex items-center justify-center z-10 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-xl" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center space-y-1">
          <h2 className="text-5xl font-extrabold tracking-widest text-primary text-glow">
            TETRIS
          </h2>
          <p className="text-sm text-muted-foreground">经典俄罗斯方块 · v2.0</p>
        </div>

        {highScore > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-accent" />
            <span>最高分：</span>
            <span className="font-mono font-bold text-accent">{highScore}</span>
          </div>
        )}

        <Button size="lg" onClick={handleStart} className="min-w-[180px]">
          <Play className="h-4 w-4 mr-2" />
          开始游戏
        </Button>

        {/* 操作说明：触屏设备显示虚拟按键，桌面显示键盘 */}
        {isTouchDevice ? (
          <div className="text-center space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <Kbd>◀</Kbd>
              <Kbd>▶</Kbd>
              <span>移动</span>
              <Kbd>▼</Kbd>
              <span>软降</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <Kbd>↻</Kbd>
              <span>旋转</span>
              <Kbd>HOLD</Kbd>
              <span>暂存</span>
              <Kbd>⤓</Kbd>
              <span>硬降</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <Kbd>← →</Kbd>
              <span>移动</span>
              <Kbd>↑</Kbd>
              <span>旋转</span>
              <Kbd>↓</Kbd>
              <span>软降</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <Kbd>Space</Kbd>
              <span>硬降</span>
              <Kbd>C</Kbd>
              <span>Hold</span>
              <Kbd>P</Kbd>
              <span>暂停</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Kbd>Enter</Kbd>
              <span>开始 / 继续</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{children}</kbd>
  );
}
