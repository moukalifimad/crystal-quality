import { useNavigate } from 'react-router-dom'
import { statusOf, scoreColor, scoreBg, fmtDate } from '../lib/constants'

export default function Dashboard({ data }) {
  const { sites, audits, seuil, loading } = data
  const navigate = useNavigate()

  if (loading) return <div className="loading"><i className="ti ti-loader" style={{ fontSize: 20 }} />Chargement...</div>

  const avg = audits.length
    ? Math.round(audits.reduce((a, b) => a + b.score, 0) / audits.length)
    : 0

  const alertSites = sites.filter(s => {
    const sa = audits.filter(a => a.site_id === s.id)
    if (!sa.length) return false
    return sa[0].score < seuil
  })

  return (
    <>
      {alertSites.length > 0 && alertSites.map(s => (
        <div key={s.id} className="alert alert-danger">
          <i className="ti ti-alert-triangle" style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true" />
          <p><strong>{s.name}</strong> — score sous le seuil d'alerte ({seuil}%). Plan d'action requis.</p>
        </div>
      ))}

      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-val" style={{ color: scoreColor(avg) }}>{avg}<span style={{ fontSize: 16, color: '#888' }}>%</span></div>
          <div className="kpi-lbl">Score moyen global</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-val">{audits.length}</div>
          <div className="kpi-lbl">Total audits réalisés</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-val">{sites.length}</div>
          <div className="kpi-lbl">Sites actifs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-val" style={{ color: alertSites.length > 0 ? '#A32D2D' : '#3B6D11' }}>{alertSites.length}</div>
          <div className="kpi-lbl">Alertes en cours</div>
        </div>
      </div>

      <div className="sec">Scores par site (dernier audit)</div>
      <div className="sites-grid">
        {sites.map(s => {
          const sa = audits.filter(a => a.site_id === s.id)
          const last = sa[0]
          return (
            <div key={s.id} className="site-card" onClick={() => navigate('/audit')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{s.name.split('–')[0].trim()}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{s.type}</div>
                </div>
                {last
                  ? <span className="badge" style={{ background: scoreBg(last.score), color: scoreColor(last.score) }}>{last.score}%</span>
                  : <span className="badge" style={{ background: '#f0f0f0', color: '#888' }}>—</span>
                }
              </div>
              {last && (
                <>
                  <div className="score-bar-bg">
                    <div className="score-bar-fill" style={{ width: `${last.score}%`, background: scoreColor(last.score) }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 7 }}>
                    <span style={{ fontSize: 11, color: '#888' }}><i className="ti ti-clipboard-list" style={{ fontSize: 11 }} /> {sa.length} audit{sa.length > 1 ? 's' : ''}</span>
                    <span style={{ fontSize: 11, color: '#888' }}><i className="ti ti-clock" style={{ fontSize: 11 }} /> {fmtDate(last.date)}</span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="sec">Derniers audits</div>
      {audits.slice(0, 6).map(a => {
        const col = scoreColor(a.score)
        const status = statusOf(a.score)
        return (
          <div key={a.id} className="recent-item">
            <div className="dot" style={{ background: col }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{a.site?.name?.split('–')[0].trim()}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{fmtDate(a.date)} · {a.agent?.name}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: col }}>{a.score}%</span>
            <span className="badge" style={{ background: scoreBg(a.score), color: col }}>{status}</span>
          </div>
        )
      })}
    </>
  )
}
