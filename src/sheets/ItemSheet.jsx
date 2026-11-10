import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import ExpiryText from '../components/ExpiryText.jsx'
import RecipeSheet from './RecipeSheet.jsx'
import WasteSheet from './WasteSheet.jsx'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import Thumb from '../components/Thumb.jsx'
import { itemPhoto, recipePhoto, shrinkImage } from '../lib/images.js'
import { useAddToShop } from '../lib/useShopping.jsx'
import { allRecipes, SAVED_KG_PER_ITEM } from '../lib/food.js'
import { daysLeft, iso, today, uid } from '../lib/dates.js'

export default function ItemSheet({ id }) {
  const { data, upsert, remove } = useStore()
  const { openSheet, closeSheet, toast } = useUI()
  const addToShop = useAddToShop()
  const item = data.items.find((x) => x.id === id)
  const [pct, setPct] = useState(item?.pct ?? 0)
  const photoRef = useRef(null)
  if (!item) return <p className="muted">This item was removed.</p>

  const onPhoto = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    try { upsert('items', { ...item, pct, photo: await shrinkImage(f, 360) }); toast('Photo updated') }
    catch (err) { toast(err.message) }
  }

  const commit = () => { if (pct !== item.pct) upsert('items', { ...item, pct }) }
  const recipes = allRecipes(data).filter((r) => r.ing.some((k) => item.name.toLowerCase().includes(k))).slice(0, 3)

  const usedUp = () => {
    remove('items', item.id)
    if (daysLeft(item.exp) >= 0) upsert('saved', { id: uid(), name: item.name, kg: SAVED_KG_PER_ITEM, date: iso(today()) })
    closeSheet(); toast(`${item.name} used up. Good save!`)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button className="photo-btn" onClick={() => photoRef.current.click()} aria-label="Change photo">
          <Thumb className="em big" src={itemPhoto(item)} em={item.em} alt={item.name} />
          <span className="cam-badge"><Icon name="cam" /></span>
        </button>
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
        <div><h2>{item.name}</h2><ExpiryText exp={item.exp} /> <span className="muted small">· {item.qty}</span></div>
      </div>
      <label className="small" style={{ fontWeight: 600 }} htmlFor="pct">How much is left? <b>{pct}%</b></label>
      <input id="pct" type="range" min="0" max="100" step="5" value={pct}
        onChange={(e) => setPct(+e.target.value)} onPointerUp={commit} onKeyUp={commit} onBlur={commit} />
      {recipes.length > 0 && <>
        <h2 className="sec">Cook it with</h2>
        {recipes.map((r) => (
          <button key={r.id} className="row" onClick={() => openSheet(<RecipeSheet recipe={r} />)}>
            <Thumb src={recipePhoto(r)} em={r.em} />
            <div className="t"><b>{r.name}</b><span className="muted small">{r.min} mins</span></div>
            <Icon name="chev" />
          </button>
        ))}
      </>}
      <div className="stack" style={{ marginTop: 14 }}>
        <button className="btn" onClick={usedUp}>Mark as used up</button>
        <button className="btn danger" onClick={() => openSheet(<WasteSheet item={item} />)}>Log as wasted</button>
        <button className="btn ghost" onClick={() => { closeSheet(); addToShop(item.name) }}>Add to shopping list</button>
      </div>
    </>
  )
}
