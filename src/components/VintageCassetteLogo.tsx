import React from 'react';

interface VintageCassetteLogoProps {
  size?: number; // size in pixels, default 24
  isPlaying?: boolean;
  className?: string;
}

export const VintageCassetteLogo: React.FC<VintageCassetteLogoProps> = ({
  size = 24,
  isPlaying = false,
  className = ''
}) => {
  const width = size * 1.5;
  const height = size;

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width, height }}
      title="AeroGlass Vintage Cassette"
    >
      <svg
        viewBox="0 0 48 32"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          {/* Outer Cassette Body Gradient */}
          <linearGradient id="cassetteBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--theme-c1, #38bdf8)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--theme-c2, #a855f7)" stopOpacity="0.85" />
          </linearGradient>

          {/* Label Inset Gradient */}
          <linearGradient id="cassetteLabel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.85" />
          </linearGradient>

          {/* Inner Clear Acrylic Window */}
          <linearGradient id="cassetteWindow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* 1. Outer Cassette Shell */}
        <rect
          x="1"
          y="1"
          width="46"
          height="30"
          rx="3.5"
          fill="url(#cassetteBody)"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
        />

        {/* 2. Four Corner Screws */}
        <circle cx="3.5" cy="3.5" r="0.8" fill="#ffffff" fillOpacity="0.8" />
        <circle cx="44.5" cy="3.5" r="0.8" fill="#ffffff" fillOpacity="0.8" />
        <circle cx="3.5" cy="28.5" r="0.8" fill="#ffffff" fillOpacity="0.8" />
        <circle cx="44.5" cy="28.5" r="0.8" fill="#ffffff" fillOpacity="0.8" />

        {/* 3. Paper Label Area */}
        <rect
          x="5"
          y="4.5"
          width="38"
          height="19"
          rx="2"
          fill="url(#cassetteLabel)"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />

        {/* Retro Stripe Accents on Label */}
        <line x1="7" y1="7" x2="41" y2="7" stroke="var(--theme-c1, #38bdf8)" strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="9" x2="35" y2="9" stroke="var(--theme-c2, #a855f7)" strokeWidth="0.8" strokeLinecap="round" />

        {/* 4. Center Acrylic Window Frame */}
        <rect
          x="11"
          y="11"
          width="26"
          height="10.5"
          rx="2"
          fill="url(#cassetteWindow)"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.75"
        />

        {/* 5. Left Tape Reel with 6-Teeth Spokes (Rotates when playing!) */}
        <g 
          className={isPlaying ? 'animate-spin' : ''} 
          style={{ transformOrigin: '18px 16.25px', animationDuration: '3s' }}
        >
          <circle cx="18" cy="16.25" r="3.5" fill="#ffffff" />
          <circle cx="18" cy="16.25" r="1.8" fill="#0f172a" />
          {/* Teeth */}
          <line x1="18" y1="13.2" x2="18" y2="19.3" stroke="#0f172a" strokeWidth="0.6" />
          <line x1="15.5" y1="14.8" x2="20.5" y2="17.7" stroke="#0f172a" strokeWidth="0.6" />
          <line x1="15.5" y1="17.7" x2="20.5" y2="14.8" stroke="#0f172a" strokeWidth="0.6" />
        </g>

        {/* 6. Right Tape Reel with 6-Teeth Spokes (Rotates when playing!) */}
        <g 
          className={isPlaying ? 'animate-spin' : ''} 
          style={{ transformOrigin: '30px 16.25px', animationDuration: '3s' }}
        >
          <circle cx="30" cy="16.25" r="3.5" fill="#ffffff" />
          <circle cx="30" cy="16.25" r="1.8" fill="#0f172a" />
          {/* Teeth */}
          <line x1="30" y1="13.2" x2="30" y2="19.3" stroke="#0f172a" strokeWidth="0.6" />
          <line x1="27.5" y1="14.8" x2="32.5" y2="17.7" stroke="#0f172a" strokeWidth="0.6" />
          <line x1="27.5" y1="17.7" x2="32.5" y2="14.8" stroke="#0f172a" strokeWidth="0.6" />
        </g>

        {/* Tape Bridge in Center Window */}
        <rect x="22" y="15.2" width="4" height="2" rx="0.5" fill="rgba(255,255,255,0.25)" />

        {/* 7. Bottom Trapezoid Head Area */}
        <path
          d="M10 30 L13 25 L35 25 L38 30 Z"
          fill="#0f172a"
          fillOpacity="0.4"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="0.6"
        />

        {/* Head Roller holes */}
        <circle cx="16" cy="27.5" r="0.9" fill="#ffffff" fillOpacity="0.7" />
        <circle cx="24" cy="27" r="1.2" fill="#ffffff" fillOpacity="0.9" />
        <circle cx="32" cy="27.5" r="0.9" fill="#ffffff" fillOpacity="0.7" />
      </svg>
    </div>
  );
};
