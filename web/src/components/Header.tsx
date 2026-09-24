import { User } from '../types'

export default function Header({
  user,
  onLogout,
}: {
  user?: User | null
  onLogout?: () => void
}) {
  return (
    <header className="topbar">
      <span className="topbar-brand">
        <span className="brand-mark">P</span>
        Pulse
      </span>
      {user && onLogout && (
        <div className="topbar-right">
          <span className="topbar-user">{user.name}</span>
          <button className="signout-button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
