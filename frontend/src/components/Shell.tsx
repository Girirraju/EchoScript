import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, FolderOpen, Gauge, Home, Menu, Mic2, Moon } from 'lucide-react'
import Brand from '../components/Brand'

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const links = [{ to: '/dashboard', label: 'Home', icon: Home }, { to: '/studio/transcribe', label: 'Studio', icon: Mic2 }, { to: '/jobs', label: 'My Jobs', icon: Gauge }, { to: '/library', label: 'My Library', icon: FolderOpen }]
  return <div className="app-shell">
    <header className="topbar"><div className="nav-inner"><Brand /><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation"><Menu /></button>
      <nav className={open ? 'open' : ''}>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)}><Icon />{label}</NavLink>)}</nav>
      <div className="top-actions"><button className="icon-button" title="Notifications"><Bell /><span className="notification-dot" /></button><button className="icon-button" title="Appearance"><Moon /></button><button className="profile-button" onClick={() => navigate('/settings')}><span>AM</span><div><b>Alex Morgan</b><small>Workspace</small></div></button></div>
    </div></header><main>{children}</main>
  </div>
}
