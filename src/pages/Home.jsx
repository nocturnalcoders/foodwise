import Icon from '../components/Icon.jsx'
import ItemRow from '../components/ItemRow.jsx'
import RecipeSheet from '../sheets/RecipeSheet.jsx'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { allRecipes, recipeScore } from '../lib/food.js'
import { addDays, daysLeft, kg, monthStart, sumKg } from '../lib/dates.js'

export default function Home() {
  const { data, user } = useStore()
  const { go, openSheet } = useUI()
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const cur = sumKg(data.waste, monthStart(0), addDays(1))
  const prev = sumKg(data.waste, monthStart(-1), monthStart(0))
  const change = prev ? Math.round(((cur - prev) / prev) * 100) : 0
  const expiring = data.items.filter((i) => daysLeft(i.exp) <= 3 && i.pct > 0).sort((a, b) => a.exp.localeCompare(b.exp))
  const best = allRecipes(data).map((r) => ({ r, ...recipeScore(data.items, r) })).filter((x) => x.e > 0).sort((a, b) => b.e - a.e || a.miss - b.miss)[0]

  return (
    <div className="screen">
      <div className="greet">
        <h1>{greeting},<br />{user?.name || 'there'} 👋</h1>
        <button className="iconbtn" onClick={() => go('inventory')} aria-label="Expiry alerts"><Icon name="bell" /></button>
      </div>

      <button className="stat" style={{ width: '100%', textAlign: 'left' }} onClick={() => go('waste')}>
        <div className="ic"><Icon name="leaf" /></div>
        <div>
          <span className="small muted">Food wasted this month</span>
          <big>{kg(cur)} kg</big>
          <span className={change <= 0 ? 'down' : 'up'}>{change <= 0 ? '↓' : '↑'} {Math.abs(change)}% vs last month</span>
        </div>
      </button>

      <div className="grid2">
        <button className="card tile" onClick={() => go('inventory')}><Icon name="box" />My inventory</button>
        <button className="card tile" onClick={() => go('plan')}><Icon name="cal" />Meal planner</button>
        <button className="card tile" onClick={() => go('shop')}><Icon name="cart" />Shopping list</button>
        <button className="card tile" onClick={() => go('waste')}><Icon name="chart" />Waste tracker</button>
      </div>

      <h2 className="sec">Use these first ({expiring.length})</h2>
      {expiring.length ? expiring.slice(0, 3).map((i) => <ItemRow key={i.id} item={i} />) : <p className="muted small">Nothing is close to expiry. Nice work.</p>}

      {best && (
        <button className="tip" style={{ width: '100%', textAlign: 'left' }} onClick={() => openSheet(<RecipeSheet recipe={best.r} />)}>
          <div style={{ flex: 1 }}>
            <b>Tip of the day</b>
            <span className="small">Cook {best.r.name} tonight to use {best.e} item{best.e > 1 ? 's' : ''} that expire soon.</span>
          </div>
          <div className="big">{best.r.em}</div>
        </button>
      )}
    </div>
  )
}
