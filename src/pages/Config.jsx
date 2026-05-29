import { useState } from 'react'

export default function Config({ data }) {
  const { sites, agents, seuil, addSite, removeSite, addAgent, removeAgent, updateSeuil, loading } = data
  const [newSite, setNewSite] = useState('')
  const [newSiteType, setNewSiteType] = useState('Bureau')
  const [newAgent, setNewAgent] = useState('')
  const [seuilVal, setSeuilVal] = useState(seuil)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const handleAddSite = async () => {
    if (!newSite.trim()) return
    try { await addSite(newSite.trim(), newSiteType); setNewSite(''); flash('Site ajouté.') }
    catch (e) { alert(e.message) }
  }

  const handleRemoveSite = async (id, name) => {
    if (!confirm(`Supprimer "${name}" ? Tous les audits liés seront supprimés.`)) return
    try { await removeSite(id); flash('Site supprimé.') } catch (e) { alert(e.message) }
  }

  const handleAddAgent = async () => {
    if (!newAgent.trim()) return
    try { await addAgent(newAgent.trim()); setNewAgent(''); flash('Responsable ajouté.') }
    catch (e) { alert(e.message) }
  }

  const handleRemoveAgent = async (id, name) => {
    if (!confirm(`Supprimer "${name}" ?`)) return
    try { await removeAgent(id); flash('Responsable supprimé.') } catch (e) { alert(e.message) }
  }

  const handleSaveSeuil = async () => {
    setSaving(true)
    try { await updateSeuil(seuilVal); flash(`Seuil mis à jour : ${seuilVal}%`) }
    catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="loading"><i className="ti ti-loader" style={{ fontSize: 20 }} />Chargement...</div>

  return (
    <>
      {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}><i className="ti ti-check" style={{ fontSize: 18, flexShrink: 0 }} /><p>{msg}</p></div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="sec" style={{ marginBottom: 12 }}>Sites clients ({sites.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {sites.map(s => (
              <div key={s.id} className="cfg-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{s.type}</div>
                </div>
                <button className="btn btn-icon" onClick={() => handleRemoveSite(s.id, s.name)} aria-label={`Supprimer ${s.name}`}>
                  <i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input className="form-control" placeholder="Nom du site..." value={newSite} onChange={e => setNewSite(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSite()} />
            <select className="form-control" value={newSiteType} onChange={e => setNewSiteType(e.target.value)}>
              {['Bureau', 'Siège social', 'Retail', 'Agence', 'Cabinet conseil', 'Structure médicale', 'Autre'].map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-primary" onClick={handleAddSite}>
              <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" /> Ajouter
            </button>
          </div>
        </div>

        <div className="card">
          <div className="sec" style={{ marginBottom: 12 }}>Responsables qualité ({agents.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {agents.map(a => (
              <div key={a.id} className="cfg-item">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF3FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#0e2753', flexShrink: 0 }}>
                  {a.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <span style={{ flex: 1, fontSize: 13 }}>{a.name}</span>
                <button className="btn btn-icon" onClick={() => handleRemoveAgent(a.id, a.name)} aria-label={`Supprimer ${a.name}`}>
                  <i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" style={{ flex: 1 }} placeholder="Prénom Nom..." value={newAgent} onChange={e => setNewAgent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddAgent()} />
            <button className="btn btn-primary" onClick={handleAddAgent}>
              <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" /> Ajouter
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec" style={{ marginBottom: 12 }}>Seuil d'alerte qualité</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
          <input
            type="range" min={50} max={95} step={1}
            value={seuilVal}
            onChange={e => setSeuilVal(parseInt(e.target.value))}
            style={{ flex: 1 }}
            aria-label="Seuil d'alerte"
          />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#0e2753', minWidth: 50 }}>{seuilVal}%</span>
          <button className="btn btn-primary" onClick={handleSaveSeuil} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#888' }}>
          Un plan d'action correctif est déclenché automatiquement et une alerte apparaît sur le dashboard pour tout site dont le dernier score est inférieur à <strong>{seuilVal}%</strong>.
        </p>
      </div>
    </>
  )
}
