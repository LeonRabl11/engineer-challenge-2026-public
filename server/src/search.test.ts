import test from 'node:test'
import assert from 'node:assert/strict'
import Database from 'better-sqlite3'
import { buildFeedbackWhere, VALID_STATUSES } from './search'

function makeDb() {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL);
    CREATE TABLE feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
  const insertCustomer = db.prepare('INSERT INTO customers (name, email) VALUES (?, ?)')
  const olivia = insertCustomer.run('Olivia Bennett', 'olivia.bennett@example.com').lastInsertRowid
  const obrien = insertCustomer.run("Liam O'Brien", 'liam.obrien@example.com').lastInsertRowid

  const insertFeedback = db.prepare(
    'INSERT INTO feedback (customer_id, message, status, created_at) VALUES (?, ?, ?, ?)'
  )
  // Olivia's message mentions "dashboard" (a word that only appears in message text).
  insertFeedback.run(olivia, 'The dashboard load times feel much faster now', 'open', '2024-01-01T00:00:00.000Z')
  // O'Brien's message mentions "refund" (also message-only text).
  insertFeedback.run(obrien, 'Please look into a refund for the duplicate charge', 'resolved', '2024-01-02T00:00:00.000Z')
  return db
}

// Runs a feedback query the same way the endpoints do, using the shared WHERE builder.
function runSearch(db: Database.Database, status: string, search: string) {
  const { where, params } = buildFeedbackWhere(status, search)
  return db
    .prepare(
      `SELECT f.*, c.name as customer_name
       FROM feedback f
       JOIN customers c ON c.id = f.customer_id
       ${where}
       ORDER BY f.created_at DESC`
    )
    .all(...params) as any[]
}

test('matches on customer name (case-insensitive substring)', () => {
  const db = makeDb()
  const exact = runSearch(db, 'all', 'Bennett')
  assert.equal(exact.length, 1)
  assert.equal(exact[0].customer_name, 'Olivia Bennett')

  const lower = runSearch(db, 'all', 'bennett')
  assert.equal(lower.length, 1, 'search should be case-insensitive')
  db.close()
})

test('does NOT match on message text anymore', () => {
  const db = makeDb()
  // "dashboard" and "refund" only appear in message bodies, never in customer names.
  assert.equal(runSearch(db, 'all', 'dashboard').length, 0)
  assert.equal(runSearch(db, 'all', 'refund').length, 0)
  db.close()
})

test('does NOT match on customer email anymore', () => {
  const db = makeDb()
  // The term exists only in email addresses, not in any customer name.
  assert.equal(runSearch(db, 'all', 'example.com').length, 0)
  db.close()
})

test('a single quote in the search term does not break the query', () => {
  const db = makeDb()
  let rows: any[] = []
  assert.doesNotThrow(() => {
    rows = runSearch(db, 'all', "O'Brien")
  })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].customer_name, "Liam O'Brien")
  db.close()
})

test('status filter is applied and combines with search', () => {
  const db = makeDb()
  assert.equal(runSearch(db, 'resolved', "O'Brien").length, 1)
  // Olivia's item is "open", so filtering to "resolved" excludes it.
  assert.equal(runSearch(db, 'resolved', 'Bennett').length, 0)
  db.close()
})

test('buildFeedbackWhere uses bound parameters, not interpolation', () => {
  const both = buildFeedbackWhere('open', "O'Brien")
  assert.match(both.where, /status = \?/)
  assert.match(both.where, /name LIKE \?/)
  assert.deepEqual(both.params, ['open', "%O'Brien%"])

  const none = buildFeedbackWhere('all', '')
  assert.equal(none.where, '')
  assert.deepEqual(none.params, [])
})

test('VALID_STATUSES lists exactly all/open/resolved', () => {
  assert.deepEqual([...VALID_STATUSES], ['all', 'open', 'resolved'])
})
