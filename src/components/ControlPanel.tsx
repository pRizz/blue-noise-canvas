import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, RefreshCw, Shuffle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Algorithm } from '@/hooks/useBlueNoiseWorker';

interface ControlPanelProps {
  dimension: number;
  pixelSize: number;
  foregroundColor: string;
  backgroundColor: string;
  intensity: number;
  seed: number;
  algorithm: Algorithm;
  animateRender: boolean;
  chunkSize: number;
  onDimensionChange: (value: number) => void;
  onPixelSizeChange: (value: number) => void;
  onForegroundColorChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onIntensityChange: (value: number) => void;
  onSeedChange: (value: number) => void;
  onAlgorithmChange: (value: Algorithm) => void;
  onAnimateRenderChange: (value: boolean) => void;
  onChunkSizeChange: (value: number) => void;
  onRandomizeSeed: () => void;
  onDownload: () => void;
}

export function ControlPanel({
  dimension,
  pixelSize,
  foregroundColor,
  backgroundColor,
  intensity,
  seed,
  algorithm,
  animateRender,
  chunkSize,
  onDimensionChange,
  onPixelSizeChange,
  onForegroundColorChange,
  onBackgroundColorChange,
  onIntensityChange,
  onSeedChange,
  onAlgorithmChange,
  onAnimateRenderChange,
  onChunkSizeChange,
  onRandomizeSeed,
  onDownload,
}: ControlPanelProps) {
  return (
    <div className="control-panel space-y-6">
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground font-mono">Controls</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onRandomizeSeed}
            className="gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Randomize
          </Button>
          <Button
            onClick={onDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Algorithm */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground font-mono">Algorithm</Label>
        <Select value={algorithm} onValueChange={(v) => onAlgorithmChange(v as Algorithm)}>
          <SelectTrigger className="w-full font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mitchell">
              <div className="flex flex-col items-start">
                <span>Mitchell's Best-Candidate</span>
                <span className="text-xs text-muted-foreground">O(n²) · Higher quality</span>
              </div>
            </SelectItem>
            <SelectItem value="bridson">
              <div className="flex flex-col items-start">
                <span>Bridson Poisson Disk</span>
                <span className="text-xs text-muted-foreground">O(n) · Much faster</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dimension */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground font-mono">Dimension</Label>
          <span className="text-sm text-foreground font-mono">{dimension}px</span>
        </div>
        <Slider
          value={[dimension]}
          onValueChange={([value]) => onDimensionChange(value)}
          min={128}
          max={1024}
          step={64}
          className="w-full"
        />
      </div>

      {/* Pixel Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground font-mono">Pixel Size</Label>
          <span className="text-sm text-foreground font-mono">{pixelSize}px</span>
        </div>
        <Slider
          value={[pixelSize]}
          onValueChange={([value]) => onPixelSizeChange(value)}
          min={1}
          max={16}
          step={1}
          className="w-full"
        />
      </div>

      {/* Min Spacing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground font-mono">Min Spacing</Label>
          <span className="text-sm text-foreground font-mono">{intensity}px</span>
        </div>
        <Slider
          value={[intensity]}
          onValueChange={([value]) => onIntensityChange(value)}
          min={1}
          max={32}
          step={0.5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Minimum distance between points in pixels
        </p>
      </div>

      {/* Seed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground font-mono">Seed</Label>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={seed}
            onChange={(e) => onSeedChange(parseInt(e.target.value) || 0)}
            className="font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onRandomizeSeed}
            title="Randomize seed"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground font-mono">Foreground</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 rounded border border-border"
              style={{ backgroundColor: foregroundColor }}
            />
            <Input
              type="color"
              value={foregroundColor}
              onChange={(e) => onForegroundColorChange(e.target.value)}
              className="w-full h-10 p-1 cursor-pointer"
            />
          </div>
          <Input
            type="text"
            value={foregroundColor}
            onChange={(e) => onForegroundColorChange(e.target.value)}
            className="font-mono text-xs"
            placeholder="#000000"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground font-mono">Background</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 rounded border border-border"
              style={{ backgroundColor: backgroundColor }}
            />
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-full h-10 p-1 cursor-pointer"
            />
          </div>
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="font-mono text-xs"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Animation Settings */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <h3 className="text-sm font-medium text-foreground font-mono">Render Animation</h3>
        
        <div className="flex items-center gap-3">
          <Checkbox
            id="animateRender"
            checked={animateRender}
            onCheckedChange={(checked) => onAnimateRenderChange(checked === true)}
          />
          <Label htmlFor="animateRender" className="text-sm text-muted-foreground cursor-pointer">
            Animate point rendering
          </Label>
        </div>

        {animateRender && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground font-mono">Chunk Size</Label>
              <span className="text-sm text-foreground font-mono">{chunkSize} pts/frame</span>
            </div>
            <Slider
              value={[chunkSize]}
              onValueChange={([value]) => onChunkSizeChange(value)}
              min={5}
              max={200}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Points rendered per animation frame
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
