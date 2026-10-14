import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function OverduePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchOverdue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOverdue();
      setItems(res.items || []);
    } catch (err) {
      setError(err.message || 'Error al obtener los préstamos vencidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleReturn = async (loanId, itemId, bookTitle) => {
    if (!confirm(`¿Confirmas la devolución del libro "${bookTitle}"?`)) return;

    try {
      await api.returnItem(loanId, itemId);
      setSuccessMsg(`Libro "${bookTitle}" devuelto exitosamente.`);
      fetchOverdue();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(`Error al registrar devolución: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Control de Vencidos</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Préstamos con fecha límite superada que bloquean nuevas solicitudes de los socios.
          </p>
        </div>

        <button onClick={fetchOverdue} className="btn btn-secondary btn-sm">
          🔄 Actualizar lista
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

      {/* Tabla de Vencidos */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Consultando registros vencidos...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ margin: '0 0 8px', color: '#10b981' }}>¡Al día! No hay préstamos vencidos</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Todos los libros prestados están dentro del plazo reglamentario o ya fueron devueltos.
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Libro en Mora</th>
                <th>Socio Responsable</th>
                <th>Fecha Límite</th>
                <th>Días de Atraso</th>
                <th>Acción Inmediata</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.item_id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📕</span>
                      <span>{item.book_title}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>👤 {item.member_name}</span>
                  </td>
                  <td>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>
                      {new Date(item.due_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                      ⚠️ {item.days_late} {item.days_late === 1 ? 'día' : 'días'} tarde
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleReturn(item.loan_id, item.item_id, item.book_title)}
                      className="btn btn-sm btn-primary"
                      style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                    >
                      Recibir Devolución 📥
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
