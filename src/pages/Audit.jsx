import { useState, useRef, useEffect, useCallback } from 'react'
import { GRILLE, PLANS, TOTAL_CRITERIA, statusOf, scoreColor, scoreBg, fmtDate, calcScore } from '../lib/constants'

const PHOTO_ICONS = ['ti-building', 'ti-door', 'ti-toilet-paper', 'ti-vacuum-cleaner', 'ti-bucket', 'ti-camera']

export default function Audit({ data }) {
  const { sites, agents, seuil, saveAudit } = data
  const [siteId, setSiteId] = useState('')
  const [agentId, setAgentId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [ratings, setRatings] = useState({})
  const [obs, setObs] = useState('')
  const [photos, setPhotos] = useState([])
  const [signed, setSigned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [showPDF, setShowPDF] = useState(false)
  const sigRef = useRef(null)
  const sigCtx = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    if (agents.length && !agentId) setAgentId(agents[0]?.id || '')
  }, [agents])

  useEffect(() => {
    const canvas = sigRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth || 560
    sigCtx.current = canvas.getContext('2d')
    sigCtx.current.strokeStyle = '#0e2753'
    sigCtx.current.lineWidth = 2
    sigCtx.current.lineCap = 'round'
  }, [])

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return [src.clientX - r.left, src.clientY - r.top]
  }

  const startDraw = useCallback((e) => {
    e.preventDefault()
    drawing.current = true
    const [x, y] = getPos(e, sigRef.current)
    sigCtx.current.beginPath()
    sigCtx.current.moveTo(x, y)
  }, [])

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!drawing.current) return
    const [x, y] = getPos(e, sigRef.current)
    sigCtx.current.lineTo(x, y)
    sigCtx.current.stroke()
    setSigned(true)
  }, [])

  const endDraw = useCallback(() => { drawing.current = false }, [])

  const clearSig = () => {
    sigCtx.current?.clearRect(0, 0, sigRef.current.width, sigRef.current.height)
    setSigned(false)
  }

  const setRating = (key, val) => {
    setRatings(prev => ({ ...prev, [key]: val }))
  }

  const score = calcScore(ratings)
  const rated = Object.keys(ratings).length
  const badItems = Object.entries(ratings)
    .filter(([, v]) => v === 0)
    .map(([k]) => {
      const [si, ii] = k.split('-').map(Number)
      return GRILLE[si].items[ii]
    })

  const reset = () => {
    setSiteId(''); setObs(''); setPhotos([]); setRatings({})
    setSaved(null); setShowPDF(false); setSigned(false)
    clearSig()
  }

  const handleSave = async () => {
    if (!siteId) return alert('Sélectionner un site.')
    if (rated < 5) return alert('Évaluer au moins 5 critères.')
    setSaving(true)
    try {
      const result = await saveAudit({
        site_id: siteId,
        agent_id: agentId || null,
        date,
        score,
        status: statusOf(score),
        observations: obs,
        ratings,
        photos_count: photos.length,
        signed,
      })
      setSaved(result)
    } catch (e) {
      alert('Erreur : ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedSite = sites.find(s => s.id === siteId)
  const selectedAgent = agents.find(a => a.id === agentId)

  return (
    <>
      {saved && (
        <div className="alert alert-success">
          <i className="ti ti-circle-check" style={{ fontSize: 20, flexShrink: 0 }} aria-hidden="true" />
          <p>Rapport sauvegardé avec succès. Score : <strong>{saved.score}%</strong> — {statusOf(saved.score)}</p>
        </div>
      )}

      {badItems.length > 0 && (
        <div className="plan-box">
          <h4><i className="ti ti-alert-triangle" aria-hidden="true" /> Plan d'action correctif — {badItems.length} point{badItems.length > 1 ? 's' : ''} non conforme{badItems.length > 1 ? 's' : ''}</h4>
          {badItems.map((item, i) => (
            <div key={i} className="plan-item">
              <i className="ti ti-arrow-right" style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <span><strong>{item}</strong>{PLANS[item] ? ` — ${PLANS[item]}` : ' — Vérification immédiate requise.'}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Site client</label>
          <select className="form-control" value={siteId} onChange={e => setSiteId(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Responsable qualité</label>
          <select className="form-control" value={agentId} onChange={e => setAgentId(e.target.value)}>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div className="score-live">
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Score en temps réel</div>
          <div className="score-live-val" style={{ color: rated > 0 ? scoreColor(score) : '#ccc' }}>{rated > 0 ? `${score}%` : '—'}</div>
        </div>
        <div className="progress-wrap">
          <div className="progress-fill" style={{ width: `${rated > 0 ? score : 0}%`, background: rated > 0 ? scoreColor(score) : '#ccc' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Critères évalués</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>{rated} / {TOTAL_CRITERIA}</div>
        </div>
      </div>

      {GRILLE.map((section, si) => (
        <div key={si} className="grille-section">
          <div className="grille-header">
            <i className={`ti ${section.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
            {section.cat}
          </div>
          <div className="grille-body">
            {section.items.map((item, ii) => {
              const key = `${si}-${ii}`
              const val = ratings[key]
              const isAlert = val === 0
              return (
                <div key={ii} className={`grille-row${isAlert ? ' row-alert' : ''}`}>
                  <div className="grille-lbl">
                    {item}
                    {isAlert && <span style={{ fontSize: 11, color: '#A32D2D', marginLeft: 6 }}><i className="ti ti-alert-circle" style={{ fontSize: 12 }} aria-hidden="true" /> Non conforme</span>}
                  </div>
                  <div className="rating-btns">
                    {[2, 1, 0].map((v, bi) => (
                      <button
                        key={v}
                        className={`rating-btn${val === v ? (v === 2 ? ' sel-ok' : v === 1 ? ' sel-mid' : ' sel-bad') : ''}`}
                        onClick={() => setRating(key, v)}
                        aria-label={v === 2 ? 'Conforme' : v === 1 ? 'Partiel' : 'Non conforme'}
                        title={v === 2 ? 'Conforme' : v === 1 ? 'Partiel' : 'Non conforme'}
                      >
                        <i className={`ti ${v === 2 ? 'ti-check' : v === 1 ? 'ti-minus' : 'ti-x'}`} style={{ fontSize: 13 }} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <input
                    className="form-control"
                    style={{ fontSize: 12, height: 34, padding: '6px 10px' }}
                    placeholder="Observation..."
                    aria-label={`Observation pour ${item}`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Observations générales</label>
        <textarea className="form-control" value={obs} onChange={e => setObs(e.target.value)} placeholder="Remarques globales, points forts, axes d'amélioration..." />
      </div>

      <div className="sec">Photos de l'intervention</div>
      <div className="photo-zone" onClick={() => setPhotos(p => [...p, p.length])}>
        <i className="ti ti-camera" style={{ fontSize: 26, color: '#bbb' }} aria-hidden="true" />
        <p>Cliquer pour ajouter une photo (simulé)</p>
        {photos.length > 0 && (
          <div className="photos-grid">
            {photos.map((_, i) => (
              <div key={i} className="photo-thumb">
                <i className={`ti ${PHOTO_ICONS[i % PHOTO_ICONS.length]}`} aria-hidden="true" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sig-wrapper">
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Signature du responsable qualité</div>
        <canvas
          ref={sigRef}
          className="sig-canvas"
          height={80}
          aria-label="Zone de signature"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={clearSig}>Effacer</button>
          {signed && <span style={{ fontSize: 12, color: '#3B6D11' }}><i className="ti ti-check" aria-hidden="true" /> Signé — {selectedAgent?.name}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #eee' }}>
        <button className="btn btn-secondary" onClick={reset}>Réinitialiser</button>
        <button className="btn btn-secondary" onClick={() => setShowPDF(p => !p)}>
          <i className="ti ti-eye" style={{ fontSize: 15 }} aria-hidden="true" /> Aperçu rapport
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <i className="ti ti-file-check" style={{ fontSize: 15 }} aria-hidden="true" />
          {saving ? 'Sauvegarde...' : 'Valider & sauvegarder'}
        </button>
      </div>

      {showPDF && (
        <div className="pdf-preview">
          <div className="pdf-print-btn">
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <i className="ti ti-printer" style={{ fontSize: 14 }} aria-hidden="true" /> Imprimer
            </button>
          </div>
          <div className="pdf-header-block">
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Rapport d'audit qualité</div>
              <div style={{ fontSize: 11, opacity: .65, marginTop: 3 }}>CRYSTAL FACILITY — Document confidentiel</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 700 }}>{rated > 0 ? `${score}%` : '—'}</div>
              <div style={{ fontSize: 12, opacity: .7 }}>{rated > 0 ? statusOf(score) : 'Non évalué'}</div>
            </div>
          </div>
          <div className="pdf-meta-grid">
            <div className="pdf-meta-card"><div className="pdf-meta-lbl">Site</div><div className="pdf-meta-val">{selectedSite?.name || '—'}</div></div>
            <div className="pdf-meta-card"><div className="pdf-meta-lbl">Responsable</div><div className="pdf-meta-val">{selectedAgent?.name || '—'}</div></div>
            <div className="pdf-meta-card"><div className="pdf-meta-lbl">Date</div><div className="pdf-meta-val">{fmtDate(date)}</div></div>
          </div>
          {GRILLE.map((sec, si) => (
            <div key={si} className="pdf-section">
              <h4>{sec.cat}</h4>
              {sec.items.map((item, ii) => {
                const v = ratings[`${si}-${ii}`]
                const icon = v === 2 ? '✓' : v === 1 ? '~' : v === 0 ? '✗' : '—'
                const col = v === 2 ? '#3B6D11' : v === 1 ? '#854F0B' : v === 0 ? '#A32D2D' : '#aaa'
                return (
                  <div key={ii} className="pdf-row">
                    <span>{item}</span>
                    <span style={{ fontWeight: 600, color: col }}>{icon}</span>
                  </div>
                )
              })}
            </div>
          ))}
          <div className="pdf-section">
            <h4>Observations</h4>
            <p style={{ fontSize: 12, color: '#333' }}>{obs || '—'}</p>
          </div>
          <div className="pdf-section">
            <h4>Photos</h4>
            <p style={{ fontSize: 12, color: '#888' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} jointe{photos.length > 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, borderTop: '1px solid #eee', marginTop: 12 }}>
            <span style={{ fontSize: 11, color: '#888' }}>Signature :</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: signed ? '#3B6D11' : '#A32D2D' }}>{signed ? `✓ Signé — ${selectedAgent?.name}` : 'Non signé'}</span>
          </div>
        </div>
      )}
    </>
  )
}
