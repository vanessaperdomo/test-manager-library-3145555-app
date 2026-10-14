import React from 'react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="shortcuts-title">⌨️ Atajos de Teclado del Sistema</h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar modal">&times;</button>
        </div>
        <div className="modal-body">
          <table className="shortcuts-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Tecla / Atajo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cerrar modales y alertas</td>
                <td><kbd>Esc</kbd></td>
              </tr>
              <tr>
                <td>Búsqueda rápida en tablas</td>
                <td><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
              </tr>
              <tr>
                <td>Refrescar listado actual</td>
                <td><kbd>F5</kbd> o botón Actualizar</td>
              </tr>
              <tr>
                <td>Confirmar préstamo</td>
                <td><kbd>Enter</kbd> en formulario</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
