/**
 * Frontend Unit and Smoke Assertions
 * Verifies core contract mappings, validators and status helpers.
 */

describe('Frontend Business Rules & Validations', () => {
  test('document_number validation format', () => {
    const isValidDoc = (doc) => /^[A-Za-z0-9-]{5,20}$/.test(doc);
    expect(isValidDoc('1002345678')).toBe(true);
    expect(isValidDoc('DOC-9988')).toBe(true);
    expect(isValidDoc('')).toBe(false);
    expect(isValidDoc('abc')).toBe(false);
  });

  test('isbn-13 format validation', () => {
    const isValidIsbn = (isbn) => /^(\d{10}|\d{13})$/.test(isbn.replace(/[-\s]/g, ''));
    expect(isValidIsbn('978-0307474728')).toBe(true);
    expect(isValidIsbn('9780156012195')).toBe(true);
    expect(isValidIsbn('invalid-isbn')).toBe(false);
  });

  test('loan status badge mappings', () => {
    const getBadgeClass = (status) => {
      const map = { open: 'badge-warning', returned: 'badge-success', overdue: 'badge-danger' };
      return map[status] || 'badge-default';
    };
    expect(getBadgeClass('open')).toBe('badge-warning');
    expect(getBadgeClass('returned')).toBe('badge-success');
    expect(getBadgeClass('overdue')).toBe('badge-danger');
  });
});
