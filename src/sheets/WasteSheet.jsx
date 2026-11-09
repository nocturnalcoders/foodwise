import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { iso, today, uid } from '../lib/dates.js'

const REASONS = ['Expired', 'Spoiled before expiry', 'Bought too much', 'Leftovers not eaten', 'Forgot about it']

export default function WasteSheet({ item }) {
  const { data, upsert, remove } = useStore()
  const { closeSheet, toast } = useUI()
  const [weight, setWeight] = useState('0.3')
  const [reason, setReason] = useState(REASONS[0])

  const save = () => {
    const kg = Math.max(0.1, parseFloat(weight) || 0.1)
    upsert('waste', { id: uid(), name: item.name, kg, date: iso(today()), reason })
    remove('items', item.id)
    closeSheet()
    const n = data.waste.filter((w) => w.name.toLowerCase() === item.name.toLowerCase()).length + 1
    toast(n >= 3 ? `You’ve wasted ${item.name} ${n} times. Try buying a smaller amount.` : 'Waste logged')
  }

  return (
    <>
      <h2>Log {item.name} as wasted</h2>
      <p className="muted small" style={{ marginBottom: 14 }}>This helps FOODWISE spot items you often throw away.</p>
      <div className="field">
        <label htmlFor="wk">Approximate weight (kg)</label>
        <input id="wk" className="input" type="number" step="0.1" min="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="wr">Reason</label>
        <select id="wr" className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      <button className="btn danger" onClick={save}>Log waste</button>
    </>
  )
}
