import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconPlus, IconSearch, IconUsers } from '../components/Icons';

export function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal para nuevo socio
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { size: 50 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      const res = await api.getMembers(params);
      setMembers(res.items || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los socios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!fullName.trim() || !docNumber.trim()) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createMember({
        full_name: fullName.trim(),
        document_number: docNumber.trim(),
      });
      setSuccessMsg(`Socio "${fullName}" registrado exitosamente.`);
      setShowModal(false);
      setFullName('');
      setDocNumber('');
      fetchMembers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setModalError(err.message || 'Error al registrar el socio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setModalError(null);
            setFullName('');
            setDocNumber('');
            setShowModal(true);
          }}
          className="btn btn-primary"
          id="btn-new-member"
        >
          <IconPlus size={16} /> Registrar Nuevo Socio
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert-box alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {error && (
        <div className="alert-box alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconSearch size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Buscar por nombre o número de documento de identidad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ width: '100%' }}
        />
      </div>

      {/* Tabla de Socios */}
      <div className="glass-card" style={{ padding: '10px 24px 24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Buscando socios...
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <h3 style={{ margin: '0 0 8px' }}>No se encontraron socios</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {searchQuery ? 'Prueba con otros términos de búsqueda.' : 'Aún no hay socios registrados en el sistema.'}
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Documento</th>
                <th>Préstamos Activos</th>
                <th>Estado de Cupo</th>
                <th>Identificador</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const count = member.active_loans;
                const isMax = count >= 3;
                return (
                  <tr key={member.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>👤</span>
                        <span>{member.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.88rem' }}>{member.document_number}</code>
                    </td>
                    <td>
                      <span className={`badge ${count === 0 ? 'badge-success' : isMax ? 'badge-danger' : 'badge-info'}`}>
                        {count} / 3 activos
                      </span>
                    </td>
                    <td>
                      {isMax ? (
                        <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>
                          Cupo lleno (3/3)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                          Disponible ({3 - count} libros)
                        </span>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{member.id.slice(0, 8)}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Registrar Socio */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.3rem', fontWeight: 800 }}>Registrar Nuevo Socio</h2>

            {modalError && (
              <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleCreateMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laura Gómez Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Número de Documento (C.C. / T.I.) *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1020304050"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="input"
                  required
                />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  El documento debe ser único en todo el sistema.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Registrar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
