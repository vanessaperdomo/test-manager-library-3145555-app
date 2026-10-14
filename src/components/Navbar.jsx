import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ activeTab, setActiveTab }) {
  const { username, role, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'books', label: 'Libros', icon: '📚' },
    { id: 'loans', label: 'Préstamos', icon: '🔖' },
    { id: 'members', label: 'Socios', icon: '👥' },
    { id: 'overdue', label: 'Vencidos', icon: '⚠️' },
    ...(isAdmin ? [
      { id: 'reports', label: 'Reportes', icon: '📊' },
      { id: 'users', label: 'Bibliotecarios', icon: '👤' }
    ] : [])
  ];

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)'
          }}>
            📖
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#fff' }}>
              Manager <span style={{ color: '#60a5fa' }}>Library</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Prueba Técnica ADSO
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>
              {username || 'Usuario'}
            </div>
            <span className={`badge ${isAdmin ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              {role}
            </span>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
            title="Cerrar sesión"
          >
            Salir 🚪
          </button>
        </div>
      </div>
    </header>
  );
}
