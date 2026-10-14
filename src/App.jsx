import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { BooksPage } from './pages/BooksPage';
import { LoansPage } from './pages/LoansPage';
import { MembersPage } from './pages/MembersPage';
import { OverduePage } from './pages/OverduePage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('books');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)'
      }}>
        Cargando aplicación...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área principal con barra superior y contenido */}
      <div className="dashboard-main-wrapper">
        <Header activeTab={activeTab} />

        <main className="dashboard-content">
          {activeTab === 'books' && <BooksPage />}
          {activeTab === 'loans' && <LoansPage />}
          {activeTab === 'members' && <MembersPage />}
          {activeTab === 'overdue' && <OverduePage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'users' && <UsersPage />}
        </main>

        <footer className="dashboard-footer">
          Manager Library &copy; 2026 &bull; Ficha SENA ADSO 3145555 &bull; Spec-Driven Development
        </footer>
      </div>
    </div>
  );
}

export default App;
