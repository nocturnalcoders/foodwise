import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import TopBar from '../components/TopBar.jsx'
import PlanSheet from '../sheets/PlanSheet.jsx'
import RecipeSheet from '../sheets/RecipeSheet.jsx'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import Thumb from '../components/Thumb.jsx'
import { recipePhoto } from '../lib/images.js'
import { findHave, getRecipe } from '../lib/food.js'
import { MON, addDays, fmtDay, iso, today } from '../lib/dates.js'

export default function MealPlanner() {
  const { data, remove } = useStore()
  const { go, openSheet } = useUI()
  const [weekOffset, setWeekOffset] = useState(0)
  const t = today()
  const start = addDays(-((t.getDay() + 6) % 7) + weekOffset * 7, t) // Monday
  const end = addDays(6, start)
  const days = [...Array(7)].map((_, k) => addDays(k, start))

  return (
    <>
      <TopBar title="Meal Planner" />
      <div className="screen">
        <div className="week">
          <button className="iconbtn" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week"><Icon name="chevl" /></button>
          <span>{MON[start.getMonth()]} {start.getDate()} – {MON[end.getMonth()]} {end.getDate()}, {end.getFullYear()}</span>
          <button className="iconbtn" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week"><Icon name="chev" /></button>
        </div>
        <button className="btn ghost sm" style={{ width: '100%', marginBottom: 4 }} onClick={() => go('recipes')}>Browse recipe suggestions</button>

        <div className="list days">
        {days.map((d) => {
          const meals = data.meals.filter((m) => m.date === iso(d))
          return (
            <div className="day" key={iso(d)}>
              <h3>{fmtDay(d)}{iso(d) === iso(t) ? ' · Today' : ''}</h3>
              {meals.length ? meals.map((m) => {
                const r = getRecipe(data, m.rid)
                const uses = r.ing.filter((k) => findHave(data.items, k)).join(', ')
                return (
                  <div className="row" key={m.id}>
                    <Thumb src={recipePhoto(r)} em={r.em} />
                    <button className="t" style={{ textAlign: 'left' }} onClick={() => openSheet(<RecipeSheet recipe={r} />)}>
                      <b>{r.name}</b><span className="muted small">Uses: {uses || 'shopping needed'}</span>
                    </button>
                    <button className="iconbtn" onClick={() => remove('meals', m.id)} aria-label="Remove meal"><Icon name="trash" /></button>
                  </div>
                )
              }) : <button className="empty-day" onClick={() => openSheet(<PlanSheet date={iso(d)} />)}>+ Plan a meal</button>}
            </div>
          )
        })}
        </div>
        <button className="btn" style={{ marginTop: 18 }} onClick={() => openSheet(<PlanSheet />)}><Icon name="plus" /> Plan new meal</button>
      </div>
    </>
  )
}
