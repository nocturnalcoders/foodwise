import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import Segmented from '../components/Segmented.jsx'
import { useStore } from '../lib/store.jsx'
import { emojiFor } from '../lib/food.js'
import { MON, WD, addDays, kg, monthStart, sumKg, today } from '../lib/dates.js'

function periods(p) {
  const out = []
  if (p === 'week') for (let k = 6; k >= 0; k--) { const s = addDays(-k); out.push({ l: WD[s.getDay()][0], s, e: addDays(1, s) }) }
  else if (p === 'month') for (let k = 5; k >= 0; k--) out.push({ l: MON[monthStart(-k).getMonth()], s: monthStart(-k), e: monthStart(-k + 1) })
  else { const y0 = today().getFullYear(); for (let k = 2; k >= 0; k--) { const y = y0 - k; out.push({ l: String(y), s: new Date(y, 0, 1), e: new Date(y + 1, 0, 1) }) } }
  return out
}

export default function WasteTracker() {
  const { data } = useStore()
  const [p, setP] = useState('month')
  const y = today().getFullYear()
  const [cur, prev, label] = {
    week: [sumKg(data.waste, addDays(-6), addDays(1)), sumKg(data.waste, addDays(-13), addDays(-6)), 'last week'],
    month: [sumKg(data.waste, monthStart(0), addDays(1)), sumKg(data.waste, monthStart(-1), monthStart(0)), 'last month'],
    year: [sumKg(data.waste, new Date(y, 0, 1), addDays(1)), sumKg(data.waste, new Date(y - 1, 0, 1), new Date(y, 0, 1)), 'last year'],
  }[p]
  const change = prev ? Math.round(((cur - prev) / prev) * 100) : 0
  const bars = periods(p).map((x) => ({ ...x, v: sumKg(data.waste, x.s, x.e) }))
  const max = Math.max(...bars.map((x) => x.v), 0.5)
  const by = {}
  data.waste.forEach((w) => { by[w.name] = (by[w.name] || 0) + w.kg })
  const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <>
      <TopBar title="Waste Tracker" />
      <div className="screen">
        <Segmented value={p} onChange={setP} options={[['week', 'Week'], ['month', 'Month'], ['year', 'Year']]} />
        <div className="bignum">{kg(cur)} kg</div>
        <div className="muted small">of food wasted this {p}</div>
        {prev > 0 && <div className={change <= 0 ? 'down' : 'up'}>{change <= 0 ? '↓' : '↑'} {Math.abs(change)}% from {label}</div>}
        <div className="chart" style={{ marginTop: 14 }}>
          {bars.map((x, k) => (
            <div key={x.l + k} className={`c ${k === bars.length - 1 ? 'cur' : ''}`}>
              <small>{x.v ? kg(x.v) : ''}</small><i style={{ height: `${(x.v / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="xl">{bars.map((x, k) => <span key={x.l + k}>{x.l}</span>)}</div>
        <h2 className="sec">Top wasted items (all time)</h2>
        <div className="card" style={{ padding: '4px 14px' }}>
          {top.length ? top.map(([n, v]) => <div className="kv" key={n}><span>{emojiFor(n)} {n}</span><b>{kg(v)} kg</b></div>)
            : <p className="muted small" style={{ padding: '10px 0' }}>No waste logged yet.</p>}
        </div>
        <p className="note">To log waste, open an item in your inventory and tap “Log as wasted”.</p>
      </div>
    </>
  )
}
