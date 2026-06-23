/**
 * SettingsPanel - 设置弹窗
 *
 * 包含：音效开关、版本信息
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

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const setAudioEnabled = useGameStore((s) => s.setAudioEnabled);

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
