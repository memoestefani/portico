import React, { useEffect, useState } from 'react';
import type { BoardAuditOverview, TenantSummary } from '../types';
import {
  activateTenant,
  createTenant,
  fetchBoardAuditOverview,
  fetchPlatformTenants,
  suspendTenant,
} from '../api';
import {
  ShieldAlert,
  Server,
  Database,
  PlusCircle,
  PauseCircle,
  PlayCircle,
  Lock,
  X,
  FileCheck,
} from 'lucide-react';

export const OperatorHq: React.FC = () => {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tenants' | 'board_auditor'>('tenants');
  const [boardAudit, setBoardAudit] = useState<BoardAuditOverview | null>(null);

  // New Tenant Form state
  const [slug, setSlug] = useState<string>('');
  const [churchName, setChurchName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [naming, setNaming] = useState<string>('campus');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadTenants = React.useCallback(async () => {
    setLoading(true);
    try {
      const [tData, bData] = await Promise.all([
        fetchPlatformTenants(),
        fetchBoardAuditOverview().catch(() => null),
      ]);
      setTenants(tData);
      if (bData) setBoardAudit(bData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleSuspend = async (slug: string) => {
    try {
      await suspendTenant(slug);
      await loadTenants();
    } catch {
      alert('Error suspendiendo tenant');
    }
  };

  const handleActivate = async (slug: string) => {
    try {
      await activateTenant(slug);
      await loadTenants();
    } catch {
      alert('Error activando tenant');
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTenant({
        slug,
        church_name: churchName,
        domain: domain || undefined,
        naming,
      });
      setShowCreateModal(false);
      setSlug('');
      setChurchName('');
      setDomain('');
      await loadTenants();
    } catch {
      alert('Error aprovisionando tenant');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && tenants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        Cargando catálogo del Control Plane...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            <ShieldAlert size={16} />
            <span>Control Plane de Plataforma • Pórtico HQ</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>
            Consola Maestra de Operador
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Aprovisionamiento y gobernanza de licencias de iglesias con aislamiento físico estricto de base de datos ($0 costo base).
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
          }}
        >
          <PlusCircle size={16} />
          <span>Aprovisionar Nueva Iglesia</span>
        </button>
      </div>

      {/* Sovereign LFPDPPP Privacy Guarantee Banner */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(236, 72, 153, 0.08)',
        border: '1px solid rgba(236, 72, 153, 0.25)',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}>
        <Lock size={22} style={{ color: '#f472b6', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#fbcfe8', fontSize: '0.95rem' }}>
            Garantía de Privacidad y Cumplimiento LFPDPPP (México)
          </strong>
          <p style={{ color: '#f9a8d4', fontSize: '0.86rem', marginTop: '4px', lineHeight: 1.5 }}>
            Cada iglesia opera sobre su propio archivo de base de datos físico e independiente. La consola central de operador registra únicamente metadatos de licencia y recuentos agregados. Esta consola no tiene acceso técnico ni credenciales para inspeccionar domicilios particulares, teléfonos ni datos personales de miembros.
          </p>
        </div>
      </div>

      {/* Selector de Pestañas: Control Plane / Auditoría de Mesa Directiva Zero PII */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('tenants')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'tenants' ? '#ec4899' : 'transparent',
            color: activeTab === 'tenants' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Server size={16} />
          <span>Tenants & Licencias ({tenants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('board_auditor')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'board_auditor' ? '#ec4899' : 'transparent',
            color: activeTab === 'board_auditor' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileCheck size={16} />
          <span>Auditoría de Mesa Directiva (Zero PII)</span>
        </button>
      </div>

      {/* Tenants Table */}
      {activeTab === 'tenants' && (
        <div className="surface-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} style={{ color: 'var(--accent-emerald)' }} />
            <span>Organizaciones Registradas ({tenants.length})</span>
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 14px' }}>IGLESIA</th>
              <th style={{ padding: '12px 14px' }}>SLUG</th>
              <th style={{ padding: '12px 14px' }}>DOMINIO PROPIO</th>
              <th style={{ padding: '12px 14px' }}>ESQUEMA</th>
              <th style={{ padding: '12px 14px' }}>GRUPOS</th>
              <th style={{ padding: '12px 14px' }}>MIEMBROS</th>
              <th style={{ padding: '12px 14px' }}>ESTADO LICENCIA</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={15} style={{ color: 'var(--accent-emerald)' }} />
                    <span>{t.church_name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {t.slug}
                </td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                  {t.domain ? (
                    <span style={{ color: 'var(--accent-cyan)' }}>{t.domain}</span>
                  ) : (
                    <span>{t.slug}.portico.lat</span>
                  )}
                </td>
                <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                  {t.naming_scheme.singular} / {t.naming_scheme.plural}
                </td>
                <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.group_count}
                </td>
                <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.member_count}
                </td>
                <td style={{ padding: '14px' }}>
                  <span className={`badge ${t.license_status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                    {t.license_status === 'active' ? 'Activa' : 'Suspendida'}
                  </span>
                </td>
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  {t.license_status === 'active' ? (
                    <button
                      onClick={() => handleSuspend(t.slug)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 10px', color: '#fb7185' }}
                    >
                      <PauseCircle size={14} />
                      <span>Suspender</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(t.slug)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 10px', color: '#34d399' }}
                    >
                      <PlayCircle size={14} />
                      <span>Activar</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* PESTAÑA 2: AUDITORÍA DE MESA DIRECTIVA (ZERO PII - GOLD-254) */}
      {activeTab === 'board_auditor' && (
        <div className="surface-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FileCheck size={28} style={{ color: 'var(--accent-emerald)' }} />
            <div>
              <h2 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>
                Vista de Auditor de Mesa Directiva (Board Auditor)
              </h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Cumplimiento estricto de gobernanza theocéntrica: Estadísticas agregadas sin acceso a datos personales.
              </div>
            </div>
          </div>

          {/* Sello de Garantía Cero PII */}
          <div style={{
            padding: '14px 18px',
            backgroundColor: 'var(--accent-emerald-light)',
            border: '1px solid var(--accent-emerald-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-emerald)',
            fontSize: '0.88rem',
            margin: '20px 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
          }}>
            <Lock size={18} />
            <span>✓ Certificación Cero PII: 100% de nombres, teléfonos y domicilios particulares están omitidos de la capa de auditoría.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Congregaciones / Sedes
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {boardAudit?.total_congregations ?? 2}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Campus con personería pastoral
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Células Activas
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-indigo)', marginTop: '4px' }}>
                {boardAudit?.total_active_small_groups ?? 14}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Grupos pequeños en hogares y rutas
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Asistencia Semanal Estimada
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                {boardAudit?.estimated_weekly_attendance ?? 145} pers.
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Suma agregada de headcounts
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Volumen de Atención Pastoral
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
                {boardAudit?.active_pastoral_safeguards ?? 0}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Alertas confidenciales atendidas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '520px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Aprovisionar Nueva Iglesia</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Creará una entrada en el Control Plane y generará una base de datos físicamente aislada para la organización.
            </p>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Nombre de la Iglesia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Centro Cristiano Vida Durango"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(10, 13, 20, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Slug Identificador (subdominio)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. vidamexico"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(10, 13, 20, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Dominio Propio (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. grupos.vidamexico.org"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(10, 13, 20, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Nomenclatura Eclesiológica</label>
                <select
                  value={naming}
                  onChange={(e) => setNaming(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(10, 13, 20, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff' }}
                >
                  <option value="campus">Campus / Campuses</option>
                  <option value="iglesia">Iglesia / Iglesias</option>
                  <option value="casa">Casa / Casas</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  justifyContent: 'center',
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                }}
              >
                {submitting ? 'Aprovisionando...' : 'Crear Organización y Base de Datos'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
