import React, { useState } from 'react';
import { BookOpen, ShieldAlert, FileText } from 'lucide-react';

interface InstitutionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchName?: string;
}

type TabType = 'sostenemos' | 'no_sostenemos' | 'privacidad';

export const InstitutionalModal: React.FC<InstitutionalModalProps> = ({
  isOpen,
  onClose,
  churchName = 'Nuestra Iglesia',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sostenemos');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: '#6366f1',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Marco Institucional & Legal
            </span>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: 800 }}>
              {churchName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '9999px',
              width: '2.25rem',
              height: '2.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: '#64748b',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          >
            ×
          </button>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            padding: '0.5rem 1.75rem 0',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('sostenemos')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'sostenemos' ? '3px solid #4f46e5' : '3px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'sostenemos' ? 700 : 500,
              color: activeTab === 'sostenemos' ? '#4f46e5' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.925rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <BookOpen size={16} />
            <span>Principios y Doctrina</span>
          </button>
          <button
            onClick={() => setActiveTab('no_sostenemos')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'no_sostenemos' ? '3px solid #dc2626' : '3px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'no_sostenemos' ? 700 : 500,
              color: activeTab === 'no_sostenemos' ? '#dc2626' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.925rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldAlert size={16} />
            <span>Prácticas que Rechazamos</span>
          </button>
          <button
            onClick={() => setActiveTab('privacidad')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'privacidad' ? '3px solid #059669' : '3px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'privacidad' ? 700 : 500,
              color: activeTab === 'privacidad' ? '#059669' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.925rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={16} />
            <span>Aviso de Privacidad (LFPDPPP)</span>
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            fontSize: '0.95rem',
            lineHeight: 1.65,
            color: '#334155',
          }}
        >
          {activeTab === 'sostenemos' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#1e1b4b', fontWeight: 700, fontSize: '1.15rem' }}>
                Nuestra Confesión y Compromiso Eclesial
              </h3>
              <p>
                En <strong>{churchName}</strong> creemos que la Iglesia es una familia de discípulos llamada
                a reflejar la gracia redentora de Jesucristo tanto en las reuniones de congregación como en los
                hogares y mesas compartidas.
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: '1rem 0' }}>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>La Autoridad de las Escrituras:</strong> La Biblia es la Palabra inspirada, infalible y suficiente de Dios, norma final para toda doctrina y práctica comunitaria.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Comunidad Auténtica y Presencial:</strong> Creemos en el pastoreo relacional encarnado. Las herramientas eclesiales sirven a la hospitalidad física y al cuidado mutuo, nunca al aislamiento ni a la despersonalización.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Hospitalidad Bíblica:</strong> Las puertas de nuestros Grupos Pequeños están abiertas para estudiar la Palabra, orar los unos por los otros y compartir el pan con sencillez de corazón (Hechos 2:46).
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Delegación Saludable (Jetro 1:10):</strong> Valoramos el cuidado de cada persona en grupos a escala humana (10 a 15 miembros) evitando el agotamiento de los líderes.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'no_sostenemos' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#7f1d1d', fontWeight: 700, fontSize: '1.15rem' }}>
                Límites Doctrinales y Salvaguardas Pastorales
              </h3>
              <p>
                Para la protección de las ovejas y la gloria del Evangelio, afirmamos con claridad aquello que
                rechazamos y no toleramos en la vida de nuestros grupos:
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: '1rem 0' }}>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>No Sostenemos el Evangelio de la Prosperidad:</strong> Rechazamos la doctrina que comercializa la fe prometiendo riqueza terrenal a cambio de dádivas o manipulación emocional.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>No Sostenemos el Legalismo ni el Control Autoritario:</strong> Ningún líder de grupo tiene autoridad para interferir en decisiones personales, matrimoniales o financieras de los miembros. Cristianos maduros pastorean con mansedumbre, no con coacción.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>No Sostenemos el Culto a la Personalidad:</strong> Ningún maestro, líder o pastor es mediador entre Dios y los hombres; únicamente Jesucristo.
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>No Sostenemos la Vigilancia ni el Espionaje Digital:</strong> Los reportes pastorales son meramente agregados numéricos para velar por la salud general; jamás se somete a los miembros a listas negras, pases de lista nominales o escrutinio de ausencias.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'privacidad' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#064e3b', fontWeight: 700, fontSize: '1.15rem' }}>
                Aviso de Privacidad Integral (LFPDPPP - México)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1rem' }}>
                Con fundamento en los artículos 15, 16, 17 y demás relativos de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
              </p>
              <p>
                <strong>1. Identidad y Domicilio del Responsable:</strong> {churchName}, con domicilio para efectos legales y atención de privacidad en Durango, México, es responsable del tratamiento legítimo y confidencial de sus datos personales.
              </p>
              <p>
                <strong>2. Datos Personales Recabados:</strong> Nombre completo, número telefónico (WhatsApp) y correo electrónico. <em>Bajo ninguna circunstancia recabamos datos biométricos, financieros o sensibles innecesarios.</em>
              </p>
              <p>
                <strong>3. Protección de Domicilios Particulares:</strong> Las direcciones de hogares de anfitriones jamás se indexan públicamente ni se almacenan en almacenamiento persistente del navegador (localStorage/sessionStorage). Se sirven exclusivamente en memoria volátil de sesión autenticada con cabeceras estrictas <code>Cache-Control: no-store</code>.
              </p>
              <p>
                <strong>4. Sanitización Automática de Metadatos:</strong> Toda fotografía comunitaria subida a la plataforma es despojada al 100% de metadatos EXIF y coordenadas satelitales GPS antes de ser almacenada.
              </p>
              <p>
                <strong>5. Derechos ARCO:</strong> Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos escribiendo al correo <strong>privacidad@amorygracia.mx</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
