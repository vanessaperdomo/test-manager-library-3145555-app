/**
 * API Client for Manager Library
 * Complies with spec-laravel-react/api-contract.md
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Si enviamos FormData (para portadas), eliminamos Content-Type para que el navegador ponga el boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  // Si devuelve un binario (ej. imagen de portada)
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('image/') || contentType.includes('application/octet-stream'))) {
    if (!response.ok) {
      throw new Error('Portada no disponible');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Error en la petición');
    error.code = data.code || 'UNKNOWN_ERROR';
    error.details = data.details || [];
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // Salud y Autenticación
  health: () => request('/health'),
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),

  // Usuarios (Solo Admin)
  createUser: (userData) => request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Categorías
  getCategories: () => request('/categories'),

  // Libros
  getBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/books?${query}`);
  },
  getBook: (id) => request(`/books/${id}`),
  createBook: (bookData) => request('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  }),
  updateBook: (id, bookData) => request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  }),
  deleteBook: (id) => request(`/books/${id}`, {
    method: 'DELETE',
  }),
  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/books/${id}/cover`, {
      method: 'PUT',
      body: formData,
    });
  },
  getCoverUrl: (id) => `${API_BASE_URL}/books/${id}/cover`,
  deleteCover: (id) => request(`/books/${id}/cover`, {
    method: 'DELETE',
  }),

  // Socios
  getMembers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/members?${query}`);
  },
  getMember: (id) => request(`/members/${id}`),
  createMember: (memberData) => request('/members', {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),

  // Préstamos
  getLoans: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/loans?${query}`);
  },
  getLoan: (id) => request(`/loans/${id}`),
  createLoan: (loanData) => request('/loans', {
    method: 'POST',
    body: JSON.stringify(loanData),
  }),
  returnItem: (loanId, itemId) => request(`/loans/${loanId}/items/${itemId}/return`, {
    method: 'POST',
  }),
  getOverdue: () => request('/loans/overdue'),

  // Reporte (Solo Admin)
  getMostBorrowedReport: (from, to) => request(`/reports/most-borrowed?from=${from}&to=${to}`),
};
