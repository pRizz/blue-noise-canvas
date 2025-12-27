import { useState, useCallback, useRef } from 'react';
import { BlueNoiseCanvas } from '@/components/BlueNoiseCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { toast } from 'sonner';

const Index = () => {
  const [dimension, setDimension] = useState(512);
  const [pixelSize, setPixelSize] = useState(2);
  const [foregroundColor, setForegroundColor] = useState('#00d4ff');
  const [backgroundColor, setBackgroundColor] = useState('#0a0f14');
  const [intensity, setIntensity] = useState(50);
  const [seed, setSeed] = useState(42);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const handleRandomizeSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 100000);
    setSeed(newSeed);
    toast.success(`Seed randomized to ${newSeed}`);
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }

    const link = document.createElement('a');
    link.download = `blue-noise-${dimension}x${dimension}-seed${seed}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast.success('Image downloaded!');
  }, [dimension, seed]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-mono mb-2 glow-text">
            Blue Noise Generator
          </h1>
          <p className="text-muted-foreground">
            Generate high-quality blue noise patterns using Mitchell's best-candidate algorithm
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Canvas Area */}
          <div className="flex flex-col items-center lg:items-start">
            <BlueNoiseCanvas
              dimension={dimension}
              pixelSize={pixelSize}
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
              intensity={intensity}
              seed={seed}
              onCanvasReady={handleCanvasReady}
            />
            
            {/* Canvas Info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground font-mono">
              <span>Size: {dimension}×{dimension}</span>
              <span>•</span>
              <span>Pixel: {pixelSize}px</span>
              <span>•</span>
              <span>Seed: {seed}</span>
            </div>
          </div>

          {/* Control Panel */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <ControlPanel
              dimension={dimension}
              pixelSize={pixelSize}
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
              intensity={intensity}
              seed={seed}
              onDimensionChange={setDimension}
              onPixelSizeChange={setPixelSize}
              onForegroundColorChange={setForegroundColor}
              onBackgroundColorChange={setBackgroundColor}
              onIntensityChange={setIntensity}
              onSeedChange={setSeed}
              onRandomizeSeed={handleRandomizeSeed}
              onDownload={handleDownload}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
