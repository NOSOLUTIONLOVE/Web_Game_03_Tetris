/**
 * MobileControls - 移动端虚拟控制按钮
 *
 * 仅在触屏设备显示，提供 6 个虚拟按键：
 * 左移 / 右移 / 软降 / 旋转 / Hold / 硬降
 */

import { ChevronLeft, ChevronRight, ChevronDown, RotateCw, Archive, ArrowDownToLine } from 'lucide-react';
import { useEngine } from './TetrisGame';
import { useGameStore } from '../store/useGameStore';
import { useEffect, useState } from 'react';

export function MobileControls() {
  const engine = useEngine();
  const phase = useGameStore((s) => s.phase);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!isTouch) return null;
  if (phase !== 'playing') return null;

  const handle = (action: Parameters<typeof engine.handleActionPublic>[0]) => {
    engine.handleActionPublic(action);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 select-none">
      <div className="grid grid-cols-6 gap-2 sm:hidden">
        <ControlButton onClick={() => handle('moveLeft')} label="左">
          <ChevronLeft className="h-6 w-6" />
        </ControlButton>
        <ControlButton onClick={() => handle('rotateCW')} label="旋转">
          <RotateCw className="h-5 w-5" />
        </ControlButton>
        <ControlButton onClick={() => handle('softDrop')} label="软降">
          <ChevronDown className="h-6 w-6" />
        </ControlButton>
        <ControlButton onClick={() => handle('hardDrop')} label="硬降">
          <ArrowDownToLine className="h-5 w-5" />
        </ControlButton>
        <ControlButton onClick={() => handle('hold')} label="Hold">
          <Archive className="h-5 w-5" />
        </ControlButton>
        <ControlButton onClick={() => handle('moveRight')} label="右">
          <ChevronRight className="h-6 w-6" />
        </ControlButton>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function ControlButton({ onClick, label, children }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg bg-secondary/60 hover:bg-secondary active:bg-primary/20 transition-colors touch-none"
    >
      {children}
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </button>
  );
}
