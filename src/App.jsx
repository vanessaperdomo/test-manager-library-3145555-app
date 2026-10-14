import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
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
        background: 'var(--bg-main)',
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-container" style={{ flex: 1, padding: '32px 24px' }}>
        {activeTab === 'books' && <BooksPage />}
        {activeTab === 'loans' && <LoansPage />}
        {activeTab === 'members' && <MembersPage />}
        {activeTab === 'overdue' && <OverduePage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'users' && <UsersPage />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        Manager Library &copy; 2026 &bull; SENA ADSO Ficha 3145555 &bull; Spec-Driven Development
      </footer>
    </div>
  );
}

export default App;
