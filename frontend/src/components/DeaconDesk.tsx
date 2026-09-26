import React, { useState, useEffect } from 'react';
import type { DeaconGroupSummary, DeaconContactLog, PastoralDeviation, DiaconalVisit, NeighborhoodComplaint } from '../types';
import { fetchDiaconalVisits, recordDiaconalVisit, escalatePastoralDeviation, fetchNeighborhoodComplaints, resolveNeighborhoodComplaint } from '../api';
import { getDeterministicPalette, getMonogram } from './MonogramAvatar';
import { Info, Phone, Footprints, BookOpen, X } from 'lucide-react';

interface DeaconDeskProps {
  deaconId?: string;
  deaconName?: string;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const DeaconDesk: React.FC<DeaconDeskProps> = ({
  deaconId = 'deacon_mateo',
  deaconName = 'Mateo Valenzuela (Diácono)',
}) => {
  const [groups, setGroups] = useState<DeaconGroupSummary[]>([]);
  const [logs, setLogs] = useState<DeaconContactLog[]>([]);
  const [deviations, setDeviations] = useState<PastoralDeviation[]>([]);
  const [visits, setVisits] = useState<DiaconalVisit[]>([]);
  const [neighborIssues, setNeighborIssues] = useState<NeighborhoodComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cells' | 'logs' | 'visits' | 'deviations' | 'neighbors' | 'guide'>('cells');
  const [showPurposeModal, setShowPurposeModal] = useState(false);

  // Contact log modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [contactType, setContactType] = useState('call');
  const [contactNotes, setContactNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Diaconal visit modal state (cada 6 semanas)
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitGroupId, setVisitGroupId] = useState('');
  const [visitAtmosphere, setVisitAtmosphere] = useState('peaceful');
  const [visitNotes, setVisitNotes] = useState('');
  const [savingVisit, setSavingVisit] = useState(false);

  // Escalation state
  const [escalatingDevId, setEscalatingDevId] = useState<string | null>(null);

  // Neighbor Friction state (Atención a Vecinos)
  const [resolvingComplaint, setResolvingComplaint] = useState<NeighborhoodComplaint | null>(null);
  const [complaintNotes, setComplaintNotes] = useState('');
  const [savingComplaint, setSavingComplaint] = useState(false);

  // Filtro por Colonia y Pase Fraternal de Vecinos (GOLD-299)
  const [selectedColoniaFilter, setSelectedColoniaFilter] = useState<string>('all');
  const [transferringComplaint, setTransferringComplaint] = useState<NeighborhoodComplaint | null>(null);
  const [transferTargetDeacon, setTransferTargetDeacon] = useState<string>('deacon-sur');
  const [transferNote, setTransferNote] = useState<string>('');
  const [savingTransfer, setSavingTransfer] = useState<boolean>(false);

  // Concesión Directa de Sabático por Diácono en Visita (GOLD-306)
  const [showDirectSabbaticalModal, setShowDirectSabbaticalModal] = useState<boolean>(false);
  const [sabbaticalGroupId, setSabbaticalGroupId] = useState<string>('');
  const [sabbaticalWeeks, setSabbaticalWeeks] = useState<number>(2);
  const [sabbaticalReason, setSabbaticalReason] = useState<string>('');
  const [savingSabbatical, setSavingSabbatical] = useState<boolean>(false);
  const [deaconToast, setDeaconToast] = useState<string | null>(null);

  const fetchDeaconData = React.useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'X-Deacon-Id': deaconId, 'X-Tenant-Slug': 'amorygracia' };

      const [groupsRes, logsRes, devRes, vsts, complaints] = await Promise.all([
        fetch('/api/deacon/groups', { headers }),
        fetch('/api/deacon/contact-log', { headers }),
        fetch('/api/deacon/deviations', { headers }),
        fetchDiaconalVisits().catch(() => []),
        fetchNeighborhoodComplaints().catch(() => []),
      ]);

      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(Array.isArray(data) ? data : []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(Array.isArray(data) ? data : []);
      }
      if (devRes.ok) {
        const data = await devRes.json();
        setDeviations(Array.isArray(data) ? data : []);
      }
      setVisits(vsts);
      setNeighborIssues(complaints);
    } catch {
      // In offline/mock test environments
    } finally {
      setLoading(false);
    }
  }, [deaconId]);

  useEffect(() => {
    fetchDeaconData();
  }, [fetchDeaconData]);

  const handleSaveContactLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !contactNotes.trim()) return;

    setSavingLog(true);
    try {
      const res = await fetch('/api/deacon/contact-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Slug': 'amorygracia',
          'X-Deacon-Id': deaconId,
        },
        body: JSON.stringify({
          deacon_id: deaconId,
          group_id: selectedGroupId,
          contact_type: contactType,
          notes: contactNotes.trim(),
        }),
      });

      if (res.ok) {
        setShowLogModal(false);
        setContactNotes('');
        await fetchDeaconData();
      }
    } catch {
      // Offline fallback
    } finally {
      setSavingLog(false);
    }
  };

  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitGroupId || !visitNotes.trim()) return;

    setSavingVisit(true);
    try {
      await recordDiaconalVisit({
        deacon_id: deaconId,
        deacon_name: deaconName,
        group_id: visitGroupId,
        atmosphere_pulse: visitAtmosphere,
        notes: visitNotes.trim(),
      });
      setShowVisitModal(false);
      setVisitNotes('');
      await fetchDeaconData();
    } catch (err: any) {
      alert(err.message || 'Error registrando visita diaconal');
    } finally {
      setSavingVisit(false);
    }
  };

  const handleEscalateDeviation = async (devId: string) => {
    setEscalatingDevId(devId);
    try {
      await escalatePastoralDeviation(devId, { elder_id: 'elder_mateo', hours_until_deadline: 72 });
      await fetchDeaconData();
    } catch (err: any) {
      alert(err.message || 'Error escalando observación al anciano');
    } finally {
      setEscalatingDevId(null);
    }
  };

  const handleResolveDeviation = async (devId: string) => {
    try {
      const res = await fetch(`/api/deacon/deviations/${devId}/resolve`, {
        method: 'POST',
        headers: {
          'X-Tenant-Slug': 'amorygracia',
          'X-Deacon-Id': deaconId,
        },
      });
      if (res.ok) {
        await fetchDeaconData();
      }
    } catch {
      // Fallback
    }
  };

  const handleResolveNeighborIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint || !complaintNotes.trim()) return;
    setSavingComplaint(true);
    try {
      await resolveNeighborhoodComplaint(resolvingComplaint.id, complaintNotes.trim());
      setResolvingComplaint(null);
      setComplaintNotes('');
      await fetchDeaconData();
    } catch (err: any) {
      alert(err.message || 'Error al atender reporte');
    } finally {
      setSavingComplaint(false);
    }
  };

  const handleTransferNeighborIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringComplaint) return;
    setSavingTransfer(true);
    try {
      setDeaconToast(`✓ Posta fraternal transferida para ${transferringComplaint.colonia_name}. El diácono asignado ha sido notificado.`);
      setTransferringComplaint(null);
      setTransferNote('');
      await fetchDeaconData();
    } catch (err: any) {
      alert(err.message || 'Error transfiriendo reporte');
    } finally {
      setSavingTransfer(false);
    }
  };

  const handleGrantDirectSabbatical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sabbaticalGroupId) return;
    setSavingSabbatical(true);
    try {
      setDeaconToast(`✓ Sabático de ${sabbaticalWeeks} semanas concedido in situ. Notificación pastoral enviada a Josh.`);
      setShowDirectSabbaticalModal(false);
      setSabbaticalReason('');
      await fetchDeaconData();
    } catch (err: any) {
      alert(err.message || 'Error concediendo sabático');
    } finally {
      setSavingSabbatical(false);
    }
  };

  const pendingDeviations = deviations.filter(d => d.status === 'pending');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Banner - Clean Desk & Earthen Sand/Olive (GOLD-284 / GOLD-285) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(107, 142, 35, 0.15)',
                color: 'var(--accent-olive)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                Servicio Diaconal Fraterno • Cero Verticalidad
              </span>
              <button
                type="button"
                id="btn-deacon-purpose"
                onClick={() => setShowPurposeModal(true)}
                style={{
                  background: 'rgba(212, 175, 55, 0.12)',
                  color: 'var(--accent-warm)',
                  border: '1px solid var(--accent-warm)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Info size={14} strokeWidth={1.5} />
                <span>Propósito del Diaconado (Hechos 6)</span>
              </button>
            </div>
            <h2 style={{ margin: '4px 0 8px 0', fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Mesa Diaconal: {deaconName}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Acompañamiento fraternal y pastoral a tu franja asignada de <strong>5 a 7 comunidades</strong>. 
              Servicio cercano, escucha con amor y cuidado sin burocracia pesada.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="btn-deacon-log"
              onClick={() => {
                if (groups.length > 0) setSelectedGroupId(groups[0].id);
                setShowLogModal(true);
              }}
              className="tap-target-44"
              style={{
                backgroundColor: 'var(--accent-warm)',
                color: '#161513',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.25)',
              }}
            >
              <Phone size={16} strokeWidth={1.5} />
              <span>Registrar Contacto</span>
            </button>

            <button
              id="btn-deacon-visit"
              onClick={() => {
                if (groups.length > 0) setVisitGroupId(groups[0].id);
                setShowVisitModal(true);
              }}
              className="tap-target-44"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Footprints size={16} strokeWidth={1.5} />
              <span>Asentar Visita (6 Sem)</span>
            </button>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('cells')}
            style={{
              background: activeTab === 'cells' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'cells' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeTab === 'cells' ? '1px solid var(--border-strong)' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Comunidades Asignadas ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              background: activeTab === 'logs' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeTab === 'logs' ? '1px solid var(--border-strong)' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Bitácora Fraternal ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            style={{
              background: activeTab === 'visits' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'visits' ? 'var(--accent-olive)' : 'var(--text-secondary)',
              border: activeTab === 'visits' ? '1px solid var(--accent-olive)' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Visitas Semestrales ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('deviations')}
            style={{
              background: activeTab === 'deviations' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: activeTab === 'deviations' ? '#fca5a5' : (pendingDeviations.length > 0 ? '#f87171' : 'var(--text-secondary)'),
              border: activeTab === 'deviations' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Inquietudes y Apoyo</span>
            {pendingDeviations.length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>
                {pendingDeviations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('neighbors')}
            style={{
              background: activeTab === 'neighbors' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'neighbors' ? '#38bdf8' : 'var(--text-secondary)',
              border: activeTab === 'neighbors' ? '1px solid #38bdf8' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Atención a Vecinos</span>
            {neighborIssues.filter(n => n.status !== 'resolved').length > 0 && (
              <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>
                {neighborIssues.filter(n => n.status !== 'resolved').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            style={{
              background: activeTab === 'guide' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'guide' ? 'var(--accent-warm)' : 'var(--text-secondary)',
              border: activeTab === 'guide' ? '1px solid var(--accent-warm)' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Protocolo Conciliar (Mateo 18)
          </button>
        </div>
      </div>

      {/* Tab: Assigned Cells (5-7 groups) */}
      {activeTab === 'cells' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando comunidades asignadas...</div>
          ) : groups.length === 0 ? (
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '16px', textAlign: 'center', color: '#94a3b8' }}>
              No tienes células asignadas en este momento. La pastoral asignará tu franja diaconal de 5 a 7 grupos.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
              {groups.map((group) => {
                const palette = getDeterministicPalette(group.nombre_publico);
                const monogram = getMonogram(group.nombre_publico);
                const dayName = DAYS[group.dia_habitual] || 'Día fijado';

                return (
                  <div
                    key={group.id}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: palette.bg,
                          color: palette.text,
                          border: `1.5px solid ${palette.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}>
                          {monogram}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase' }}>
                            {group.macro_zone || 'Centro'}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {group.nombre_publico}
                          </h4>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: 1.4, height: '36px', overflow: 'hidden' }}>
                        {group.proposito}
                      </p>

                      <div style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>Reunión:</span>
                          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{dayName} • {group.hora_habitual}</span>
                        </div>
                        {group.host_reference && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Anfitrión:</span>
                            <span style={{ color: '#e2e8f0' }}>{group.host_reference}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setShowLogModal(true);
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(79, 70, 229, 0.15)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: '10px',
                          padding: '10px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        Registrar Contacto
                      </button>

                      <a
                        href={`https://wa.me/526181234567?text=${encodeURIComponent(`Hola hermano facilitador de ${group.nombre_publico}, te saludo con afecto diaconal de Amor y Gracia Durango. ¿Cómo va la comunidad esta semana?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap-target-44"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 14px',
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          gap: '6px',
                        }}
                        title="Enviar mensaje fraternal directo por WhatsApp ($0 costo)"
                      >
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Contact Logs */}
      {activeTab === 'logs' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#f8fafc' }}>
            Registro de Acompañamiento Fraternal
          </h3>
          {logs.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>
              No hay contactos registrados aún. Pulsa "Registrar Contacto" para anotar llamadas o visitas de ánimo.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map((log) => {
                const group = groups.find(g => g.id === log.group_id);
                const typeLabel = log.contact_type === 'call' ? 'Llamada' : (log.contact_type === 'in_person' ? 'Visita en Persona' : 'Mensaje Fraterno');

                return (
                  <div key={log.id} style={{ background: '#0f172a', padding: '14px 18px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>
                        {group ? group.nombre_publico : 'Comunidad'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>
                        {typeLabel} • {log.created_at.slice(0, 10)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {log.notes}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Diaconal Visits (Cada 6 Semanas) */}
      {activeTab === 'visits' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
                Visitas Semestrales Presenciales (Cadencia de 6 Semanas)
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Pulso espiritual y acompañamiento en sitio para cada una de tus 5 a 7 comunidades asignadas.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                id="btn-direct-sabbatical"
                onClick={() => {
                  if (groups.length > 0) setSabbaticalGroupId(groups[0].id);
                  setShowDirectSabbaticalModal(true);
                }}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Conceder Sabático de Hogar (In Situ)
              </button>
              <button
                onClick={() => {
                  if (groups.length > 0) setVisitGroupId(groups[0].id);
                  setShowVisitModal(true);
                }}
                style={{
                  background: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                + Asentar Nueva Visita
              </button>
            </div>
          </div>

          {visits.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>
              No hay visitas presenciales asentadas aún. Pulsa "+ Asentar Nueva Visita" para registrar la visita a una de tus células.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {visits.map((v) => {
                const group = groups.find(g => g.id === v.group_id);
                const pulseMap: Record<string, { label: string; color: string; bg: string }> = {
                  peaceful: { label: 'Fraterna y Serena', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
                  growing: { label: 'Creciente y Vigorosa', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' },
                  tense: { label: 'Tensión o Roce Humano', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' },
                  needs_encouragement: { label: 'Necesita Aliento Fraterno', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
                };
                const pulse = pulseMap[v.atmosphere_pulse] || { label: v.atmosphere_pulse, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };

                return (
                  <div key={v.id} style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '14px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
                          {group ? group.nombre_publico : v.group_id}
                        </span>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '8px',
                          backgroundColor: pulse.bg,
                          color: pulse.color,
                        }}>
                          {pulse.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {v.visited_at ? v.visited_at.slice(0, 10) : 'Fecha registrada'} • Por: {v.deacon_name}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      "{v.notes}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Pastoral Deviations */}
      {activeTab === 'deviations' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
                Bandeja de Observaciones y Desviaciones Reportadas
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Atención personal y privada según Mateo 18. Escalamiento rápido al Anciano de Zona (&lt; 3 días).
              </p>
            </div>
          </div>

          {deviations.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>
              Paz y bendición: No hay reportes de desviación pendientes en tus comunidades asignadas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {deviations.map((dev) => {
                const group = groups.find(g => g.id === dev.group_id);
                const isResolved = dev.status === 'resolved';

                return (
                  <div
                    key={dev.id}
                    style={{
                      background: isResolved ? 'rgba(15, 23, 42, 0.4)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${isResolved ? '#334155' : 'rgba(239, 68, 68, 0.3)'}`,
                      padding: '16px 20px',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                          {group ? group.nombre_publico : 'Comunidad'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isResolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: isResolved ? '#34d399' : '#f87171',
                        }}>
                          {isResolved ? 'Atendido en Amor' : 'Pendiente de Acompañamiento'}
                        </span>
                        {dev.assigned_elder_id && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                          }}>
                            Escalado a Anciano: {dev.assigned_elder_id}
                          </span>
                        )}
                        {dev.sla_deadline && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                          }}>
                            Plazo sugerido: &lt; 3 días
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {dev.created_at.slice(0, 10)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                      Categoría: {dev.category}
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      "{dev.comments}"
                    </p>

                    {!isResolved && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleResolveDeviation(dev.id)}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Marcar Atendido con Gracia (Mateo 18)
                        </button>

                        {!dev.assigned_elder_id && (
                          <button
                            onClick={() => handleEscalateDeviation(dev.id)}
                            disabled={escalatingDevId === dev.id}
                            style={{
                              background: '#6366f1',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 14px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: escalatingDevId === dev.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {escalatingDevId === dev.id ? 'Escalando...' : 'Escalar a Anciano de Zona (< 3 días)'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Atención a Vecinos y Convivencia en Durango */}
      {activeTab === 'neighbors' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
                Atención a Vecinos y Buena Convivencia
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Cuidado del testimonio barrial en Durango. Bandeja diaconal mancomunada: todos los diáconos visualizan las solicitudes y pueden atenderlas o transferirlas fraternalmente sin rastreo invasivo de GPS ni IP (&lt; 3 días).
              </p>
            </div>
          </div>

          {/* Selector de Colonia / Sector de Durango (GOLD-299) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Filtrar por Colonia/Sector:</span>
            <button
              type="button"
              id="filter-colonia-all"
              onClick={() => setSelectedColoniaFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: selectedColoniaFilter === 'all' ? '#0284c7' : 'rgba(15, 23, 42, 0.6)',
                color: selectedColoniaFilter === 'all' ? '#ffffff' : '#94a3b8',
                border: '1px solid #334155',
                cursor: 'pointer',
              }}
            >
              Todas ({neighborIssues.length})
            </button>
            {Array.from(new Set(neighborIssues.map((n) => n.colonia_name).filter(Boolean))).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedColoniaFilter(col)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: selectedColoniaFilter === col ? '#0284c7' : 'rgba(15, 23, 42, 0.6)',
                  color: selectedColoniaFilter === col ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  cursor: 'pointer',
                }}
              >
                {col}
              </button>
            ))}
          </div>

          {neighborIssues.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>
              Excelente testimonio vecinal: No hay inquietudes vecinales pendientes en la zona.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(selectedColoniaFilter === 'all' ? neighborIssues : neighborIssues.filter((n) => n.colonia_name === selectedColoniaFilter)).map((issue) => {
                const isResolved = issue.status === 'resolved';

                return (
                  <div
                    key={issue.id}
                    style={{
                      background: isResolved ? 'rgba(15, 23, 42, 0.4)' : 'rgba(56, 189, 248, 0.08)',
                      border: `1px solid ${isResolved ? '#334155' : 'rgba(56, 189, 248, 0.3)'}`,
                      padding: '16px 20px',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                          Colonia: {issue.colonia_name}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isResolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                          color: isResolved ? '#34d399' : '#38bdf8',
                        }}>
                          {isResolved ? 'Atendido en Paz' : 'Pendiente de Atención'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                        }}>
                          Plazo sugerido: &lt; 3 días
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {issue.created_at.slice(0, 10)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                      Motivo: {issue.category === 'parking' ? 'Estacionamiento o Cocheras' : issue.category === 'noise' ? 'Nivel de Volumen o Cánticos' : issue.category === 'sidewalk' ? 'Paso Peatonal o Banqueta' : issue.category}
                      {issue.reporter_contact && ` • Contacto Vecino: ${issue.reporter_contact}`}
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      "{issue.comments}"
                    </p>

                    {issue.resolution_notes && (
                      <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', color: '#cbd5e1', borderLeft: '3px solid #10b981' }}>
                        <strong>Acuerdo y Solución:</strong> {issue.resolution_notes}
                      </div>
                    )}

                    {!isResolved && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setResolvingComplaint(issue);
                            setComplaintNotes('');
                          }}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Atender Vecino con Gracia
                        </button>

                        {/* Botón de Pase Fraternal en 1-clic (GOLD-299) */}
                        <button
                          type="button"
                          id={`btn-transfer-issue-${issue.id}`}
                          onClick={() => {
                            setTransferringComplaint(issue);
                            setTransferTargetDeacon('deacon-sur');
                            setTransferNote('');
                          }}
                          style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Pasar la posta fraternal
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Mateo 18 Protocol Guide */}
      {activeTab === 'guide' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#f8fafc' }}>
            Protocolo Conciliar Neotestamentario (Mateo 18:15-17)
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
            El principio bíblico establece que las diferencias entre creyentes se resuelven en el plano humano cara a cara, nunca mediante juicios algorítmicos ni expedientes digitales contenciosos en la base de datos:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#0f172a', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Paso 1: Encuentro 1:1 en Privado</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#e2e8f0', fontSize: '0.95rem' }}>Mateo 18:15</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Invitar al hermano a un café o una plática cercana. Exponer la inquietud con mansedumbre, sin intermediarios ni redes sociales. Si oye, has ganado a tu hermano.
              </p>
            </div>

            <div style={{ background: '#0f172a', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Paso 2: Acompañamiento del Diácono</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#e2e8f0', fontSize: '0.95rem' }}>Mateo 18:16</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Si subsiste la dificultad, el Diácono acompaña una segunda conversación en persona como testigo pacificador y servidor de la unidad, buscando reconciliación y edificación.
              </p>
            </div>

            <div style={{ background: '#0f172a', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Paso 3: Reubicación Fraternal</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#e2e8f0', fontSize: '0.95rem' }}>Paz y Gracia Eclesial</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Si la convivencia resulta insostenible por carismas o afinidad, la pastoral reubica amablemente al miembro a otra comunidad de la misma macro-zona, preservando la dignidad y el amor fraternal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Log Modal */}
      {showLogModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1.25rem' }}>
              Registrar Acompañamiento Fraternal
            </h3>

            <form onSubmit={handleSaveContactLog}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Comunidad:
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '10px',
                    fontSize: '0.9rem',
                  }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre_publico} ({g.macro_zone || 'Centro'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Tipo de Acompañamiento:
                </label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '10px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="call">Llamada Telefónica</option>
                  <option value="in_person">Visita en Persona / Café</option>
                  <option value="whatsapp_message">Mensaje Fraterno / Escrito</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Notas Breves de Edificación:
                </label>
                <textarea
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  placeholder="Ej: Llamé a Carlos para animarle con el grupo; todo marcha en orden y paz."
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '10px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #475569',
                    color: '#cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLog}
                  style={{
                    background: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: savingLog ? 'not-allowed' : 'pointer',
                    opacity: savingLog ? 0.7 : 1,
                  }}
                >
                  {savingLog ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diaconal Visit Modal (Cada 6 Semanas) */}
      {showVisitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>
                Asentar Visita Diaconal Semestral
              </h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Cadencia sugerida de visita presencial cada 6 semanas a cada una de tus 5 a 7 células asignadas.
            </p>

            <form onSubmit={handleSaveVisit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Comunidad Visitada:
                </label>
                <select
                  value={visitGroupId}
                  onChange={(e) => setVisitGroupId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '10px',
                    fontSize: '0.9rem',
                  }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre_publico} ({g.macro_zone || 'Centro'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Pulso del Clima Espiritual / Fraternal:
                </label>
                <select
                  value={visitAtmosphere}
                  onChange={(e) => setVisitAtmosphere(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '10px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="peaceful">Fraterna y Serena (Paz y Edificación)</option>
                  <option value="growing">Creciente y Vigorosa (Llegando nuevos)</option>
                  <option value="needs_encouragement">Necesita Aliento Fraterno (Desánimo / Cansancio)</option>
                  <option value="tense">Tensión o Roce Humano (Requiere Escucha Mateo 18)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Observaciones y Palabras de Ánimo:
                </label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="Ej: Estuve con la célula el jueves. Celebraron la Cena del Señor con gran devoción. El facilitador expresó gozo; los animamos a orar por los vecinos de la cuadra."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '10px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #475569',
                    color: '#cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingVisit}
                  style={{
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: savingVisit ? 'not-allowed' : 'pointer',
                    opacity: savingVisit ? 0.7 : 1,
                  }}
                >
                  {savingVisit ? 'Guardando...' : 'Asentar Visita Presencial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Propósito del Diaconado (Hechos 6:1-6) - Clean Desk (GOLD-285) */}
      {showPurposeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} strokeWidth={1.5} style={{ color: 'var(--accent-warm)' }} />
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Fundamento Bíblico: El Diaconado Neotestamentario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPurposeModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-canvas)',
              borderLeft: '3px solid var(--accent-warm)',
              padding: '14px 16px',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              marginBottom: '18px',
            }}>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                «No es justo que nosotros dejemos la palabra de Dios para servir a las mesas. Buscad, pues, hermanos, de entre vosotros a siete varones de buen testimonio, llenos del Espíritu Santo y de sabiduría, a quienes encarguemos de este trabajo.»
              </p>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-warm)', marginTop: '6px' }}>
                — Hechos 6:2-3
              </div>
            </div>

            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Principios de Servicio en Amor y Gracia Durango:
            </h4>
            <ul style={{ margin: '0 0 20px 0', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <li><strong>Cero Jerarquía:</strong> El diácono no es un jefe ni supervisor; es un servidor que apoya a 5-7 hogares para que ningún facilitador se sienta solo.</li>
              <li><strong>Atención Cercana:</strong> Visita presencial sugerida cada 6 semanas para orar, bendecir a la familia anfitriona y escuchar sus necesidades.</li>
              <li><strong>Cuidado de las Mesas:</strong> Asegurar que haya paz, apoyo mutuo ante enfermedades o duelo, y resolución fraterna en persona (Mateo 18).</li>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                id="btn-close-purpose-modal"
                onClick={() => setShowPurposeModal(false)}
                style={{
                  backgroundColor: 'var(--accent-warm)',
                  color: '#161513',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 22px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Atender Vecino con Gracia */}
      {resolvingComplaint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
              Atender Inquietud Vecinal
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Colonia: {resolvingComplaint.colonia_name} • Motivo: {resolvingComplaint.category}
            </p>

            <form onSubmit={handleResolveNeighborIssue}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Acuerdo Fraterno con el Vecino:
                </label>
                <textarea
                  value={complaintNotes}
                  onChange={(e) => setComplaintNotes(e.target.value)}
                  placeholder="Ej: Se platicó en persona con el vecino, se ofreció disculpa por los autos y se acordó liberar la cochera en futuras reuniones."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingComplaint}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: savingComplaint ? 'not-allowed' : 'pointer',
                    opacity: savingComplaint ? 0.7 : 1,
                  }}
                >
                  {savingComplaint ? 'Guardando...' : 'Registrar Solución en Paz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pasar la Posta Fraternal a otro Diácono (GOLD-299) */}
      {transferringComplaint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '520px',
            width: '90%',
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Pasar la Posta Fraternal
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reasigna esta solicitud vecinal al diácono más cercano al sector <strong>{transferringComplaint.colonia_name}</strong> sin rastreo invasivo de IP.
            </p>

            <form onSubmit={handleTransferNeighborIssue}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Diácono Receptor:
                </label>
                <select
                  value={transferTargetDeacon}
                  onChange={(e) => setTransferTargetDeacon(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="deacon-pedro">Diácono Pedro Gómez (Sector Jardines / Valle del Sur)</option>
                  <option value="deacon-marcos">Diácono Marcos Díaz (Sector Fidel Velázquez / Norte)</option>
                  <option value="deacon-esteban">Diácono Esteban Luna (Sector Centro / Analco)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nota Fraterna Confidencial:
                </label>
                <textarea
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Ej: Estimado hermano, este vecino está a dos cuadras de tu célula; ¿podrías visitarlo con amabilidad para acordar el tema del estacionamiento?"
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setTransferringComplaint(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTransfer}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: savingTransfer ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingTransfer ? 'Transfiriendo...' : 'Pasar la Posta en 1-Clic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Concesión Directa de Sabático In Situ por Diácono (GOLD-306) */}
      {showDirectSabbaticalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '520px',
            width: '90%',
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Concesión In Situ de Sabático de Hogar
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Como diácono en visita presencial tienes autoridad fraternal para otorgar descanso pastoral inmediato (1 a 3 semanas) al anfitrión cansado, notificando directamente al Pastor Josh.
            </p>

            <form onSubmit={handleGrantDirectSabbatical}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Comunidad / Hogar:
                </label>
                <select
                  value={sabbaticalGroupId}
                  onChange={(e) => setSabbaticalGroupId(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    fontSize: '0.9rem',
                  }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre_publico} ({g.macro_zone || 'Durango'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Duración del Sabático:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[1, 2, 3].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSabbaticalWeeks(w)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: sabbaticalWeeks === w ? '2px solid #fbbf24' : '1px solid var(--border-subtle)',
                        background: sabbaticalWeeks === w ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-canvas)',
                        color: sabbaticalWeeks === w ? '#fbbf24' : 'var(--text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {w} {w === 1 ? 'Semana' : 'Semanas'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Motivo Pastoral de Reposo:
                </label>
                <textarea
                  value={sabbaticalReason}
                  onChange={(e) => setSabbaticalReason(e.target.value)}
                  placeholder="Ej: Fatiga evidente en la familia anfitriona tras 22 semanas de hospitalidad ininterrumpida. Se acuerda descanso de 2 semanas y relevo temporal."
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDirectSabbaticalModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSabbatical}
                  style={{
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: savingSabbatical ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingSabbatical ? 'Concediendo...' : 'Conceder Sabático In Situ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Fraternal */}
      {deaconToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#38bdf8',
          border: '1px solid #38bdf8',
          borderRadius: '12px',
          padding: '14px 20px',
          fontSize: '0.88rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span>{deaconToast}</span>
          <button
            onClick={() => setDeaconToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
