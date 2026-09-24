import { useEffect, useState } from 'react'
import { exportFeedbackUrl, fetchInbox } from '../api'
import { FeedbackItem } from '../types'
import ItemDetail from './ItemDetail'

const PAGE_SIZE = 10

export default function Inbox({ token }: { token: string }) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = async () => {
    const data = await fetchInbox(page, filter, search, token)
    setItems(data.items)
    setTotal(data.total)
  }

  useEffect(() => {
    load()
  }, [page, filter, search])

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchInbox(page, filter, search, token)
      const merged = data.items.map((incoming) => {
        const local = items.find((it) => it.id === incoming.id)
        return local ? { ...incoming, status: local.status } : incoming
      })
      setItems(merged)
    }, 45000)
    return () => clearInterval(interval)
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (selectedId !== null) {
    return (
      <ItemDetail
        id={selectedId}
        token={token}
        onBack={() => {
          setSelectedId(null)
          load()
        }}
      />
    )
  }

  return (
    <div className="inbox">
      <div className="toolbar">
        <div className="status-filter">
          <label htmlFor="status-select">Status</label>
          <select
            id="status-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <input
          className="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search customers"
        />
        <button
          className="export-button"
          onClick={() => {
            window.location.href = exportFeedbackUrl(filter, search, token)
          }}
        >
          Export CSV
        </button>
      </div>

      <table className="feedback-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Channel</th>
            <th>Priority</th>
            <th>Message</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="row" onClick={() => setSelectedId(item.id)}>
              <td>{item.customer_name}</td>
              <td>
                <span className="channel">{item.channel}</span>
              </td>
              <td>
                <span className={'priority ' + item.priority}>{item.priority}</span>
              </td>
              <td className="preview">
                {item.message.slice(0, 70)}
                {item.message.length > 70 ? '…' : ''}
              </td>
              <td>{item.assignee_name || 'Nobody'}</td>
              <td>
                <span className={'badge ' + item.status}>{item.status}</span>
              </td>
              <td>{item.due_at ? new Date(item.due_at).toLocaleDateString() : 'Someday'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
