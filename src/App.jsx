import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useData } from './hooks/useData'
import Dashboard from './pages/Dashboard'
import Audit from './pages/Audit'
import Historique from './pages/Historique'
import Tendances from './pages/Tendances'
import Config from './pages/Config'

const NAV = [
  { to: '/',         icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { to: '/audit',    icon: 'ti-clipboard-check',  label: 'Nouvel audit' },
  { to: '/historique', icon: 'ti-history',         label: 'Historique' },
  { to: '/tendances',  icon: 'ti-chart-line',      label: 'Tendances' },
  { to: '/config',     icon: 'ti-settings',        label: 'Configuration' },
]

export default function App() {
  const data = useData()
  const location = useLocation()

  const pageTitles = {
    '/':           { title: 'Dashboard', sub: 'Vue globale de la qualité' },
    '/audit':      { title: 'Nouvel audit', sub: 'Grille de contrôle qualité' },
    '/historique': { title: 'Historique', sub: 'Tous les rapports d\'audit' },
    '/tendances':  { title: 'Tendances', sub: 'Évolution des scores dans le temps' },
    '/config':     { title: 'Configuration', sub: 'Sites, agents, seuils' },
  }
  const { title, sub } = pageTitles[location.pathname] || { title: 'Crystal Facility', sub: '' }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>CRYSTAL FACILITY</h1>
          <p>Contrôle Qualité</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <i className={`ti ${n.icon}`} aria-hidden="true" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">v2.0 — Crystal Facility</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            {sub && <div className="topbar-sub">{sub}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#888' }}>
              {data.sites.length} site{data.sites.length > 1 ? 's' : ''} actif{data.sites.length > 1 ? 's' : ''}
            </span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0e2753', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>CF</div>
          </div>
        </header>

        <main className="page">
          {data.error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true" />
              <p>Erreur de connexion Supabase : {data.error}. Vérifiez vos variables d'environnement.</p>
            </div>
          )}
          <Routes>
            <Route path="/"           element={<Dashboard data={data} />} />
            <Route path="/audit"      element={<Audit data={data} />} />
            <Route path="/historique" element={<Historique data={data} />} />
            <Route path="/tendances"  element={<Tendances data={data} />} />
            <Route path="/config"     element={<Config data={data} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
