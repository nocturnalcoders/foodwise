import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import TopBar from '../components/TopBar.jsx'
import Segmented from '../components/Segmented.jsx'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { CO2_PER_KG, PRICE_PER_KG, SAVED_KG_PER_ITEM, emojiFor } from '../lib/food.js'
import { addDays, kg, monthStart, sumKg } from '../lib/dates.js'

export default function Insights() {
  const { data } = useStore()
  const { go } = useUI()
  const [tab, setTab] = useState('impact')
  const saved = sumKg(data.saved, monthStart(0), addDays(1))

  return (
    <>
      <TopBar title="Insights" />
      <div className="screen">
        <Segmented value={tab} onChange={setTab} options={[['impact', 'Impact'], ['trends', 'Trends']]} />
        {tab === 'impact' ? (
          <>
            <div className="impact"><div className="ic"><Icon name="leaf" /></div><div><big>{kg(saved)} kg</big><span className="small">Food used before expiry this month</span></div></div>
            <div className="impact"><div className="ic">S$</div><div><big>S${(saved * PRICE_PER_KG).toFixed(2)}</big><span className="small">Estimated savings</span></div></div>
            <div className="impact"><div className="ic">CO₂</div><div><big>{kg(saved * CO2_PER_KG)} kg</big><span className="small">CO₂e emissions avoided</span></div></div>
            <p className="note">Estimates assume about S${PRICE_PER_KG.toFixed(2)} per kg of food and {CO2_PER_KG} kg CO₂e per kg of food not wasted. Each item marked “used up” counts as roughly {SAVED_KG_PER_ITEM} kg.</p>
            <button className="btn ghost" style={{ marginTop: 14 }} onClick={() => go('waste')}>Open waste tracker</button>
          </>
        ) : <Trends data={data} />}
      </div>
    </>
  )
}

function Trends({ data }) {
  const reasons = {}
  data.waste.forEach((w) => { const r = w.reason || 'Other'; reasons[r] = (reasons[r] || 0) + w.kg })
  const total = Object.values(reasons).reduce((a, b) => a + b, 0) || 1
  const counts = {}
  data.waste.forEach((w) => { counts[w.name] = (counts[w.name] || 0) + 1 })
  const repeat = Object.entries(counts).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])
  const cats = { fridge: 0, freezer: 0, pantry: 0 }
  data.items.forEach((i) => { cats[i.cat]++ })

  return (
    <>
      <h2 className="sec">Why food gets thrown away</h2>
      <div className="card" style={{ padding: '4px 14px' }}>
        {Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => <div className="kv" key={k}><span>{k}</span><b>{Math.round((v / total) * 100)}%</b></div>)}
      </div>
      <h2 className="sec">Repeat waste</h2>
      {repeat.length ? repeat.map(([n, c]) => (
        <div className="row soon" key={n}><div className="em">{emojiFor(n)}</div><div className="t"><b>{n}</b><span className="small">Wasted {c} times. Buy about half your usual amount.</span></div></div>
      )) : <p className="muted small">No repeat waste yet.</p>}
      <h2 className="sec">What’s at home</h2>
      <div className="card" style={{ padding: '4px 14px' }}>
        <div className="kv"><span>🧊 Fridge</span><b>{cats.fridge}</b></div>
        <div className="kv"><span>❄️ Freezer</span><b>{cats.freezer}</b></div>
        <div className="kv"><span>🥫 Pantry</span><b>{cats.pantry}</b></div>
      </div>
    </>
  )
}
