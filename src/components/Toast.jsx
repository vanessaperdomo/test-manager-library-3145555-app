import React from 'react';

export function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      padding: '14px 20px',
      borderRadius: 'var(--radius-md)',
      background: type === 'danger' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1',
      color: '#fff',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.9rem',
      fontWeight: 600
    }}>
      <span>{type === 'danger' ? 'âš ï¸' : type === 'success' ? 'âœ…' : 'â„¹ï¸'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>âœ•</button>
    </div>
  );
}
