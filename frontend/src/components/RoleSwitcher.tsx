import React, { useState, useEffect } from 'react';
import type { RoleMode } from '../types';
import { ChurchBrandLogo } from './ChurchBrandLogo';

interface Props {
  currentRole: RoleMode;
  onSelectRole: (role: RoleMode) => void;
  churchName?: string;
  enableDeaconSystem?: boolean;
  enableEldershipSystem?: boolean;
}

interface DockItem {
  id: string;
  label: string;
  role: RoleMode;
}

export const RoleSwitcher: React.FC<Props> = ({
  currentRole,
  onSelectRole,
  churchName,
  enableDeaconSystem = true,
  enableEldershipSystem = true,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const urlTheme = new URLSearchParams(window.location.search).get('theme');
      if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
    }
    const saved = localStorage.getItem('portico_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false);

  // Cargar accesos personalizados de usuario desde localStorage
  const [customDock, setCustomDock] = useState<string[] | null>(() => {
    try {
      const saved = localStorage.getItem('portico_custom_dock');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isDevMode = typeof window !== 'undefined' &&
    (import.meta.env.DEV || window.location.search.includes('dev=true'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('portico_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Diccionario de todas las superficies disponibles
  const availableItems: DockItem[] = [
    { id: 'public', label: 'Pórtico Público', role: 'public' },
    { id: 'member', label: 'Mi Perfil', role: 'member' },
    { id: 'leader', label: 'Líder', role: 'leader' },
    ...(enableDeaconSystem ? [{ id: 'deacon', label: 'Acompañamiento', role: 'deacon' as RoleMode }] : []),
    ...(enableEldershipSystem ? [{ id: 'elder', label: 'Presbiterio', role: 'elder' as RoleMode }] : []),
    { id: 'pastor', label: 'Radar Pastoral', role: 'pastor' },
    { id: 'operator', label: 'Consola HQ', role: 'operator' },
  ];

  // Determinar los 3 items activos del dock
  const getActiveDockItems = (): DockItem[] => {
    if (customDock && customDock.length >= 2) {
      const items = customDock
        .map((id) => availableItems.find((item) => item.id === id))
        .filter((item): item is DockItem => item !== undefined);
      if (items.length >= 2) return items.slice(0, 4);
    }

    // Default adaptativo de 3 accesos según el rol actual
    switch (currentRole) {
      case 'leader':
        return [
          { id: 'leader', label: 'Líder', role: 'leader' },
          { id: 'member', label: 'Mi Perfil', role: 'member' },
          { id: 'public', label: 'Pórtico Público', role: 'public' },
        ];
      case 'deacon':
        return [
          { id: 'deacon', label: 'Acompañamiento', role: 'deacon' },
          { id: 'member', label: 'Mi Perfil', role: 'member' },
          { id: 'public', label: 'Pórtico Público', role: 'public' },
        ];
      case 'elder':
        return [
          { id: 'elder', label: 'Presbiterio', role: 'elder' },
          ...(enableDeaconSystem ? [{ id: 'deacon', label: 'Diaconado', role: 'deacon' as RoleMode }] : []),
          { id: 'member', label: 'Mi Perfil', role: 'member' },
        ];
      case 'pastor':
        return [
          { id: 'pastor', label: 'Radar Pastoral', role: 'pastor' },
          { id: 'public', label: 'Pórtico Público', role: 'public' },
          { id: 'leader', label: 'Líderes', role: 'leader' },
        ];
      case 'operator':
        return [
          { id: 'operator', label: 'Consola HQ', role: 'operator' },
          { id: 'pastor', label: 'Radar', role: 'pastor' },
          { id: 'public', label: 'Pórtico Público', role: 'public' },
        ];
      case 'member':
        return [
          { id: 'member', label: 'Mi Perfil', role: 'member' },
          { id: 'public', label: 'Pórtico Público', role: 'public' },
          { id: 'leader', label: 'Líder', role: 'leader' },
        ];
      case 'public':
      default:
        return [
          { id: 'public', label: 'Pórtico Público', role: 'public' },
          { id: 'member', label: 'Mi Perfil', role: 'member' },
          { id: 'leader', label: 'Líder', role: 'leader' },
        ];
    }
  };

  const activeDockItems = getActiveDockItems();

  const handleSaveCustomDock = (selectedIds: string[]) => {
    setCustomDock(selectedIds);
    localStorage.setItem('portico_custom_dock', JSON.stringify(selectedIds));
    setShowCustomizeModal(false);
  };

  const handleResetCustomDock = () => {
    setCustomDock(null);
    localStorage.removeItem('portico_custom_dock');
    setShowCustomizeModal(false);
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}>
        {/* Identidad Institucional Agnóstica de Ciudad (D3 / GOLD-352) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ChurchBrandLogo size={28} variant="icon" />
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              {churchName || 'Amor y Gracia'}
            </div>
            <div style={{
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em',
            }}>
              Comunidades y Vida en Hogares
            </div>
          </div>
        </div>

        {/* Controles de Navegación y Conmutador de Modo Solar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Conmutador de Modo Claro / Oscuro (Sin íconos) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          {/* Navegación Desktop */}
          {isDevMode && (
            <nav
              aria-label="Navegación de escritorio"
              className="hide-scrollbar desktop-nav"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-primary)',
                padding: '3px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                gap: '3px',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectRole('public')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: currentRole === 'public' ? 700 : 500,
                  backgroundColor: currentRole === 'public' ? 'var(--text-primary)' : 'transparent',
                  color: currentRole === 'public' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Público
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('member')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: currentRole === 'member' ? 700 : 500,
                  backgroundColor: currentRole === 'member' ? 'var(--accent-indigo)' : 'transparent',
                  color: currentRole === 'member' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Mi Perfil
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('leader')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: currentRole === 'leader' ? 700 : 500,
                  backgroundColor: currentRole === 'leader' ? 'var(--accent-amber)' : 'transparent',
                  color: currentRole === 'leader' ? '#161513' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Líder
              </button>

              {enableDeaconSystem && (
                <button
                  type="button"
                  onClick={() => onSelectRole('deacon')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: currentRole === 'deacon' ? 700 : 500,
                    backgroundColor: currentRole === 'deacon' ? 'var(--accent-indigo)' : 'transparent',
                    color: currentRole === 'deacon' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Diácono
                </button>
              )}

              {enableEldershipSystem && (
                <button
                  type="button"
                  onClick={() => onSelectRole('elder')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: currentRole === 'elder' ? 700 : 500,
                    backgroundColor: currentRole === 'elder' ? '#0d9488' : 'transparent',
                    color: currentRole === 'elder' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Ancianos
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectRole('pastor')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: currentRole === 'pastor' ? 700 : 500,
                  backgroundColor: currentRole === 'pastor' ? 'var(--accent-emerald)' : 'transparent',
                  color: currentRole === 'pastor' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Pastor
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('operator')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: currentRole === 'operator' ? 700 : 500,
                  backgroundColor: currentRole === 'operator' ? 'var(--accent-terracotta)' : 'transparent',
                  color: currentRole === 'operator' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Consola HQ
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Dock de Pulgar Móvil Adaptativo (D2 / GOLD-351) */}
      <nav
        aria-label="Navegación móvil inferior"
        className="mobile-bottom-nav bottom-tab-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activeDockItems.length + 1}, 1fr)`,
          height: '52px',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          {activeDockItems.map((item) => {
            const isActive = currentRole === item.role;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectRole(item.role)}
                className="tap-target-48"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px 4px',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.76rem',
                  height: '100%',
                }}
              >
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Botón de Ajuste / Personalización del Dock */}
          <button
            type="button"
            onClick={() => setShowCustomizeModal(true)}
            className="tap-target-48"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 4px',
              fontWeight: 500,
              fontSize: '0.72rem',
              height: '100%',
            }}
          >
            <span>Ajustes</span>
          </button>
        </div>
      </nav>

      {/* Píldora Flotante Mínima para Desarrollo Local (?dev=true) */}
      {isDevMode && (
        <div style={{
          position: 'fixed',
          bottom: '62px',
          left: '12px',
          zIndex: 95,
        }}>
          <button
            type="button"
            id="btn-dev-role-pill"
            onClick={() => setShowDevModal(true)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-card)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Dev: Cambiar Rol ({currentRole})
          </button>
        </div>
      )}

      {/* Modal Dev: Conmutador de Roles */}
      {showDevModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowDevModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: 'var(--shadow-elevated)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Selector de Superficie de Desarrollo
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {availableItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectRole(item.role);
                    setShowDevModal(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: currentRole === item.role ? '2px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                    backgroundColor: currentRole === item.role ? 'var(--accent-rose-light)' : 'var(--bg-primary)',
                    color: currentRole === item.role ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                    fontWeight: currentRole === item.role ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowDevModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Personalización de Accesos Rápidos de Usuario (D2-A) */}
      {showCustomizeModal && (
        <CustomizeDockModal
          availableItems={availableItems}
          currentCustom={customDock || activeDockItems.map((i) => i.id)}
          onSave={handleSaveCustomDock}
          onReset={handleResetCustomDock}
          onClose={() => setShowCustomizeModal(false)}
        />
      )}
    </>
  );
};

interface CustomizeModalProps {
  availableItems: DockItem[];
  currentCustom: string[];
  onSave: (ids: string[]) => void;
  onReset: () => void;
  onClose: () => void;
}

const CustomizeDockModal: React.FC<CustomizeModalProps> = ({
  availableItems,
  currentCustom,
  onSave,
  onReset,
  onClose,
}) => {
  const [selected, setSelected] = useState<string[]>(currentCustom);

  const toggleItem = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length <= 2) return; // Mínimo 2 accesos
      setSelected(selected.filter((item) => item !== id));
    } else {
      if (selected.length >= 4) return; // Máximo 4 accesos
      setSelected([...selected, id]);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-elevated)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Personalizar Barra de Accesos
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Selecciona de 2 a 4 accesos directos para tu barra inferior según tus actividades cotidianas.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {availableItems.map((item) => {
            const isChecked = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: isChecked ? '2px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                  backgroundColor: isChecked ? 'var(--accent-rose-light)' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontWeight: isChecked ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{item.label}</span>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: isChecked ? 'var(--accent-terracotta)' : 'var(--text-muted)',
                }}>
                  {isChecked ? 'Fijado' : 'Disponible'}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onReset}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Restablecer
          </button>
          <button
            type="button"
            onClick={() => onSave(selected)}
            style={{
              flex: 2,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Guardar Barra ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
};
