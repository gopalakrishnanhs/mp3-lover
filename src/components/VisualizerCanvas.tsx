import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { VisualizerMode } from '../types/player';

interface VisualizerCanvasProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  accentColor?: string;
  className?: string;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  mode,
  isPlaying,
  accentColor = '#38bdf8',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(64);
    const timeDomainArray = new Uint8Array(64);

    let phase = 0;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      // Clear with slight transparency for motion trails
      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        audioEngine.getFrequencyData(dataArray);
        audioEngine.getTimeDomainData(timeDomainArray);
        phase += 0.04;
      } else {
        // Subtle ambient idle breathing when paused
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.95);
          timeDomainArray[i] = 128;
        }
      }

      // Read current theme colors
      const docStyle = getComputedStyle(document.documentElement);
      const c1 = docStyle.getPropertyValue('--theme-c1').trim() || '#38bdf8';
      const c2 = docStyle.getPropertyValue('--theme-c2').trim() || '#a855f7';

      if (mode === 'bars') {
        const barCount = 36;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;

        for (let i = 0; i < barCount; i++) {
          const dataIdx = Math.floor((i / barCount) * (dataArray.length * 0.85));
          const val = isPlaying ? dataArray[dataIdx] : 6 + Math.sin(phase + i * 0.2) * 4;
          const barHeight = Math.max(3, (val / 255) * (height - 12));
          const x = i * (barWidth + gap) + gap / 2;
          const y = height - barHeight;

          // Gradient bar using active 2-color theme
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, `${c1}33`);
          grad.addColorStop(0.5, `${c1}cc`);
          grad.addColorStop(1, c2);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          // Peak cap
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(x, Math.max(0, y - 2), barWidth, 1.5);
        }
      } else if (mode === 'liquid' || mode === 'wave') {
        // Apple style fluid glowing ribbons with theme colors
        ctx.save();
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const points = 48;
        const sliceWidth = width / (points - 1);

        // Multiple harmonic layers themed with c1 & c2
        const layers = [
          { color: c1, offset: 0, mult: 1.0, glow: 12 },
          { color: c2, offset: Math.PI / 3, mult: 0.8, glow: 8 },
          { color: 'rgba(255, 255, 255, 0.7)', offset: Math.PI * 0.7, mult: 0.5, glow: 5 }
        ];

        layers.forEach((layer) => {
          ctx.beginPath();
          ctx.strokeStyle = layer.color;
          ctx.shadowColor = layer.color;
          ctx.shadowBlur = layer.glow;

          for (let i = 0; i < points; i++) {
            const dataIdx = Math.floor((i / points) * 32);
            const freq = (dataArray[dataIdx] || 0) / 255;
            const wave = (timeDomainArray[i % timeDomainArray.length] - 128) / 128;

            const amp = isPlaying ? (freq * 0.7 + wave * 0.3) * (height * 0.45) * layer.mult : Math.sin(phase + i * 0.3 + layer.offset) * 8;
            const y = height / 2 + Math.sin(phase * 1.5 + i * 0.2 + layer.offset) * amp;
            const x = i * sliceWidth;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        });

        ctx.restore();
      } else if (mode === 'circular') {
        // Circular radial pulse oscilloscope
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.6;
        const count = 48;

        ctx.save();
        ctx.translate(centerX, centerY);

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const dataIdx = Math.floor((i / count) * 32);
          const val = (dataArray[dataIdx] || 0) / 255;
          const rOffset = isPlaying ? val * 35 : Math.sin(phase + i) * 6;
          const r = radius + rOffset;

          const x1 = Math.cos(angle) * (radius * 0.75);
          const y1 = Math.sin(angle) * (radius * 0.75);
          const x2 = Math.cos(angle) * r;
          const y2 = Math.sin(angle) * r;

          ctx.strokeStyle = `hsla(${200 + val * 120}, 90%, 65%, ${0.35 + val * 0.65})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [mode, isPlaying, accentColor]);

  // Handle high-dpi sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
