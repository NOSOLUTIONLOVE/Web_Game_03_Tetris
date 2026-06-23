/**
 * GameOverModal - 游戏结束弹窗
 *
 * 显示：最终分数 + 是否破纪录 + 重玩/菜单按钮
 */

import { motion } from 'framer-motion';
import { RotateCcw, Home, Trophy } from 'lucide-react';
import { useEngine } from './TetrisGame';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function GameOverModal() {
  const engine = useEngine();
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const lines = useGameStore((s) => s.lines);
  const level = useGameStore((s) => s.level);
  const isNewRecord = useGameStore((s) => s.isNewRecord);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 p-6 rounded-xl border border-white/10 bg-card shadow-2xl shadow-black/50 backdrop-blur-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-widest text-destructive text-glow">
            GAME OVER
          </h2>
          {isNewRecord && (
            <Badge variant="success" className="text-base px-3 py-1 animate-scale-in">
              <Trophy className="h-3 w-3 mr-1" />
              NEW RECORD!
            </Badge>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="SCORE" value={score} accent="text-foreground" />
          <Stat label="BEST" value={highScore} accent="text-accent" />
          <Stat label="LINES" value={lines} accent="text-muted-foreground" />
          <Stat label="LEVEL" value={level} accent="text-muted-foreground" />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={() => engine.startGame()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            再玩一次
          </Button>
          <Button variant="outline" size="lg" onClick={() => engine.backToMenu()}>
            <Home className="h-4 w-4 mr-2" />
            返回菜单
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="text-center px-3 py-2 rounded-lg bg-secondary/60">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}
