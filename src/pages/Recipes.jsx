import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import Segmented from '../components/Segmented.jsx'
import Empty from '../components/Empty.jsx'
import RecipeSheet from '../sheets/RecipeSheet.jsx'
import { api, usingBackend } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import Thumb from '../components/Thumb.jsx'
import { recipePhoto } from '../lib/images.js'
import { allRecipes, recipeScore } from '../lib/food.js'
import { daysLeft, uid } from '../lib/dates.js'

export default function Recipes() {
  const { data, prefs, setPrefs } = useStore()
  const { openSheet, toast } = useUI()
  const [tab, setTab] = useState('mine')
  const [busy, setBusy] = useState(false)

  let list = allRecipes(data).map((r) => ({ r, ...recipeScore(data.items, r) }))
  if (tab === 'mine') list = list.filter((x) => x.h >= 2).sort((a, b) => b.e - a.e || a.miss - b.miss)

  const toggleFav = (id) => setPrefs({ fav: prefs.fav.includes(id) ? prefs.fav.filter((x) => x !== id) : [...prefs.fav, id] })

  const aiRecipe = async () => {
    setBusy(true)
    try {
      const items = data.items.filter((i) => i.pct > 0)
        .map((i) => ({ name: i.name, pct: i.pct, days_left: daysLeft(i.exp) }))
        .sort((a, b) => a.days_left - b.days_left)
      // Backend returns { name, emoji, minutes, ingredients: [], steps: [] }
      const r = await api.suggestRecipe(items)
      openSheet(<RecipeSheet recipe={{
        id: 'ai' + uid(), ai: true, name: String(r.name).slice(0, 60), em: r.emoji || '✨',
        min: parseInt(r.minutes) || 30,
        ing: (r.ingredients || []).slice(0, 10).map((x) => String(x).toLowerCase()),
        steps: (r.steps || []).slice(0, 8).map(String),
      }} />)
    } catch (e) { toast(e.message) } finally { setBusy(false) }
  }

  return (
    <>
      <TopBar title="Recipe Suggestions" />
      <div className="screen">
        <Segmented value={tab} onChange={setTab} options={[['mine', 'Use my ingredients'], ['all', 'All recipes']]} />
        <button className="aibtn" disabled={busy}
          onClick={() => (usingBackend ? aiRecipe() : toast('AI recipes need the FOODWISE backend.'))}>
          ✨ <span>{busy ? 'Thinking up a recipe…' : 'Create a recipe from what’s expiring'}<br />
            <span className="muted small">AI suggests a dish that uses your soon-to-expire food</span></span>
        </button>
        {!list.length && <Empty icon="🍳">Add a few items to your inventory to get matching recipes.</Empty>}
        {list.map(({ r, h, e }) => (
          <div className="card rcard" key={r.id}>
            <button className="pic" onClick={() => openSheet(<RecipeSheet recipe={r} />)} aria-label={`Open ${r.name}`}><Thumb className="pic-in" src={recipePhoto(r)} em={r.em} /></button>
            <button className="t" style={{ textAlign: 'left' }} onClick={() => openSheet(<RecipeSheet recipe={r} />)}>
              <b>{r.name}</b>
              <div className="meta">
                <span>⏱ {r.min} mins</span>
                <span className="hl">Uses {h} of {r.ing.length} items</span>
                {e > 0 && <span className="tag-red">{e} expiring</span>}
              </div>
            </button>
            <button className="heart" onClick={() => toggleFav(r.id)} aria-label="Save recipe">{prefs.fav.includes(r.id) ? '💚' : '🤍'}</button>
          </div>
        ))}
      </div>
    </>
  )
}
