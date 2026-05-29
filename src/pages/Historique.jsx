import { useState } from 'react'
import { statusOf, scoreColor, scoreBg, fmtDate } from '../lib/constants'

export default function Historique({ data }) {
  const { sites, agents, audits, deleteAudit, loading } = data
  const [filterSite, setFilterSite] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  if (loading) return <div className="loading"><i className="ti ti-loader" style={{ fontSize: 20 }} />Chargement...</div>

  let filtered = [...audits]
  if (filterSite) filtered = filtered.filter(a => a.site_id === filterSite)
  if (filterAgent) filtered = filtered.filter(a => a.agent_id === filterAgent)
  if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus)

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet audit définitivement ?')) return
    try { await deleteAudit(id) } catch (e) { alert('Erreur : ' + e.message) }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="form-control" style={{ width: 'auto' }} value={filterSite} onChange={e => setFilterSite(e.target.value)}>
          <option value="">Tous les sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={filterAgent} onChange={e => setFilterAgent(e.target.value)}>
          <option value="">Tous les responsables</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option>Conforme</option>
          <option>À surveiller</option>
          <option>Non conforme</option>
        </select>
        <span style={{ fontSize: 12, color: '#888', alignSelf: 'center', marginLeft: 4 }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Site</th>
                <th>Responsable</th>
                <th>Score</th>
                <th>Statut</th>
                <th>Signé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 32 }}>Aucun audit trouvé</td></tr>
              )}
              {filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(a.date)}</td>
                  <td>{a.site?.name?.split('–')[0].trim() || '—'}</td>
                  <td>{a.agent?.name?.split(' ')[0] || '—'}</td>
                  <td style={{ fontWeight: 600, color: scoreColor(a.score) }}>{a.score}%</td>
                  <td>
                    <span className="badge" style={{ background: scoreBg(a.score), color: scoreColor(a.score) }}>{a.status}</span>
                  </td>
                  <td>
                    {a.signed
                      ? <i className="ti ti-check" style={{ color: '#3B6D11', fontSize: 16 }} aria-label="Signé" />
                      : <i className="ti ti-x" style={{ color: '#ccc', fontSize: 16 }} aria-label="Non signé" />}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert(`Rapport:\n${a.site?.name}\n${fmtDate(a.date)} — ${a.score}%\n${a.observations || 'Aucune observation'}`)}>
                        <i className="ti ti-file-text" style={{ fontSize: 13 }} aria-hidden="true" /> PDF
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(a.id)} aria-label="Supprimer">
                        <i className="ti ti-trash" style={{ fontSize: 13 }} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
