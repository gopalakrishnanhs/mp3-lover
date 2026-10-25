import React from 'react';
import { X, Palette, Sparkles, Shuffle, ArrowLeftRight, Check } from 'lucide-react';
import { ThemeConfig } from '../types/player';
import { THEME_PRESETS } from '../utils/demoData';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onApplyTheme: (theme: ThemeConfig) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onApplyTheme
}) => {
  if (!isOpen) return null;

  const handleColor1Change = (val: string) => {
    onApplyTheme({
      ...currentTheme,
      name: 'Custom Gradient',
      color1: val
    });
  };

  const handleColor2Change = (val: string) => {
    onApplyTheme({
      ...currentTheme,
      name: 'Custom Gradient',
      color2: val
    });
  };

  const handleAngleChange = (angle: number) => {
    onApplyTheme({
      ...currentTheme,
      angle
    });
  };

  const handleSwapColors = () => {
    onApplyTheme({
      ...currentTheme,
      color1: currentTheme.color2,
      color2: currentTheme.color1
    });
  };

  const handleRandomize = () => {
    const randomHex = () =>
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    onApplyTheme({
      name: 'Random Gradient',
      color1: randomHex(),
      color2: randomHex(),
      angle: 135
    });
  };

  const currentGradientCss = `linear-gradient(${currentTheme.angle || 135}deg, ${currentTheme.color1}, ${currentTheme.color2})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-white">Theme & 2-Color Gradient</h3>
              <p className="text-xs text-white/50">
                Customize tile hover borders, ambient lighting, and acrylic accents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2">
            Hover over this preview tile to see your gradient border
          </span>
          <div
            className="w-full h-20 rounded-xl glass-subpanel tile-hover-gradient cursor-pointer flex items-center justify-center gap-3 p-4 group"
            style={
              {
                '--theme-c1': currentTheme.color1,
                '--theme-c2': currentTheme.color2,
                '--theme-angle': `${currentTheme.angle || 135}deg`
              } as React.CSSProperties
            }
          >
            <div 
              className="w-8 h-8 rounded-lg shadow-md shrink-0 flex items-center justify-center"
              style={{ background: currentGradientCss }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block group-hover:text-sky-200 transition-colors">
                Interactive Tile Highlight
              </span>
              <span className="text-[11px] text-white/50 font-mono block">
                {currentTheme.color1} → {currentTheme.color2} ({currentTheme.angle || 135}°)
              </span>
            </div>
          </div>
        </div>

        {/* 2-Color Selectors */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Pick 2 Colors for Gradient
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwapColors}
                className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10 transition-colors"
                title="Swap Color 1 and Color 2"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Swap</span>
              </button>
              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10 transition-colors"
                title="Generate Random Gradient"
              >
                <Shuffle className="w-3 h-3" />
                <span>Random</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Color 1 */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <label className="block text-xs font-medium text-white/70">
                Color 1 (Start)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentTheme.color1}
                  onChange={(e) => handleColor1Change(e.target.value)}
                  className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={currentTheme.color1}
                  onChange={(e) => handleColor1Change(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
            </div>

            {/* Color 2 */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <label className="block text-xs font-medium text-white/70">
                Color 2 (End)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentTheme.color2}
                  onChange={(e) => handleColor2Change(e.target.value)}
                  className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={currentTheme.color2}
                  onChange={(e) => handleColor2Change(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Gradient Angle Slider */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-white/70">Gradient Angle</span>
              <span className="text-xs font-mono text-white/50">{currentTheme.angle || 135}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={currentTheme.angle || 135}
              onChange={(e) => handleAngleChange(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Curated Theme Presets */}
        <div className="mt-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Curated 2-Color Presets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {THEME_PRESETS.map((preset) => {
              const isSelected =
                currentTheme.color1.toLowerCase() === preset.color1.toLowerCase() &&
                currentTheme.color2.toLowerCase() === preset.color2.toLowerCase();

              return (
                <button
                  key={preset.name}
                  onClick={() => onApplyTheme(preset)}
                  className={`group flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-white/20 border-white/40 shadow-sm'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-md shrink-0 shadow-sm flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
                  </div>
                  <span className="text-[11px] font-medium text-white/90 truncate">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-white/40">
            Saved automatically
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-all shadow-md shadow-sky-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
