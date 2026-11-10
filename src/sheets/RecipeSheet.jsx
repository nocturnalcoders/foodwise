import PlanSheet from './PlanSheet.jsx'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import Thumb from '../components/Thumb.jsx'
import { recipePhoto } from '../lib/images.js'
import { findHave } from '../lib/food.js'
import { daysLeft, uid } from '../lib/dates.js'

/** Shows a recipe. `recipe.ai` marks one created by the AI that may not be saved yet. */
export default function RecipeSheet({ recipe: r }) {
  const { data, upsert } = useStore()
  const { openSheet, closeSheet, toast } = useUI()
  const isDraft = r.ai && !data.recipes.some((x) => x.id === r.id)
  const missing = r.ing.filter((k) => !findHave(data.items, k))

  const saveDraft = () => { if (isDraft) upsert('recipes', r) }
  const addMissing = () => {
    let n = 0
    missing.forEach((k) => {
      if (!data.shop.some((s) => !s.done && s.name.toLowerCase() === k)) {
        upsert('shop', { id: uid(), name: k[0].toUpperCase() + k.slice(1), done: false }); n++
      }
    })
    closeSheet()
    toast(n ? `${n} item${n > 1 ? 's' : ''} added to shopping list` : 'Already on your list')
  }

  return (
    <>
      <Thumb className="sheet-hero" src={recipePhoto(r)} em={r.em} alt={r.name} />
      <h2>{r.name}</h2>
      <p className="muted small">⏱ {r.min} mins</p>
      <h2 className="sec">Ingredients</h2>
      <div>
        {r.ing.map((k) => {
          const it = findHave(data.items, k)
          const soon = it && daysLeft(it.exp) <= 3
          return <span key={k} className={`pill ${it ? (soon ? 'exp' : 'have') : 'need'}`}>{it ? '✓ ' : ''}{k}{soon ? ' (use soon)' : ''}</span>
        })}
      </div>
      <h2 className="sec">Steps</h2>
      <ol style={{ paddingLeft: 20 }} className="small">
        {r.steps.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
      </ol>
      <div className="stack" style={{ marginTop: 16 }}>
        <button className="btn" onClick={() => { saveDraft(); openSheet(<PlanSheet recipeId={r.id} />) }}>Add to meal plan</button>
        {isDraft && <button className="btn ghost" onClick={() => { saveDraft(); closeSheet(); toast('Recipe saved') }}>Save to my recipes</button>}
        {missing.length > 0 && <button className="btn ghost" onClick={addMissing}>Add missing items to shopping list</button>}
      </div>
      {r.ai && <p className="note">Created by AI from your inventory.</p>}
      <p className="note">Suggestions are for guidance only. Check allergies and food safety before cooking.</p>
    </>
  )
}
