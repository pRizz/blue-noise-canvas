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
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12 flex flex-col">
      <div className="max-w-7xl mx-auto flex-1">
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

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border/40">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            Free and open source under the MIT License
          </p>
          <a
            href="https://github.com/pRizz/blue-noise-canvas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
