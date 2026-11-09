import { useStore } from './store.jsx'
import { useUI } from './ui.jsx'
import { findHave, singular } from './food.js'
import { uid } from './dates.js'
import ExpiryText from '../components/ExpiryText.jsx'

/**
 * Smart shopping: before adding an item, check if the household already has it.
 * Returns addToShop(name, { force }).
 */
export function useAddToShop() {
  const { data, upsert } = useStore()
  const { toast, openSheet, closeSheet } = useUI()

  const add = (name) => { upsert('shop', { id: uid(), name, done: false }); toast(`${name} added to shopping list`) }

  return (name, { force = false } = {}) => {
    const h = findHave(data.items, singular(name))
    if (!force && h && h.pct > 20) {
      openSheet(
        <>
          <h2>You already have {h.name}</h2>
          <p className="alertbox">{h.em} {h.qty}, {h.pct}% left. <ExpiryText exp={h.exp} /></p>
          <p className="small muted" style={{ marginBottom: 14 }}>Buying more could lead to waste. Add it anyway?</p>
          <div className="stack">
            <button className="btn ghost" onClick={closeSheet}>Don’t add</button>
            <button className="btn" onClick={() => { add(name); closeSheet() }}>Add anyway</button>
          </div>
        </>,
      )
      return false
    }
    add(name)
    return true
  }
}
