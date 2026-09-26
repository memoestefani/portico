import React, { useEffect, useState } from 'react';
import type { RoleMode, ChurchConfiguration } from './types';
import { RoleSwitcher } from './components/RoleSwitcher';
import { PublicPortal } from './components/PublicPortal';
import { MemberSilo } from './components/MemberSilo';
import { PastorHud } from './components/PastorHud';
import { DeaconDesk } from './components/DeaconDesk';
import { ElderDesk } from './components/ElderDesk';
import { OperatorHq } from './components/OperatorHq';
import { ShieldCheck, WifiOff, Scale } from 'lucide-react';
import { InstitutionalModal } from './components/InstitutionalModal';
import { fetchChurchConfig } from './api';

export const App: React.FC = () => {
  const [role, setRole] = useState<RoleMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role') as RoleMode;
      if (['public', 'member', 'leader', 'deacon', 'elder', 'pastor', 'operator'].includes(urlRole)) {
        return urlRole;
      }
    }
    return 'public';
  });
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [churchConfig, setChurchConfig] = useState<ChurchConfiguration | null>(null);

  useEffect(() => {
    fetchChurchConfig().then(setChurchConfig).catch(() => {});
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Banner de Contingencia Fuera de Línea (GOLD-237 / Decisión 8-C) */}
      {!isOnline && (
        <div style={{
          backgroundColor: 'var(--accent-amber)',
          color: '#1a1400',
          padding: '8px 16px',
          fontSize: '0.84rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <WifiOff size={16} />
          <span>Modo sin conexión: La información consultada previamente sigue disponible en este dispositivo.</span>
        </div>
      )}

      {/* Barra de Identidad Eclesial & Conmutador de Superficies (GOLD-228 / Decisión 14-C) */}
      <RoleSwitcher
        currentRole={role}
        onSelectRole={setRole}
        churchName="Amor y Gracia Durango"
        enableDeaconSystem={churchConfig?.enable_deacon_system ?? true}
        enableEldershipSystem={churchConfig?.enable_eldership_system ?? true}
      />

      {/* Main Surface Body */}
      <main className="pb-mobile-nav" style={{ flex: 1 }}>
        {role === 'public' && <PublicPortal />}
        {role === 'member' && <MemberSilo isLeaderView={false} />}
        {role === 'leader' && <MemberSilo isLeaderView={true} />}
        {role === 'deacon' && <DeaconDesk />}
        {role === 'elder' && <ElderDesk />}
        {role === 'pastor' && <PastorHud />}
        {role === 'operator' && <OperatorHq />}
      </main>

      {/* Pie Soberano y Cumplimiento Legal LFPDPPP */}
      <footer className="no-print" style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '0.84rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '8px',
          color: 'var(--text-secondary)',
          fontWeight: 600,
        }}>
          <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
          <span>Vida Comunitaria y Grupos</span>
        </div>
        <p style={{ marginBottom: '12px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 12px auto', lineHeight: 1.4 }}>
          Tus datos se quedan en tu iglesia local con estricto apego a las directivas de consentimiento y privacidad de la LFPDPPP (México).
        </p>
        <button
          type="button"
          onClick={() => setShowLegalModal(true)}
          style={{
            backgroundColor: 'var(--accent-indigo-light)',
            border: '1px solid var(--accent-indigo)',
            color: 'var(--accent-indigo)',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all var(--transition-fast)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-indigo)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-indigo-light)';
            e.currentTarget.style.color = 'var(--accent-indigo)';
          }}
        >
          <Scale size={14} />
          <span>Principios • Límites • Aviso de Privacidad (LFPDPPP)</span>
        </button>
      </footer>

      {/* Modal Institucional Unificado de 3 Pestañas */}
      <InstitutionalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        churchName="Amor y Gracia Durango"
      />
    </div>
  );
};

export default App;
