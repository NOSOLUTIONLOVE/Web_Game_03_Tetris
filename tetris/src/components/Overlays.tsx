/**
 * Overlays - 统一管理游戏状态遮罩
 *
 * 根据 phase 显示对应遮罩：
 * - menu: MainMenu
 * - paused: PauseOverlay
 * - over: GameOverModal
 */

import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { MainMenu } from './MainMenu';
import { PauseOverlay } from './PauseOverlay';
import { GameOverModal } from './GameOverModal';

export function Overlays() {
  const phase = useGameStore((s) => s.phase);

  return (
    <AnimatePresence mode="wait">
      {phase === 'menu' && <MainMenu key="menu" />}
      {phase === 'paused' && <PauseOverlay key="paused" />}
      {phase === 'over' && <GameOverModal key="over" />}
    </AnimatePresence>
  );
}
