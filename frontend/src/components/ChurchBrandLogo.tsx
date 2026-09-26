import React from 'react';

export interface ChurchBrandLogoProps {
  /** Tamaño del isotipo en píxeles o alias ('sm', 'md', 'lg') (default: 32) */
  size?: number | 'sm' | 'md' | 'lg';
  /** Clases CSS adicionales */
  className?: string;
  /** Variante: 'icon' (solo isotipo), 'full' o 'horizontal' (con tipografía noble) */
  variant?: 'icon' | 'full' | 'horizontal';
  /** Color principal del logo (default: currentColor) */
  color?: string;
  /** Color del isotipo interior (default: fondo noble) */
  glyphColor?: string;
  /** Nombre de la congregación tenant (default: Amor y Gracia) */
  tenantName?: string;
  /** Subtítulo o localidad */
  locality?: string;
  /** Subtítulo secundario (alias de localidad) */
  subtitle?: string;
  /** Paleta de color opcional para integración conciliar */
  paletteId?: string;
}

/**
 * ChurchBrandLogo (GOLD-330 / Decisión 1-B)
 * Isotipo vectorial SVG nativo del corazón isométrico A+G de Amor y Gracia Durango.
 * Cero layout shifts, compatible con tema noble y multi-tenant.
 */
export const ChurchBrandLogo: React.FC<ChurchBrandLogoProps> = ({
  size = 32,
  className = '',
  variant = 'icon',
  color = 'currentColor',
  glyphColor = 'var(--bg-primary, #FBF9F5)',
  tenantName = 'Amor y Gracia',
  locality = 'Durango',
  subtitle,
}) => {
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 24
      : size === 'lg'
      ? 44
      : 32;

  const isFullOrHorizontal = variant === 'full' || variant === 'horizontal';
  const displaySubtitle = subtitle || locality;

  return (
    <div
      className={`church-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isFullOrHorizontal ? '10px' : '0',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <svg
        width={numericSize}
        height={numericSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`${tenantName} Logo`}
        style={{ flexShrink: 0 }}
      >
        {/* Círculo contenedor noble exterior */}
        <circle cx="50" cy="50" r="48" fill={color} />

        {/* 
          Monograma Isométrico A + G (Amor y Gracia)
          Corazón rotado a 45 grados formado por dos lazos geométricos entrelazados.
        */}
        <g fill={glyphColor}>
          {/* Lazo Izquierdo: Letra "A" isométrica con contraforma cuadrada */}
          <path
            d="M 33 21 
               L 48 36 
               L 36 48 
               L 26 38 
               L 26 49 
               L 20 49 
               L 20 37 
               L 33 21 Z
               M 33 30 
               L 27 36 
               L 35 44 
               L 41 38 
               Z"
            fillRule="evenodd"
          />

          {/* Lazo Derecho y Base: Letra "G" entrelazada que completa el corazón y lazo inferior */}
          <path
            d="M 52 32 
               L 67 21 
               L 80 37 
               L 80 49 
               L 50 81 
               L 38 69 
               L 44 63 
               L 50 69 
               L 72 46 
               L 72 38 
               L 67 31 
               L 58 40 
               L 47 40 
               L 52 32 Z
               M 52 47 
               L 64 47 
               L 64 53 
               L 45 72 
               L 37 64 
               L 52 47 Z"
            fillRule="evenodd"
          />
        </g>
      </svg>

      {isFullOrHorizontal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
          <span
            style={{
              fontSize: `${Math.max(13, Math.round(numericSize * 0.44))}px`,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          >
            {tenantName}
          </span>
          <span
            style={{
              fontSize: `${Math.max(10, Math.round(numericSize * 0.3))}px`,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            {displaySubtitle}
          </span>
        </div>
      )}
    </div>
  );
};
