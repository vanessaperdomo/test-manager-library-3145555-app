import React, { useState } from 'react';
import { api } from '../services/api';
import { IconPlus, IconUserCheck } from '../components/Icons';

export function UsersPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successUser, setSuccessUser] = useState(null);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessUser(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createUser({
        username: username.toLowerCase().trim(),
        password,
        role: 'librarian',
      });
      setSuccessUser(res);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Error al registrar el bibliotecario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Formulario */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconUserCheck size={20} color="#60a5fa" /> Registrar Nuevo Bibliotecario
          </h2>

          {successUser && (
            <div className="alert-box alert-success" style={{ marginBottom: '16px' }}>
              <div>
                <div>Bibliotecario registrado con éxito:</div>
                <div style={{ fontWeight: 700, marginTop: '4px' }}>
                  Usuario: <code>{successUser.username}</code> &bull; Rol: <code>{successUser.role}</code>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert-box alert-danger" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Nombre de Usuario *
              </label>
              <input
                type="text"
                placeholder="Ej: carmen.rodriguez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                required
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Se almacenará automáticamente en minúsculas y sin espacios.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Contraseña Inicial *
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                minLength={6}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Rol Asignado
              </label>
              <input
                type="text"
                value="librarian (Operador de préstamos y socios)"
                disabled
                className="input"
                style={{ opacity: 0.7, background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear Bibliotecario'}
            </button>
          </form>
        </div>

        {/* Políticas de Seguridad y Roles */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            Políticas de Seguridad de Roles (RBAC)
          </h2>

          <div style={{
            padding: '12px 16px',
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '4px' }}>
              👑 Rol Administrador (admin)
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <li>Creación y eliminación de libros en el catálogo</li>
              <li>Carga y edición de portadas de libros</li>
              <li>Generación de reportes de rotación de catálogo</li>
              <li>Creación de cuentas para personal bibliotecario</li>
            </ul>
          </div>

          <div style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
              👤 Rol Bibliotecario (librarian)
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <li>Consulta de catálogo y disponibilidad de libros</li>
              <li>Registro de nuevos socios lectores</li>
              <li>Apertura de préstamos (1 a 3 ejemplares)</li>
              <li>Recepción y registro de devoluciones por ítem</li>
            </ul>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            🔒 <strong>ADR-002:</strong> Las contraseñas son hasheadas con algoritmo Bcrypt y las sesiones operan con tokens JWT HMAC-SHA256 con expiración forzada de 8 horas.
          </div>
        </div>
      </div>
    </div>
  );
}
