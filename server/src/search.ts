export const VALID_STATUSES = ['all', 'open', 'resolved'] as const

// Builds the shared WHERE clause + bound parameters for feedback queries.
// The search matches ONLY the customer name (case-insensitive substring).
// Uses `?` placeholders so callers pass values as bound parameters — no SQL interpolation.
// The column references are unqualified so the same fragment works both for
// `SELECT ... FROM feedback` and for the aliased export join (`feedback f JOIN customers c`).
export function buildFeedbackWhere(
  status: string,
  search: string
): { where: string; params: any[] } {
  const clauses: string[] = []
  const params: any[] = []

  if (status && status !== 'all') {
    clauses.push('status = ?')
    params.push(status)
  }

  if (search) {
    clauses.push('customer_id IN (SELECT id FROM customers WHERE name LIKE ?)')
    params.push(`%${search}%`)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  return { where, params }
}
