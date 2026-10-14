import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal para nuevo préstamo
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.getLoans(params);
      setLoans(res.items || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los préstamos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  // Cargar datos al abrir modal
  const handleOpenModal = async () => {
    setModalError(null);
    setSelectedMemberId('');
    setSelectedBookIds([]);
    setShowModal(true);

    try {
      const [membersRes, booksRes] = await Promise.all([
        api.getMembers({ size: 50 }),
        api.getBooks({ size: 50 })
      ]);
      setMembers(membersRes.items || []);
      // Filtrar libros que tengan ejemplares disponibles
      const booksWithStock = (booksRes.items || []).filter(b => b.available_copies > 0);
      setAvailableBooks(booksWithStock);
    } catch (err) {
      setModalError('No se pudieron cargar socios o libros disponibles.');
    }
  };

  const handleToggleBook = (bookId) => {
    if (selectedBookIds.includes(bookId)) {
      setSelectedBookIds(selectedBookIds.filter(id => id !== bookId));
    } else {
      if (selectedBookIds.length >= 3) {
        alert('Máximo 3 libros por préstamo según el reglamento (CA-06.1).');
        return;
      }
      setSelectedBookIds([...selectedBookIds, bookId]);
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedMemberId) {
      setModalError('Por favor selecciona un socio.');
      return;
    }

    if (selectedBookIds.length === 0) {
      setModalError('Debes seleccionar al menos 1 libro (máximo 3).');
      return;
    }

    // Verificar límite del socio
    const member = members.find(m => m.id === selectedMemberId);
    if (member && (member.active_loans + selectedBookIds.length) > 3) {
      setModalError(`El socio ya tiene ${member.active_loans} préstamo(s) activo(s). Agregar ${selectedBookIds.length} superaría el límite de 3 libros.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.createLoan({
        member_id: selectedMemberId,
        items: selectedBookIds.map(book_id => ({ book_id }))
      });
      setSuccessMsg('¡Préstamo registrado exitosamente!');
      setShowModal(false);
      fetchLoans();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setModalError(err.message || 'Error al registrar el préstamo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnItem = async (loanId, itemId, bookTitle) => {
    if (!confirm(`¿Confirmas la devolución del libro "${bookTitle}"?`)) return;

    try {
      await api.returnItem(loanId, itemId);
      setSuccessMsg(`Libro "${bookTitle}" devuelto y reincorporado al stock.`);
      fetchLoans();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(`Error al registrar devolución: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-info">En curso</span>;
      case 'closed':
        return <span className="badge badge-success">Completado</span>;
      case 'overdue':
        return <span className="badge badge-danger">Vencido</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const selectedMemberObj = members.find(m => m.id === selectedMemberId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Préstamos y Devoluciones</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registro transaccional, control de vencimiento y devoluciones por línea.
          </p>
        </div>

        <button onClick={handleOpenModal} className="btn btn-primary" id="btn-new-loan">
          + Nuevo Préstamo
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Filtrar por estado:</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Todos', value: '' },
            { label: 'En curso', value: 'active' },
            { label: 'Vencidos', value: 'overdue' },
            { label: 'Completados', value: 'closed' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`btn btn-sm ${statusFilter === tab.value ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Préstamos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Cargando registros de préstamos...
        </div>
      ) : loans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📖</div>
          <h3 style={{ margin: '0 0 8px' }}>No hay préstamos registrados</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {statusFilter ? 'No hay préstamos con el filtro seleccionado.' : 'Comienza registrando un préstamo para un socio.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loans.map((loan) => (
            <div key={loan.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                      👤 {loan.member_name || 'Socio'}
                    </span>
                    {getStatusBadge(loan.status)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Fecha préstamo: {new Date(loan.loaned_at).toLocaleDateString()} &bull; ID: <code style={{ fontSize: '0.72rem' }}>{loan.id.slice(0, 8)}</code>
                  </div>
                </div>
              </div>

              {/* Items dentro del préstamo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Libros incluidos ({loan.items?.length || 0}):
                </div>
                {loan.items?.map((item) => {
                  const isReturned = !!item.returned_at;
                  const isOverdue = !isReturned && new Date(item.due_at) < new Date();

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📕</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.book_title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ISBN: {item.isbn} &bull; Categoría: {item.category_name} &bull; Límite: {new Date(item.due_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isReturned ? (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                            ✓ Devuelto ({new Date(item.returned_at).toLocaleDateString()})
                          </span>
                        ) : isOverdue ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                              ⚠️ Vencido
                            </span>
                            <button
                              onClick={() => handleReturnItem(loan.id, item.id, item.book_title)}
                              className="btn btn-sm btn-danger"
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            >
                              Devolver
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                              Pendiente
                            </span>
                            <button
                              onClick={() => handleReturnItem(loan.id, item.id, item.book_title)}
                              className="btn btn-sm btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            >
                              Devolver
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Préstamo */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '640px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.3rem', fontWeight: 800 }}>Nuevo Préstamo</h2>

            {modalError && (
              <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleCreateLoan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Socio selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Seleccionar Socio *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">-- Elige un socio registrado --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.document_number}) — {m.active_loans}/3 préstamos activos
                    </option>
                  ))}
                </select>
                {selectedMemberObj && (
                  <div style={{ fontSize: '0.76rem', color: selectedMemberObj.active_loans >= 3 ? '#ef4444' : 'var(--text-muted)', marginTop: '4px' }}>
                    {selectedMemberObj.active_loans >= 3
                      ? '⚠️ Este socio ya alcanzó el límite máximo de 3 préstamos activos.'
                      : `Cupo disponible: ${3 - selectedMemberObj.active_loans} libro(s).`}
                  </div>
                )}
              </div>

              {/* Libros disponibles */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    Seleccionar Libros (1 a 3) *
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {selectedBookIds.length} / 3 seleccionados
                  </span>
                </div>

                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {availableBooks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No hay libros con ejemplares disponibles actualmente.
                    </div>
                  ) : (
                    availableBooks.map((b) => {
                      const isSelected = selectedBookIds.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          onClick={() => handleToggleBook(b.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {b.author} &bull; {b.category_name} &bull; ISBN: {b.isbn}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                              Stock: {b.available_copies}
                            </span>
                            <div style={{ fontSize: '0.75rem', marginTop: '2px', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                              {isSelected ? '✓ Seleccionado' : '+ Seleccionar'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Botones */}
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
                  disabled={submitting || selectedBookIds.length === 0 || !selectedMemberId}
                >
                  {submitting ? 'Procesando...' : 'Confirmar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
