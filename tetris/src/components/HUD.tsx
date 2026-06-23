/**
 * HUD - 顶部状态栏
 *
 * 显示：TETRIS 标题 + SCORE / LINES / LEVEL 三个数字方块 + 音量切换 + 设置
 */

import { Settings, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SettingsPanel } from './SettingsPanel';
import { useState } from 'react';

export function HUD() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const isNewRecord = useGameStore((s) => s.isNewRecord);
  const lines = useGameStore((s) => s.lines);
  const level = useGameStore((s) => s.level);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const toggleAudio = useGameStore((s) => s.toggleAudio);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between w-full gap-2 px-2">
        {/* 左侧标题 */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-extrabold tracking-widest text-primary text-glow">
            TETRIS
          </h1>
          <span className="text-[10px] text-muted-foreground">v2.0</span>
        </div>

        {/* 右侧数字方块组 */}
        <div className="flex items-center gap-2">
          <NumberCard label="SCORE" value={score} accent="text-foreground" />
          <NumberCard label="BEST" value={highScore} accent="text-accent" pulse={isNewRecord} />
          <NumberCard label="LINES" value={lines} accent="text-muted-foreground" />
          <NumberCard label="LEVEL" value={level} accent="text-muted-foreground" />

          {isNewRecord && (
            <Badge variant="success" className="animate-scale-in">
              NEW!
            </Badge>
          )}

          {/* 音量切换 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            aria-label={audioEnabled ? '关闭音效' : '开启音效'}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          {/* 设置 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="设置"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

interface NumberCardProps {
  label: string;
  value: number;
  accent: string;
  pulse?: boolean;
}

function NumberCard({ label, value, accent, pulse }: NumberCardProps) {
  return (
    <div className="text-center px-3 py-1.5 rounded-lg bg-secondary/60 min-w-[64px]">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <motion.div
        key={value}
        initial={{ scale: 1 }}
        animate={
          pulse
            ? { scale: [1, 1.3, 1], color: ['#facc15', '#facc15', '#facc15'] }
            : { scale: [1, 1.25, 1] }
        }
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`font-mono text-base font-bold tabular-nums ${accent}`}
      >
        {value}
      </motion.div>
    </div>
  );
}
