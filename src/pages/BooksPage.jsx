import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function BooksPage() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showCoverModal, setShowCoverModal] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTotalCopies, setFormTotalCopies] = useState(1);
  const [coverFile, setCoverFile] = useState(null);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (search) params.q = search;
      if (categoryFilter) params.category_id = categoryFilter;

      const res = await api.getBooks(params);
      setBooks(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      setFeedback({ type: 'danger', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [page, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadBooks();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    try {
      await api.createBook({
        title: formTitle,
        author: formAuthor,
        isbn: formIsbn,
        category_id: formCategory,
        total_copies: parseInt(formTotalCopies, 10),
      });
      setFeedback({ type: 'success', message: '¡Libro creado exitosamente!' });
      setShowCreateModal(false);
      resetForm();
      loadBooks();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    try {
      await api.updateBook(showEditModal.id, {
        title: formTitle,
        author: formAuthor,
        category_id: formCategory,
        total_copies: parseInt(formTotalCopies, 10),
      });
      setFeedback({ type: 'success', message: '¡Libro actualizado correctamente!' });
      setShowEditModal(null);
      resetForm();
      loadBooks();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`¿Seguro que deseas dar de baja lógica el libro «${book.title}»?`)) return;
    try {
      await api.deleteBook(book.id);
      setFeedback({ type: 'success', message: `El libro «${book.title}» fue dado de baja.` });
      loadBooks();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  const handleUploadCover = async (e) => {
    e.preventDefault();
    if (!coverFile) return;
    try {
      await api.uploadCover(showCoverModal.id, coverFile);
      setFeedback({ type: 'success', message: '¡Portada subida exitosamente!' });
      setShowCoverModal(null);
      setCoverFile(null);
      loadBooks();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormIsbn('');
    setFormCategory(categories[0]?.id || '');
    setFormTotalCopies(1);
  };

  const openEdit = (book) => {
    setShowEditModal(book);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormIsbn(book.isbn);
    setFormCategory(book.category.id);
    setFormTotalCopies(book.total_copies);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Catálogo de Libros</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Explora el inventario físico, disponibilidad de ejemplares y portadas.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="btn btn-primary"
          >
            + Nuevo Libro
          </button>
        )}
      </div>

      {feedback.message && (
        <div className={`alert-box alert-${feedback.type}`}>
          <span>{feedback.type === 'danger' ? '⚠️' : '✅'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por título o autor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">
            Buscar 🔍
          </button>
        </form>
      </div>

      {/* Tabla de Libros */}
      <div className="glass-card" style={{ padding: '10px 24px 24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Cargando catálogo...
          </div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No se encontraron libros activos.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Título / Autor</th>
                <th>ISBN</th>
                <th>Categoría</th>
                <th>Disponibilidad</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td style={{ width: '64px' }}>
                    {b.cover_key ? (
                      <img
                        src={api.getCoverUrl(b.id)}
                        alt={b.title}
                        style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                      />
                    ) : (
                      <div style={{ width: '48px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        📕
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{b.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{b.author}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#c7d2fe' }}>{b.isbn}</td>
                  <td>
                    <span className="badge badge-info">{b.category?.name}</span>
                  </td>
                  <td>
                    {b.available_copies > 0 ? (
                      <span className="badge badge-success">
                        {b.available_copies} de {b.total_copies} disponibles
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        Agotado (0/{b.total_copies})
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setShowCoverModal(b)}
                          className="btn btn-secondary btn-sm"
                          title="Subir Portada"
                        >
                          🖼️
                        </button>
                        <button
                          onClick={() => openEdit(b)}
                          className="btn btn-secondary btn-sm"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          className="btn btn-danger btn-sm"
                          title="Dar de baja lógica"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        {total > 10 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando página {page} (Total: {total} libros)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-secondary btn-sm"
              >
                ← Anterior
              </button>
              <button
                disabled={page * 10 >= total}
                onClick={() => setPage(page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear Libro */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '18px' }}>Registrar Nuevo Libro</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Autor</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ISBN (13 dígitos numéricos)</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  maxLength={13}
                  value={formIsbn}
                  onChange={(e) => setFormIsbn(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total de Ejemplares (≥ 1)</label>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  required
                  value={formTotalCopies}
                  onChange={(e) => setFormTotalCopies(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar Libro</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Libro */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '18px' }}>Editar Libro</h3>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Autor</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total de Ejemplares</label>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  required
                  value={formTotalCopies}
                  onChange={(e) => setFormTotalCopies(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Actualizar</button>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Subir Portada */}
      {showCoverModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Portada: {showCoverModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Formatos admitidos: JPG o PNG. Tamaño máximo 2 MB.
            </p>
            <form onSubmit={handleUploadCover}>
              <div className="form-group">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="form-input"
                  required
                  onChange={(e) => setCoverFile(e.target.files[0])}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Subir Portada</button>
                <button type="button" onClick={() => setShowCoverModal(null)} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
