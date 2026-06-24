/**
 * PauseOverlay - 暂停遮罩
 */

import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useEngine } from './TetrisGame';
import { Button } from './ui/button';

export function PauseOverlay() {
  const engine = useEngine();

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="游戏暂停"
      className="absolute inset-0 flex items-center justify-center z-10 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Pause className="h-12 w-12 text-primary" />
        <h2 className="text-3xl font-extrabold tracking-widest text-primary text-glow">
          PAUSED
        </h2>
        <p className="text-sm text-muted-foreground">按 P 键继续</p>

        <div className="flex flex-col gap-2 w-full">
          <Button size="lg" onClick={() => engine.togglePause()}>
            <Play className="h-4 w-4 mr-2" />
            继续
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
