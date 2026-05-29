import { useState, useEffect, useRef } from 'react'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { scoreColor, fmtDate } from '../lib/constants'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function Tendances({ data }) {
  const { sites, audits, loading } = data
  const [selectedSite, setSelectedSite] = useState('')
  const lineRef = useRef(null)
  const barRef = useRef(null)
  const lineChart = useRef(null)
  const barChart = useRef(null)

  useEffect(() => {
    if (sites.length && !selectedSite) setSelectedSite(sites[0]?.id || '')
  }, [sites])

  useEffect(() => {
    if (!selectedSite || !lineRef.current) return
    const siteAudits = audits
      .filter(a => a.site_id === selectedSite)
      .sort((a, b) => a.date.localeCompare(b.date))

    const labels = siteAudits.map(a => fmtDate(a.date))
    const scores = siteAudits.map(a => a.score)

    if (lineChart.current) lineChart.current.destroy()
    lineChart.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Score qualité',
          data: scores,
          borderColor: '#0e2753',
          backgroundColor: 'rgba(14,39,83,0.08)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: scores.map(s => scoreColor(s)),
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `Score : ${ctx.parsed.y}%` } } },
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { ticks: { font: { size: 11 }, maxRotation: 30 }, grid: { display: false } },
        },
      },
    })
  }, [selectedSite, audits])

  useEffect(() => {
    if (!barRef.current || !sites.length) return
    const siteAvgs = sites.map(s => {
      const sa = audits.filter(a => a.site_id === s.id)
      return {
        name: s.name.split('–')[0].trim().substring(0, 18),
        avg: sa.length ? Math.round(sa.reduce((a, b) => a + b.score, 0) / sa.length) : 0,
      }
    })

    if (barChart.current) barChart.current.destroy()
    barChart.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: siteAvgs.map(s => s.name),
        datasets: [{
          label: 'Score moyen',
          data: siteAvgs.map(s => s.avg),
          backgroundColor: siteAvgs.map(s => scoreColor(s.avg)),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `Moyenne : ${ctx.parsed.y}%` } } },
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { ticks: { font: { size: 11 }, maxRotation: 20 }, grid: { display: false } },
        },
      },
    })
  }, [sites, audits])

  if (loading) return <div className="loading"><i className="ti ti-loader" style={{ fontSize: 20 }} />Chargement...</div>

  const siteAudits = audits.filter(a => a.site_id === selectedSite)
  const siteName = sites.find(s => s.id === selectedSite)?.name || ''

  return (
    <>
      <div className="sec">Évolution du score — site sélectionné</div>
      <select className="form-control" style={{ width: 'auto', marginBottom: 12 }} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {siteAudits.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#888', padding: 40 }}>
          Aucun audit pour ce site.
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 12 }}>{siteName} — {siteAudits.length} audit{siteAudits.length > 1 ? 's' : ''}</div>
          <div className="chart-container" style={{ height: 220 }}>
            <canvas ref={lineRef} aria-label={`Évolution du score pour ${siteName}`}>
              Graphique d'évolution du score qualité.
            </canvas>
          </div>
        </div>
      )}

      <div className="sec">Comparaison des scores moyens par site</div>
      <div className="card">
        <div className="chart-container" style={{ height: 200 }}>
          <canvas ref={barRef} aria-label="Comparaison des scores moyens par site">
            Graphique comparatif des scores par site.
          </canvas>
        </div>
      </div>
    </>
  )
}
