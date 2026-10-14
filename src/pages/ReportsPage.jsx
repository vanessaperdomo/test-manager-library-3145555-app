import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconBarChart, IconCalendar } from '../components/Icons';

export function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasQueried, setHasQueried] = useState(false);

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      setError('Debes especificar ambas fechas para el reporte.');
      return;
    }

    if (fromDate > toDate) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.getMostBorrowedReport(fromDate, toDate);
      setRows(res.rows || []);
      setHasQueried(true);
    } catch (err) {
      setError(err.message || 'Error al generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const maxBorrows = rows.length > 0 ? Math.max(...rows.map(r => r.times_borrowed)) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Date Pickers Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchReport();
          }}
          style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div>
            <label className="form-label">
              Fecha Inicial (Desde):
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">
              Fecha Final (Hasta):
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ height: '44px' }}
          >
            <IconBarChart size={16} /> {loading ? 'Consultando...' : 'Generar Reporte'}
          </button>
        </form>
      </div>

      {/* Alert */}
      {error && (
        <div className="alert-box alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Results */}
      <div className="glass-card" style={{ padding: '10px 24px 24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Calculando estadísticas en base de datos...
          </div>
        ) : !hasQueried ? null : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <h3 style={{ margin: '0 0 8px' }}>Sin préstamos en este rango</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              No se registraron préstamos entre el {fromDate} y el {toDate}.
            </p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Puesto</th>
                <th>Título del Libro</th>
                <th>Categoría</th>
                <th>Veces Prestado</th>
                <th>Popularidad Relativa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const percent = Math.round((row.times_borrowed / maxBorrows) * 100);
                const isTop3 = idx < 3;
                return (
                  <tr key={row.book_id}>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.06)',
                        color: isTop3 ? '#000' : 'var(--text-muted)'
                      }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        {row.book_title}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{row.category_name}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#60a5fa' }}>
                        {row.times_borrowed}
                      </span>
                    </td>
                    <td style={{ width: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          background: 'rgba(255,255,255,0.08)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                            borderRadius: '4px'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '35px' }}>
                          {percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
