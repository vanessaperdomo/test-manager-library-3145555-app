import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Header({ activeTab }) {
  const { username, isAdmin } = useAuth();

  const titles = {
    books: { title: 'Catálogo de Libros', subtitle: 'Inventario físico, stock disponible y gestión de portadas' },
    loans: { title: 'Gestión de Préstamos', subtitle: 'Registro transaccional de 1 a 3 ejemplares por socio' },
    members: { title: 'Directorio de Socios Lectores', subtitle: 'Registro de lectores, control de documentos y préstamos activos' },
    overdue: { title: 'Préstamos en Mora', subtitle: 'Monitoreo de libros no devueltos ordenados por días de retraso' },
    reports: { title: 'Reportes Gerenciales de Rotación', subtitle: 'Libros más prestados por rango de fechas (Datos congelados inmutables)' },
    users: { title: 'Personal Bibliotecario', subtitle: 'Control de acceso RBAC y alta de operadores' }
  };

  const current = titles[activeTab] || { title: 'Manager Library', subtitle: 'Sistema de Gestión de Biblioteca' };

  return (
    <header className="dashboard-topbar">
      <div>
        <h1 className="topbar-title">{current.title}</h1>
        <p className="topbar-subtitle">{current.subtitle}</p>
      </div>

      <div className="topbar-status-area">
        <div className="api-status-pill">
          <span className="live-pulse-dot"></span>
          <span>API 8000 Conectada</span>
        </div>
        <div className="session-user-badge">
          {username} · {isAdmin ? 'Admin' : 'Bibliotecario'}
        </div>
      </div>
    </header>
  );
}
export default Header;
