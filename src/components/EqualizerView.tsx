import React from 'react';
import { EQ_FREQUENCIES, EQ_LABELS, EQUALIZER_PRESETS } from '../utils/demoData';
import { Sliders, RotateCcw, Volume2, Sparkles, Waves } from 'lucide-react';

interface EqualizerViewProps {
  bands: number[];
  onBandChange: (index: number, gain: number) => void;
  onPresetSelect: (presetName: string) => void;
  currentPreset: string;
  preampGain: number;
  onPreampChange: (gain: number) => void;
  isSpatialAudio: boolean;
  onToggleSpatialAudio: () => void;
  onReset: () => void;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  bands,
  onBandChange,
  onPresetSelect,
  currentPreset,
  preampGain,
  onPreampChange,
  isSpatialAudio,
  onToggleSpatialAudio,
  onReset
}) => {
  return (
    <div className="flex flex-col h-full p-6 md:p-8 overflow-y-auto">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              10-Band Graphic Equalizer
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Precision audio curve adjustment with hardware-grade DSP filters
          </p>
        </div>

        {/* Toolbar: Presets dropdown, 3D Spatial, Reset */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Select */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50 font-medium">Preset:</label>
            <select
              value={currentPreset}
              onChange={(e) => onPresetSelect(e.target.value)}
              className="bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-colors cursor-pointer"
            >
              {EQUALIZER_PRESETS.map((p) => (
                <option key={p.name} value={p.name} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
              <option value="Custom" className="bg-slate-900 text-white">
                Custom
              </option>
            </select>
          </div>

          {/* 3D Spatial Audio Toggle */}
          <button
            onClick={onToggleSpatialAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isSpatialAudio
                ? 'bg-sky-500/30 border-sky-400/50 text-sky-200 shadow-sm'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
            title="3D Spatial Sound expansion"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>3D Spatial Glass</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Reset to 0 dB Flat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Flat</span>
          </button>
        </div>
      </div>

      {/* Main EQ Sliders Container with Gradient Border Hover */}
      <div className="flex-1 flex flex-col justify-center my-6 glass-subpanel rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden tile-hover-gradient">
        {/* dB Guide Lines */}
        <div className="absolute inset-x-8 top-12 bottom-16 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-white text-[10px] font-mono text-white/70 flex justify-between">
            <span>+12 dB</span>
            <span>+12 dB</span>
          </div>
          <div className="border-b border-dashed border-white text-[10px] font-mono text-white/70 flex justify-between">
            <span>+6 dB</span>
            <span>+6 dB</span>
          </div>
          <div className="border-b border-white text-[10px] font-mono text-white font-bold flex justify-between">
            <span>0 dB (Flat)</span>
            <span>0 dB (Flat)</span>
          </div>
          <div className="border-b border-dashed border-white text-[10px] font-mono text-white/70 flex justify-between">
            <span>-6 dB</span>
            <span>-6 dB</span>
          </div>
          <div className="border-b border-dashed border-white text-[10px] font-mono text-white/70 flex justify-between">
            <span>-12 dB</span>
            <span>-12 dB</span>
          </div>
        </div>

        {/* Sliders Grid: Preamp + 10 Bands */}
        <div className="relative z-10 flex items-center justify-around gap-2 md:gap-4 px-2">
          {/* Pre-Amp Booster (GOM Audio signature) */}
          <div className="flex flex-col items-center gap-3 pr-3 md:pr-6 border-r border-white/15">
            <span className="text-[11px] font-mono tabular-nums text-amber-300 font-semibold">
              {preampGain > 0 ? `+${preampGain.toFixed(1)}` : preampGain.toFixed(1)}
            </span>
            <div className="h-44 flex items-center justify-center">
              <input
                type="range"
                min="0"
                max="6"
                step="0.2"
                value={preampGain}
                onChange={(e) => onPreampChange(parseFloat(e.target.value))}
                className="vertical-slider"
                title={`Pre-Amp Gain: ${preampGain.toFixed(1)} dB`}
              />
            </div>
            <span className="text-xs font-semibold text-amber-400">
              Preamp
            </span>
          </div>

          {/* 10 Frequency Bands */}
          {bands.map((gain, idx) => {
            const freqLabel = EQ_LABELS[idx];
            return (
              <div key={idx} className="flex flex-col items-center gap-3 flex-1">
                {/* dB value */}
                <span className="text-[11px] font-mono tabular-nums text-white/80 font-medium">
                  {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                </span>

                {/* Slider */}
                <div className="h-44 flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={gain}
                    onChange={(e) => onBandChange(idx, parseFloat(e.target.value))}
                    className="vertical-slider"
                    title={`${EQ_FREQUENCIES[idx]} Hz: ${gain} dB`}
                  />
                </div>

                {/* Frequency Band Label */}
                <div className="text-center">
                  <span className="text-xs font-medium text-white/90">
                    {freqLabel}
                  </span>
                  <span className="block text-[10px] text-white/40 font-mono">
                    Hz
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer explanation note */}
      <div className="flex items-center justify-between text-xs text-white/40 pt-2 font-mono">
        <span>Dynamic range: -12 dB to +12 dB</span>
        <span>Filter Type: Biquad Peak & Shelving DSP</span>
      </div>
    </div>
  );
};
