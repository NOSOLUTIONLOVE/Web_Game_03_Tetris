/**
 * SettingsPanel - 设置弹窗
 *
 * 包含：音效开关、DAS/ARR 输入参数调节、版本信息
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useGameStore } from '../store/useGameStore';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useEngine } from './TetrisGame';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const setAudioEnabled = useGameStore((s) => s.setAudioEnabled);
  const dasMs = useGameStore((s) => s.dasMs);
  const arrMs = useGameStore((s) => s.arrMs);
  const setDAS = useGameStore((s) => s.setDAS);
  const setARR = useGameStore((s) => s.setARR);
  const engine = useEngine();

  /** 调整 DAS：同步到 store 和引擎 Input 实例 */
  const handleDASChange = (value: number) => {
    setDAS(value);
    engine.getInput().setDAS(value);
  };

  /** 调整 ARR：同步到 store 和引擎 Input 实例 */
  const handleARRChange = (value: number) => {
    setARR(value);
    engine.getInput().setARR(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>调整游戏偏好</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="audio" className="text-sm">
              音效
            </Label>
            <Switch
              id="audio"
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </div>

          {/* DAS 延迟滑块 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="das" className="text-sm">
                DAS 延迟
              </Label>
              <span className="text-xs font-mono text-muted-foreground">{dasMs}ms</span>
            </div>
            <input
              id="das"
              type="range"
              min={50}
              max={300}
              step={1}
              value={dasMs}
              onChange={(e) => handleDASChange(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* ARR 间隔滑块 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="arr" className="text-sm">
                ARR 间隔
              </Label>
              <span className="text-xs font-mono text-muted-foreground">{arrMs}ms</span>
            </div>
            <input
              id="arr"
              type="range"
              min={0}
              max={100}
              step={1}
              value={arrMs}
              onChange={(e) => handleARRChange(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* DAS/ARR 说明 */}
          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p>DAS：按住方向键后延迟多久开始自动重复（越低越灵敏）</p>
            <p>ARR：自动重复的间隔（越低移动越快）</p>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>版本</span>
              <span className="font-mono">v2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>技术栈</span>
              <span className="font-mono">React + Vite + TS</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
