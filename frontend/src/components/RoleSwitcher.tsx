import React, { useState, useEffect } from 'react';
import type { RoleMode } from '../types';
import { Globe, User, ShieldAlert, Compass, ShieldCheck, Sun, Moon, Church } from 'lucide-react';
import { ChurchBrandLogo } from './ChurchBrandLogo';

interface Props {
  currentRole: RoleMode;
  onSelectRole: (role: RoleMode) => void;
  churchName?: string;
  enableDeaconSystem?: boolean;
  enableEldershipSystem?: boolean;
}

export const RoleSwitcher: React.FC<Props> = ({
  currentRole,
  onSelectRole,
  churchName,
  enableDeaconSystem = true,
  enableEldershipSystem = true,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('portico_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('portico_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // GOLD-311: En producción, el selector de roles de desarrollo se purga por completo (RBAC estricto en backend)
  if (!import.meta.env.DEV && !window.location.search.includes('dev=true')) {
    return null;
  }

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {/* Identidad Institucional Noble y Serena (D1 / GOLD-287) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChurchBrandLogo size="md" variant="icon" />
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              {churchName || 'Amor y Gracia Durango'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Vida Comunitaria y Grupos
            </div>
          </div>
        </div>

        {/* Controles de Navegación y Conmutador de Modo Solar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Conmutador Manual de Tema Claro / Oscuro */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title="Alternar entre Modo Claro y Modo Oscuro"
            aria-label="Alternar tema de pantalla"
          >
            {theme === 'dark' ? <Sun size={15} style={{ color: '#FCD34D' }} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>

          {/* Barra Táctil de Navegación Desktop (GOLD-232 / D3) */}
          <nav
            aria-label="Navegación de escritorio"
            className="hide-scrollbar desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-primary)',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => onSelectRole('public')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '38px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: currentRole === 'public' ? 'var(--text-primary)' : 'transparent',
                color: currentRole === 'public' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                boxShadow: currentRole === 'public' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Globe size={15} />
              <span>Pórtico Público</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('member')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '38px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: currentRole === 'member' ? 'var(--accent-indigo)' : 'transparent',
                color: currentRole === 'member' ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: currentRole === 'member' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <User size={15} />
              <span>Mi Grupo</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('leader')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '38px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: currentRole === 'leader' ? 'var(--accent-amber)' : 'transparent',
                color: currentRole === 'leader' ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: currentRole === 'leader' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Compass size={15} />
              <span>Líder</span>
            </button>

            {enableDeaconSystem && (
              <button
                type="button"
                onClick={() => onSelectRole('deacon')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '38px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  backgroundColor: currentRole === 'deacon' ? 'var(--accent-indigo)' : 'transparent',
                  color: currentRole === 'deacon' ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: currentRole === 'deacon' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={15} />
                <span>Diácono</span>
              </button>
            )}

            {enableEldershipSystem && (
              <button
                type="button"
                onClick={() => onSelectRole('elder')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '38px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  backgroundColor: currentRole === 'elder' ? '#0d9488' : 'transparent',
                  color: currentRole === 'elder' ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: currentRole === 'elder' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={15} />
                <span>Ancianos</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectRole('pastor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '38px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: currentRole === 'pastor' ? 'var(--accent-emerald)' : 'transparent',
                color: currentRole === 'pastor' ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: currentRole === 'pastor' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Church size={15} />
              <span>Pastor</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('operator')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '38px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: currentRole === 'operator' ? 'var(--accent-rose)' : 'transparent',
                color: currentRole === 'operator' ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: currentRole === 'operator' ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ShieldAlert size={15} />
              <span>Consola HQ</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Barra Inferior Táctil para Móviles (GOLD-289 / D3-B) */}
      <nav aria-label="Navegación móvil" className="mobile-bottom-nav">
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${3 + (enableDeaconSystem ? 1 : 0) + (enableEldershipSystem ? 1 : 0) + 1}, 1fr)`,
          height: '56px',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <button
            type="button"
            onClick={() => onSelectRole('public')}
            className="tap-target-48"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: currentRole === 'public' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              fontWeight: currentRole === 'public' ? 700 : 500,
              fontSize: '0.68rem',
            }}
          >
            <Globe size={18} />
            <span>Público</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRole('member')}
            className="tap-target-48"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: currentRole === 'member' ? 'var(--accent-indigo)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              fontWeight: currentRole === 'member' ? 700 : 500,
              fontSize: '0.68rem',
            }}
          >
            <User size={18} />
            <span>Mi Grupo</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRole('leader')}
            className="tap-target-48"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: currentRole === 'leader' ? 'var(--accent-amber)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              fontWeight: currentRole === 'leader' ? 700 : 500,
              fontSize: '0.68rem',
            }}
          >
            <Compass size={18} />
            <span>Líder</span>
          </button>

          {enableDeaconSystem && (
            <button
              type="button"
              onClick={() => onSelectRole('deacon')}
              className="tap-target-48"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: currentRole === 'deacon' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                fontWeight: currentRole === 'deacon' ? 700 : 500,
                fontSize: '0.68rem',
              }}
            >
              <ShieldCheck size={18} />
              <span>Diácono</span>
            </button>
          )}

          {enableEldershipSystem && (
            <button
              type="button"
              onClick={() => onSelectRole('elder')}
              className="tap-target-48"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: currentRole === 'elder' ? '#0d9488' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                fontWeight: currentRole === 'elder' ? 700 : 500,
                fontSize: '0.68rem',
              }}
            >
              <ShieldCheck size={18} />
              <span>Ancianos</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectRole('pastor')}
            className="tap-target-48"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: currentRole === 'pastor' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              fontWeight: currentRole === 'pastor' ? 700 : 500,
              fontSize: '0.68rem',
            }}
          >
            <Church size={18} />
            <span>Pastor</span>
          </button>
        </div>
      </nav>
    </>
  );
};
