import React, { useState } from 'react';
import { getDeterministicPalette, getMonogram } from './MonogramAvatar';

interface GroupSocialCardProps {
  groupId: string;
  groupName: string;
  purpose: string;
  weekday: number;
  time: string;
  macroZone?: string;
  transitFriendly?: boolean;
  carpoolAvailable?: boolean;
  leaderName?: string | null;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const GroupSocialCard: React.FC<GroupSocialCardProps> = ({
  groupId,
  groupName,
  purpose,
  weekday,
  time,
  macroZone = 'Centro',
  transitFriendly = false,
  carpoolAvailable = false,
  leaderName,
}) => {
  const [copied, setCopied] = useState(false);
  const palette = getDeterministicPalette(groupName);
  const monogram = getMonogram(groupName);
  const dayName = DAYS[weekday] || 'Día de reunión';

  const shareUrl = `${window.location.origin}/#/grupo/${groupId}`;
  const socialPreviewUrl = `/api/groups/${groupId}/social-preview`;

  const shareText = `Te invito a nuestra comunidad pequeña "${groupName}" en Amor y Gracia.\n` +
    `📖 ${purpose}\n` +
    `🗓️ Nos reunimos los ${dayName} a las ${time} (${macroZone}).\n` +
    `${transitFriendly ? '🚌 Transporte accesible disponible.\n' : ''}` +
    `Conoce más y confirma tu visita aquí: ${shareUrl}\n` +
    `(O visítanos el domingo en el Punto de Conexión en el Atrio)`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${groupName} • Amor y Gracia Durango`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid var(--border-color, #334155)',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '480px',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      margin: '0 auto',
    }}>
      {/* Header with Monogram Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          backgroundColor: palette.bg,
          color: palette.text,
          border: `1.5px solid ${palette.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.4rem',
          letterSpacing: '1px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}>
          {monogram}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
            }}>
              📍 {macroZone}
            </span>
            {transitFriendly && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
              }}>
                🚌 Transporte Accesible
              </span>
            )}
            {carpoolAvailable && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
              }}>
                🚗 Carpool
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {groupName}
          </h3>
        </div>
      </div>

      {/* Purpose & Schedule Box */}
      <p style={{
        fontSize: '0.9rem',
        color: '#94a3b8',
        margin: '0 0 16px 0',
        lineHeight: 1.5,
      }}>
        {purpose}
      </p>

      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(51, 65, 85, 0.6)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Horario
          </div>
          <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>
            {dayName} • {time}
          </div>
        </div>
        {leaderName && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Facilitador
            </div>
            <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>
              {leaderName}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={handleShareWhatsApp}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#25D366',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          <span>💬</span> Compartir por WhatsApp
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'rgba(51, 65, 85, 0.6)',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? '✅ Enlace Copiado' : '📋 Copiar Enlace'}
          </button>

          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Más opciones de compartir"
            >
              📤
            </button>
          )}

          <a
            href={socialPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            title="Ver tarjeta Open Graph pública"
          >
            🌐 Vista Previa
          </a>
        </div>
      </div>

      {/* Gentle Onboarding Footer */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(51, 65, 85, 0.4)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b',
        lineHeight: 1.4,
      }}>
        🏛️ También puedes invitarles a conectar primero en el <strong>Punto de Conexión Dominical en el Atrio</strong> antes de la reunión en casa.
      </div>
    </div>
  );
};
