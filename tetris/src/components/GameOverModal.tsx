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
  const stats = useGameStore((s) => s.stats);

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

        {/* 详细统计 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="PIECES" value={stats.pieces} accent="text-muted-foreground" small />
          <Stat label="T-SPIN" value={stats.tSpins} accent="text-purple-400" small />
          <Stat label="MINI" value={stats.tSpinMinis} accent="text-purple-300" small />
          <Stat label="TETRIS" value={stats.tetrises} accent="text-cyan-400" small />
          <Stat label="TRIPLE" value={stats.triples} accent="text-green-400" small />
          <Stat label="P-CLEAR" value={stats.perfectClears} accent="text-yellow-400" small />
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

function Stat({
  label,
  value,
  accent,
  small = false,
}: {
  label: string;
  value: number;
  accent: string;
  small?: boolean;
}) {
  return (
    <div className="text-center px-2 py-1.5 rounded-lg bg-secondary/60">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`font-mono font-bold tabular-nums ${accent} ${small ? 'text-sm' : 'text-lg'}`}
      >
        {value}
      </div>
    </div>
  );
}
