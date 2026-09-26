import React from 'react';
import { NOBLE_PALETTES } from './MonogramAvatar';

/**
 * Pórtico OS v3.1 - Monograma Vectorial Amor y Gracia (GOLD-257)
 * Emblema heráldico noble: 'A' y 'G' entrelazadas formando una cruz y corazón sutil.
 * 100% SVG vectorial, escalable, sin dependencias de fuentes externas ni artefactos rasterizados.
 */

interface ChurchBrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'horizontal' | 'stacked';
  paletteId?: string;
  className?: string;
  subtitle?: string;
}

export const ChurchBrandLogo: React.FC<ChurchBrandLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  paletteId = 'navy',
  className = '',
  subtitle = 'Comunidades de Fe y Mesa',
}) => {
  const palette = NOBLE_PALETTES.find(p => p.id === paletteId) || NOBLE_PALETTES[0];

  const iconSizes = {
    sm: 28,
    md: 40,
    lg: 56,
    xl: 72,
  };

  const currentIconSize = iconSizes[size] || 40;

  // Emblema Vectorial: Escudo con arco románico, entrelace de 'A' (Amor) y 'G' (Gracia) y cruz superior
  const MonogramSvg = (
    <svg
      width={currentIconSize}
      height={currentIconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:rotate-2"
      aria-label="Monograma Institucional Amor y Gracia"
    >
      <defs>
        <linearGradient id="nobleGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="nobleShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.bg} />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>

      {/* Escudo de arco románico */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="22"
        fill="url(#nobleShieldGrad)"
        stroke={palette.border}
        strokeWidth="3"
      />

      {/* Trazo de Cruz Alta */}
      <path
        d="M50 18V32M43 24H57"
        stroke="url(#nobleGoldGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trazo 'A' (Amor) - Pierna izquierda y ápice */}
      <path
        d="M32 74L49 35C49.5 33.8 50.5 33.8 51 35L68 74"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Barra transversal de la 'A' que enlaza la 'G' */}
      <path
        d="M39 58H61"
        stroke="url(#nobleGoldGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Curva noble de la 'G' (Gracia) envolviendo con corazón sutil */}
      <path
        d="M62 48C59 42 52 38 45 41C38 44 34 52 35 60C36 68 43 74 52 74C60 74 66 69 66 61H51"
        stroke="url(#nobleGoldGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dintel arquitectónico basal */}
      <circle cx="50" cy="80" r="2.5" fill="#D97706" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-block ${className}`}>{MonogramSvg}</div>;
  }

  const textSizes = {
    sm: { title: 'text-sm', sub: 'text-[10px]' },
    md: { title: 'text-base font-bold', sub: 'text-xs' },
    lg: { title: 'text-xl font-bold tracking-tight', sub: 'text-sm' },
    xl: { title: 'text-2xl font-black tracking-tight', sub: 'text-base' },
  };

  const currentTextSize = textSizes[size];

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        {MonogramSvg}
        <div>
          <div
            className={`font-serif tracking-wider uppercase text-slate-900 dark:text-slate-100 ${currentTextSize.title}`}
          >
            Amor y Gracia
          </div>
          <div className={`text-slate-500 dark:text-slate-400 font-sans ${currentTextSize.sub}`}>
            {subtitle}
          </div>
        </div>
      </div>
    );
  }

  // Variant: horizontal
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {MonogramSvg}
      <div className="flex flex-col text-left">
        <span
          className={`font-serif tracking-wide uppercase text-slate-900 dark:text-slate-100 leading-none ${currentTextSize.title}`}
        >
          Amor y Gracia
        </span>
        <span className={`text-slate-500 dark:text-slate-400 font-sans mt-1 leading-none ${currentTextSize.sub}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
};
