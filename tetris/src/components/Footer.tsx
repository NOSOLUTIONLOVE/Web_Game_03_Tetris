/**
 * Footer - 底部键盘提示
 *
 * 根据当前游戏阶段（menu/playing/paused/over）
 * 展示不同的快捷键提示，使用紧凑响应式布局。
 */

import { useGameStore } from '../store/useGameStore';
import type { GamePhase } from '../config';

const HINTS: Record<GamePhase, string[]> = {
  menu: ['Enter 开始', 'M 静音'],
  playing: ['←→ 移动', '↑ 旋转', '↓ 软降', 'Space 硬降', 'C Hold', 'P 暂停', 'R 重开'],
  paused: ['P 继续', 'R 重开', 'Esc 返回'],
  over: ['Enter 再玩一次', 'Esc 返回菜单'],
};

export function Footer() {
  const phase = useGameStore((s) => s.phase);
  const items = HINTS[phase] ?? HINTS.menu;

  return (
    <footer className="w-full max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
      {items.map((hint, i) => (
        <span key={hint} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          <kbd className="px-1.5 py-0.5 rounded bg-secondary/60 font-mono text-[10px]">
            {hint}
          </kbd>
        </span>
      ))}
    </footer>
  );
}
