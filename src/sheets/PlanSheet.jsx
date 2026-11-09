import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { allRecipes, recipeScore } from '../lib/food.js'
import { iso, today, uid } from '../lib/dates.js'

export default function PlanSheet({ recipeId, date }) {
  const { data, upsert } = useStore()
  const { closeSheet, toast, screen, go } = useUI()
  const options = allRecipes(data).map((r) => ({ r, ...recipeScore(data.items, r) })).sort((a, b) => b.e - a.e || b.h - a.h)
  const [day, setDay] = useState(date || iso(today()))
  const [rid, setRid] = useState(recipeId || options[0]?.r.id)

  const save = () => {
    if (!day) { toast('Choose a day.'); return }
    upsert('meals', { id: uid(), date: day, rid })
    closeSheet()
    if (screen !== 'plan') go('plan')
    toast('Meal planned')
  }

  return (
    <>
      <h2>Plan a meal</h2>
      <p className="muted small" style={{ marginBottom: 14 }}>Recipes that use expiring food are listed first.</p>
      <div className="field">
        <label htmlFor="pd">Day</label>
        <input id="pd" className="input" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="pr">Recipe</label>
        <select id="pr" className="input" value={rid} onChange={(e) => setRid(e.target.value)}>
          {options.map(({ r, h, e }) => (
            <option key={r.id} value={r.id}>{r.name} (have {h}/{r.ing.length}{e ? ', uses expiring' : ''})</option>
          ))}
        </select>
      </div>
      <button className="btn" onClick={save}>Add to plan</button>
    </>
  )
}
