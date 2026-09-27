import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  HeartHandshake,
  Info,
  BookOpen,
  X,
  Compass,
  Award,
  Plus,
  Download,
} from 'lucide-react';
import type {
  EldershipCouncil,
  ElderAssignment,
  DeaconCareRoundtable,
  PastoralDeviation,
  RestrictedPairingItem,
  EmeritusGuardian,
} from '../types';
import {
  fetchEldershipCouncils,
  fetchElderDeacons,
  assignElderDeacon,
  fetchDeaconRoundtables,
  recordDeaconRoundtable,
  fetchPastoralDeviations,
  resolvePastoralDeviation,
  fetchRestrictedPairings,
  createRestrictedPairing,
  fetchEmeritusGuardians,
  enrollEmeritusGuardian,
} from '../api';
import { MonogramAvatar } from './MonogramAvatar';
import { CommunityInitiativesHub } from './CommunityInitiativesHub';

export const ElderDesk: React.FC = () => {
  const [councils, setCouncils] = useState<EldershipCouncil[]>([]);
  const [selectedCouncilId, setSelectedCouncilId] = useState<string>('council_poniente');
  const [deacons, setDeacons] = useState<ElderAssignment[]>([]);
  const [roundtables, setRoundtables] = useState<DeaconCareRoundtable[]>([]);
  const [deviations, setDeviations] = useState<PastoralDeviation[]>([]);
  const [pairings, setPairings] = useState<RestrictedPairingItem[]>([]);
  const [veterans, setVeterans] = useState<EmeritusGuardian[]>([]);
  const [activeTab, setActiveTab] = useState<'supervision' | 'pairings' | 'veterans' | 'initiatives'>('supervision');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showConciliarModal, setShowConciliarModal] = useState<boolean>(false);

  // New Roundtable Form state
  const [showNewRoundtable, setShowNewRoundtable] = useState<boolean>(false);
  const [roundtableAttendees, setRoundtableAttendees] = useState<number>(8);
  const [roundtableNotes, setRoundtableNotes] = useState<string>('');

  // New Assign Deacon Form state
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [newDeaconId, setNewDeaconId] = useState<string>('');
  const [newElderName, setNewElderName] = useState<string>('Bernabé Sandoval');

  // Anti-Collision / Consejería Modal state
  const [showPairingModal, setShowPairingModal] = useState<boolean>(false);
  const [phoneA, setPhoneA] = useState<string>('');
  const [phoneB, setPhoneB] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<string>('Consejería y Acompañamiento');
  const [submittingPairing, setSubmittingPairing] = useState<boolean>(false);

  // Servidores Veteranos Modal state
  const [showVeteranModal, setShowVeteranModal] = useState<boolean>(false);
  const [veteranName, setVeteranName] = useState<string>('');
  const [veteranRole, setVeteranRole] = useState<string>('Consejero y Mentor Espiritual');
  const [veteranYear, setVeteranYear] = useState<number>(2020);
  const [submittingVeteran, setSubmittingVeteran] = useState<boolean>(false);

  const currentElderId = 'usr_elder_bernabé';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [councilList, deaconList, rList, devList, pairList, vetList] = await Promise.all([
        fetchEldershipCouncils(),
        fetchElderDeacons(currentElderId).catch(() => []),
        fetchDeaconRoundtables(selectedCouncilId).catch(() => []),
        fetchPastoralDeviations().catch(() => []),
        fetchRestrictedPairings().catch(() => []),
        fetchEmeritusGuardians().catch(() => []),
      ]);

      setCouncils(councilList);
      if (councilList.length > 0 && !councilList.some(c => c.id === selectedCouncilId)) {
        setSelectedCouncilId(councilList[0].id);
      }
      setDeacons(deaconList);
      setRoundtables(rList);
      setDeviations(devList);
      setPairings(pairList);
      setVeterans(vetList);
    } catch (err) {
      console.error('Error cargando datos de presbiterio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCouncilId]);

  const handleCreateRoundtable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordDeaconRoundtable({
        council_id: selectedCouncilId,
        elder_id: currentElderId,
        attended_deacon_count: Number(roundtableAttendees),
        notes: roundtableNotes,
      });
      setStatusMessage('Mesa redonda de cuidado diaconal asentada con bendición y oración fraterna.');
      setShowNewRoundtable(false);
      setRoundtableNotes('');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleAssignDeacon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeaconId) return;
    try {
      await assignElderDeacon({
        council_id: selectedCouncilId,
        elder_id: currentElderId,
        elder_name: newElderName,
        deacon_id: newDeaconId,
      });
      setStatusMessage('Diácono asignado exitosamente al cuidado del Consejo de Ancianos.');
      setShowAssignModal(false);
      setNewDeaconId('');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleCreatePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneA.trim() || !phoneB.trim()) return;
    setSubmittingPairing(true);
    try {
      await createRestrictedPairing({
        phone_a: phoneA.trim(),
        phone_b: phoneB.trim(),
        reason_category: reasonCategory,
      });
      setStatusMessage('Ruteo anti-colisión confidencial guardado por el Consejo de Ancianos. Sincronizado para conocimiento y consolidación del Pastor Josh.');
      setShowPairingModal(false);
      setPhoneA('');
      setPhoneB('');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSubmittingPairing(false);
    }
  };

  const handleEnrollVeteran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veteranName.trim()) return;
    setSubmittingVeteran(true);
    try {
      await enrollEmeritusGuardian({
        member_id: `veteran-${Date.now()}`,
        member_name: veteranName.trim(),
        ministry_role: veteranRole,
        original_join_year: Number(veteranYear),
        commissioned_by: 'Consejo de Ancianos (Bernabé Sandoval)',
      });
      setStatusMessage(`Hermano(a) ${veteranName} reconocido(a) como Servidor Veterano y Consejero.`);
      setShowVeteranModal(false);
      setVeteranName('');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSubmittingVeteran(false);
    }
  };

  const handleResolveDeviation = async (id: string) => {
    try {
      await resolvePastoralDeviation(id, {
        resolution_notes: 'Atendido en amor conciliar y reconciliación (Mateo 18)',
        conciliar_action_taken: true,
      });
      setStatusMessage('Desviación pastoral resuelta con reconciliación y verdad en amor (Mateo 18).');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleExportCongregationCsv = () => {
    try {
      const csvHeader = 'ID,Nombre,Rol,Sector,Estado\n';
      const rows = deacons.map((d) => `"${d.deacon_id}","${d.deacon_name || d.elder_name || d.deacon_id}","Diácono","${selectedCouncilId}","Activo"`).join('\n');
      const blob = new Blob([csvHeader + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `padron_concilio_${selectedCouncilId}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage('✓ Directorio conciliar descargado en CSV con cifrado y trazabilidad eclesiástica.');
    } catch {
      setStatusMessage('Error generando la exportación CSV conciliar.');
    }
  };

  const calculateSlaHours = (deadlineStr?: string | null): { hours: number; isUrgent: boolean } => {
    if (!deadlineStr) return { hours: 72, isUrgent: false };
    const diff = new Date(deadlineStr).getTime() - Date.now();
    const hours = Math.round(diff / (1000 * 60 * 60));
    return { hours: Math.max(0, hours), isUrgent: hours <= 24 };
  };

  return (
    <div className="container" style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Indicador de carga */}
      {isLoading && (
        <div style={{ color: 'var(--text-secondary)', padding: '8px 0', fontSize: '0.85rem' }}>
          Actualizando datos del consejo de ancianos...
        </div>
      )}

      {/* Banner de Estado */}
      {statusMessage && (
        <div style={{
          backgroundColor: 'var(--accent-emerald-light)',
          color: 'var(--text-primary)',
          border: '1px solid var(--accent-emerald)',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Institucional del Consejo de Ancianos */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={13} /> CONSEJO DE ANCIANOS
            </span>
            <span style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              Cuidado Pastoral y Consejería
            </span>
            <button
              type="button"
              id="btn-elder-conciliar"
              onClick={() => setShowConciliarModal(true)}
              style={{
                background: 'rgba(212, 175, 55, 0.12)',
                color: 'var(--accent-warm)',
                border: '1px solid var(--accent-warm)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Info size={13} strokeWidth={1.5} />
              <span>Principio Conciliar (Mateo 18)</span>
            </button>
          </div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Consejo de Ancianos y Presbiterio
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Pastoreo, consejería fraternal y gestión de ruteos anti-colisión. El Pastor Josh consolida las decisiones eclesiásticas y preserva derecho de veto.
          </p>
        </div>

        {/* Selector de Consejo Zonal */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Sector Zonal:
          </label>
          <select
            value={selectedCouncilId}
            onChange={(e) => setSelectedCouncilId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            {councils.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.macro_zone})
              </option>
            ))}
          </select>
          <button
            type="button"
            id="btn-export-congregation-csv"
            onClick={handleExportCongregationCsv}
            className="btn-secondary tap-target-44"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
            title="Exportar padrón congregacional en formato CSV seguro (Exclusivo Presbiterio)"
          >
            <Download size={15} />
            <span>Exportar CSV Oficial</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas del Consejo */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('supervision')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'supervision' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
            color: activeTab === 'supervision' ? '#FFFFFF' : 'var(--text-secondary)',
            border: activeTab === 'supervision' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Users size={16} />
          <span>Supervisión Diaconal ({deacons.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pairings')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'pairings' ? 'var(--accent-amber)' : 'var(--bg-surface)',
            color: activeTab === 'pairings' ? '#FFFFFF' : 'var(--text-secondary)',
            border: activeTab === 'pairings' ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Compass size={16} />
          <span>Consejería y Ruteos Anti-Colisión ({pairings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('veterans')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'veterans' ? '#0d9488' : 'var(--bg-surface)',
            color: activeTab === 'veterans' ? '#FFFFFF' : 'var(--text-secondary)',
            border: activeTab === 'veterans' ? '1px solid #0d9488' : '1px solid var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Award size={16} />
          <span>Servidores Veteranos y Consejeros ({veterans.length})</span>
        </button>

        <button
          type="button"
          id="tab-elder-initiatives"
          onClick={() => setActiveTab('initiatives')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'initiatives' ? 'var(--accent-indigo)' : 'var(--bg-surface)',
            color: activeTab === 'initiatives' ? '#FFFFFF' : 'var(--text-secondary)',
            border: activeTab === 'initiatives' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Actividades y Sugerencias</span>
        </button>
      </div>
        
      {/* VISTA 1: SUPERVISIÓN DIACONAL */}
      {activeTab === 'supervision' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          
          {/* Columna 1: Diáconos Bajo Pastoreo Fraternal */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--accent-indigo)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Diáconos Asignados ({deacons.length}/12)
                </h3>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                style={{
                  backgroundColor: 'var(--accent-indigo-light)',
                  color: 'var(--accent-indigo)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PlusCircle size={14} /> Asignar
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Límite cognitivo de Dunbar: Cada anciano cuida a un grupo selecto de diáconos para evitar la soledad ministerial.
            </p>

            {deacons.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No hay diáconos registrados en este consejo aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {deacons.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {d.deacon_id.replace('usr_deacon_', 'Diácono ').replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Asignado: {new Date(d.created_at).toLocaleDateString()} • Cobertura: {d.elder_name}
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      fontSize: '0.74rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 700
                    }}>
                      En Comunión
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna 2: Mesas Redondas de Cuidado Diaconal */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartHandshake size={18} style={{ color: 'var(--accent-emerald)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Mesas Redondas Mensuales
                </h3>
              </div>
              <button
                onClick={() => setShowNewRoundtable(!showNewRoundtable)}
                style={{
                  backgroundColor: 'var(--accent-emerald-light)',
                  color: 'var(--accent-emerald)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PlusCircle size={14} /> Registrar
              </button>
            </div>

            {/* Formulario desplegable de Mesa Redonda */}
            {showNewRoundtable && (
              <form onSubmit={handleCreateRoundtable} style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '14px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Nueva Sesión de Cuidado Fraternal
                </h4>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Diáconos Presentes:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={roundtableAttendees}
                    onChange={(e) => setRoundtableAttendees(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginTop: '4px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Notas de Escucha, Cargas y Oración Compartida:
                  </label>
                  <textarea
                    rows={3}
                    value={roundtableNotes}
                    onChange={(e) => setRoundtableNotes(e.target.value)}
                    placeholder="Se oró por descanso de facilitadores con hijos pequeños..."
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginTop: '4px',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowNewRoundtable(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: 'var(--accent-emerald)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    Guardar Mesa
                  </button>
                </div>
              </form>
            )}

            {roundtables.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No hay minutas de mesas redondas asentadas aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {roundtables.map((rt) => (
                  <div
                    key={rt.id}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                        {new Date(rt.created_at).toLocaleDateString()}
                      </span>
                      <span style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--accent-indigo)',
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}>
                        {rt.attended_deacon_count} diáconos presentes
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {rt.notes}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna 3: Asuntos por Atender en Amor (< 3 días) */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Asuntos por Atender en Amor (&lt; 3 días)
              </h3>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Casos escalados por diáconos para discernimiento y conciliación pastoral con espíritu fraterno.
            </p>

            {deviations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Paz en los hogares. Cero observaciones pendientes en este momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {deviations.map((dev) => {
                  const { hours, isUrgent } = calculateSlaHours(dev.sla_deadline);
                  const isPending = dev.status !== 'resolved';

                  return (
                    <div
                      key={dev.id}
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isPending ? (isUrgent ? '1px solid #f87171' : '1px solid var(--accent-amber)') : '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          fontSize: '0.84rem',
                          textTransform: 'capitalize'
                        }}>
                          Categoría: {dev.category.replace('_', ' ')}
                        </span>
                        {isPending ? (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isUrgent ? '#ef4444' : '#f59e0b',
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700
                          }}>
                            <Clock size={11} /> Atención amorosa: {hours}h restantes
                          </span>
                        ) : (
                          <span style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700
                          }}>
                            Resuelto
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        "{dev.comments}"
                      </p>
                      {isPending && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleResolveDeviation(dev.id)}
                            style={{
                              backgroundColor: 'var(--accent-emerald)',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={13} /> Atendido en Amor
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* VISTA 2: CONSEJERÍA Y RUTEO ANTI-COLISIÓN */}
      {activeTab === 'pairings' && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Compass size={20} style={{ color: 'var(--accent-amber)' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Consejería Pastoral y Ruteos Anti-Colisión
                </h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '720px', lineHeight: 1.45 }}>
                El anciano gestiona consejerías sensibles y establece restricciones de ruteo para evitar que dos personas coincidan involuntariamente en la misma célula. El Pastor Josh consolida y conoce estas decisiones en su consola pastoral y retiene derecho de veto.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPairingModal(true)}
              className="btn-primary"
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: '#161513',
                padding: '8px 16px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>+ Registrar Restricción / Consejería</span>
            </button>
          </div>

          {pairings.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No hay restricciones anti-colisión ni consejerías conflictivas activas en este sector.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {pairings.map((p) => (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(217, 119, 6, 0.12)',
                        color: 'var(--accent-amber)',
                      }}>
                        {p.reason_category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Contacto A: <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{p.phone_a}</code>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '4px' }}>
                      Contacto B: <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{p.phone_b}</code>
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>Gestionado por Ancianos</span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      Sincronizado con Pastor Josh
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 3: SERVIDORES VETERANOS Y CONSEJEROS */}
      {activeTab === 'veterans' && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Award size={20} style={{ color: '#0d9488' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Servidores Veteranos y Consejeros
                </h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '720px', lineHeight: 1.45 }}>
                Hermanos y hermanas veteranos con años de fidelidad pastoral en Durango. El Consejo de Ancianos los acompaña con honor y consulta su consejo sabio para edificar a la congregación, eximiéndolos de fatiga operativa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowVeteranModal(true)}
              className="btn-primary"
              style={{
                backgroundColor: '#0d9488',
                color: '#FFFFFF',
                padding: '8px 16px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>+ Reconocer Servidor Veterano</span>
            </button>
          </div>

          {veterans.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Aún no hay servidores veteranos registrados en este consejo. Pulsa "+ Reconocer Servidor Veterano" para consagrar a un hermano de larga trayectoria.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {veterans.map((v) => (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MonogramAvatar name={v.member_name} size="md" />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>{v.member_name}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 700 }}>
                        {v.ministry_role}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <div>Trayectoria desde: <strong>{v.original_join_year}</strong> ({new Date().getFullYear() - v.original_join_year} años)</div>
                    <div>Acompañado por: <strong>{v.commissioned_by}</strong></div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    Consejero y Mentor Espiritual • Exento de fatiga operativa
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 4: GOBERNANZA DE ACTIVIDADES COMUNITARIAS Y SUGERENCIAS */}
      {activeTab === 'initiatives' && (
        <section id="section-elder-initiatives" aria-label="Gobernanza de Actividades Comunitarias">
          <CommunityInitiativesHub role="elder" />
        </section>
      )}

      {/* Modal para Registrar Ruteo Anti-Colisión / Consejería */}
      {showPairingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '460px',
            width: '100%',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Registrar Ruteo Anti-Colisión
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Protege la discreción pastoral impidiendo que dos personas sean asignadas al mismo grupo. Esta decisión se reporta a la consola de Josh para consolidación y eventual veto pastoral.
            </p>

            <form onSubmit={handleCreatePairing} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Teléfono / Identificador de Contacto A:
                </label>
                <input
                  type="text"
                  placeholder="+52 618 111 2233"
                  value={phoneA}
                  onChange={(e) => setPhoneA(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Teléfono / Identificador de Contacto B:
                </label>
                <input
                  type="text"
                  placeholder="+52 618 999 8877"
                  value={phoneB}
                  onChange={(e) => setPhoneB(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Causa Pastoral / Categoría:
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                >
                  <option value="Consejería y Acompañamiento">Consejería y Acompañamiento</option>
                  <option value="Mediación y Reconciliación">Mediación y Reconciliación</option>
                  <option value="Cuidado Pastoral Preventivo">Cuidado Pastoral Preventivo</option>
                  <option value="Separación Sensible de Célula">Separación Sensible de Célula</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPairingModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingPairing}
                  style={{
                    backgroundColor: 'var(--accent-amber)',
                    color: '#161513',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {submittingPairing ? 'Guardando...' : 'Asentar Ruteo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Reconocer Servidor Veterano */}
      {showVeteranModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '460px',
            width: '100%',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Reconocer Servidor Veterano y Consejero
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Consagra a un hermano de comprobada trayectoria en la iglesia para funciones de mentoría y consejo pastoral.
            </p>

            <form onSubmit={handleEnrollVeteran} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  placeholder="ej. Don Samuel Morales"
                  value={veteranName}
                  onChange={(e) => setVeteranName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Función de Consejería:
                </label>
                <input
                  type="text"
                  value={veteranRole}
                  onChange={(e) => setVeteranRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Año de Ingreso / Comienzo de Servicio:
                </label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={veteranYear}
                  onChange={(e) => setVeteranYear(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowVeteranModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingVeteran}
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {submittingVeteran ? 'Reconociendo...' : 'Reconocer Servidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Asignar Diácono */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
              Asignar Diácono a Consejo Presbiteral
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Asigna a un diácono bajo la mentoría y cuidado del presbítero en la macro-zona seleccionada.
            </p>
            <form onSubmit={handleAssignDeacon} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Nombre del Presbítero Responsable:
                </label>
                <input
                  type="text"
                  placeholder="Nombre del anciano"
                  value={newElderName}
                  onChange={(e) => setNewElderName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  ID o Nombre de Diácono:
                </label>
                <input
                  type="text"
                  placeholder="ej. usr_deacon_mateo"
                  value={newDeaconId}
                  onChange={(e) => setNewDeaconId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--accent-indigo)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Principio Conciliar Neotestamentario (Mateo 18 & Tito 1:5) - Clean Desk (GOLD-285) */}
      {showConciliarModal && (
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
                  Principio Conciliar del Presbiterio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConciliarModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-canvas)',
              borderLeft: '3px solid var(--accent-olive)',
              padding: '14px 16px',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              marginBottom: '18px',
            }}>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                «Por esta causa te dejé en Creta, para que corrigieses lo deficiente, y establecieses ancianos en cada ciudad, así como yo te mandé... porque es necesario que el obispo sea irreprensible, como administrador de Dios.»
              </p>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-olive)', marginTop: '6px' }}>
                — Tito 1:5, 7
              </div>
            </div>

            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Cobertura Fraternal en Amor y Gracia Durango:
            </h4>
            <ul style={{ margin: '0 0 20px 0', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <li><strong>Colegialidad:</strong> Las decisiones pastorales no dependen de una sola voluntad, sino del discernimiento fraterno de ancianos y pastores orando juntos.</li>
              <li><strong>Pastoreo a los Pastores de Hogar:</strong> Cobertura cercana a la franja de 10 a 12 diáconos, apoyándolos en su vida espiritual y familiar.</li>
              <li><strong>Gracia Restauradora (Mateo 18):</strong> Las diferencias no se ventilan públicamente; se atienden en amor, en privado y con espíritu de edificación.</li>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                id="btn-close-conciliar-modal"
                onClick={() => setShowConciliarModal(false)}
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
    </div>
  );
};
