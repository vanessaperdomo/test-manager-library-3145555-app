import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  IconBook,
  IconBookmark,
  IconUsers,
  IconAlertCircle,
  IconBarChart,
  IconUserCheck,
  IconLogout,
  IconKeyboard
} from './Icons';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

export function Sidebar({ activeTab, setActiveTab }) {
  const { username, role, isAdmin, logout } = useAuth();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const mainNavItems = [
    { id: 'books', label: 'Catálogo de Libros', icon: <IconBook size={20} /> },
    { id: 'loans', label: 'Gestión de Préstamos', icon: <IconBookmark size={20} /> },
    { id: 'members', label: 'Directorio de Socios', icon: <IconUsers size={20} /> },
    { id: 'overdue', label: 'Préstamos en Mora', icon: <IconAlertCircle size={20} /> },
  ];

  const adminNavItems = [
    { id: 'reports', label: 'Reportes Gerenciales', icon: <IconBarChart size={20} /> },
    { id: 'users', label: 'Personal Bibliotecario', icon: <IconUserCheck size={20} /> },
  ];

  return (
    <>
      <aside className="sidebar-container">
        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <IconBook size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              Manager <span className="brand-highlight">Library</span>
            </div>
            <div className="brand-subtitle">SENA ADSO · 3145555</div>
          </div>
        </div>

        {/* User Card */}
        <div className="sidebar-user-card">
          <div className="user-avatar">
            {(username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{username || 'Usuario'}</div>
            <div className="user-role-badge">
              <span className={`status-dot ${isAdmin ? 'dot-admin' : 'dot-librarian'}`}></span>
              {isAdmin ? 'Administrador' : 'Bibliotecario'}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-scroll">
          <div className="nav-section-label">OPERACIÓN GENERAL</div>
          <nav className="sidebar-nav-list">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.id === 'overdue' && (
                    <span className="nav-pill-alert">Mora</span>
                  )}
                </button>
              );
            })}
          </nav>

          {isAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: '24px' }}>ADMINISTRACIÓN</div>
              <nav className="sidebar-nav-list">
                {adminNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-action-btn"
            onClick={() => setShowShortcuts(true)}
            title="Ver atajos de teclado"
          >
            <IconKeyboard size={18} />
            <span>Atajos de teclado</span>
          </button>

          <button
            type="button"
            className="sidebar-action-btn logout-btn"
            onClick={logout}
            title="Cerrar sesión actual"
          >
            <IconLogout size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
export default Sidebar;
