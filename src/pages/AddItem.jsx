import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import TopBar from '../components/TopBar.jsx'
import { api, usingBackend } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { emojiFor } from '../lib/food.js'
import { foodPhoto, shrinkImage } from '../lib/images.js'
import Thumb from '../components/Thumb.jsx'
import { addDays, iso, today, uid } from '../lib/dates.js'

const UNITS = ['pcs', 'pack', 'L', 'ml', 'kg', 'g']

export default function AddItem() {
  const { upsert } = useStore()
  const { back, toast, params } = useUI()
  const fileRef = useRef(null)
  const photoRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [form, setForm] = useState({ name: params.name || '', cat: 'fridge', exp: iso(addDays(7)), qty: 1, unit: 'pcs' })
  const [scan, setScan] = useState({ busy: false, msg: 'Take a photo of the item or its label', note: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onPhoto = async (file) => {
    if (!file) return
    setScan({ busy: true, msg: 'Reading your photo…', note: '' })
    shrinkImage(file, 360).then(setPhoto).catch(() => {})
    try {
      // Backend returns { name, category, expiry_date, shelf_life_days, quantity, unit }
      const r = await api.scanPhoto(file)
      if (!r?.name) { setScan({ busy: false, msg: 'No food found. Try another photo.', note: '' }); return }
      const dated = /^\d{4}-\d{2}-\d{2}$/.test(r.expiry_date || '')
      setForm((f) => ({
        ...f,
        name: String(r.name).slice(0, 40),
        cat: ['fridge', 'freezer', 'pantry'].includes(r.category) ? r.category : f.cat,
        exp: dated ? r.expiry_date : iso(addDays(Math.max(1, Math.min(730, parseInt(r.shelf_life_days) || 7)))),
        qty: Math.max(1, Math.round(+r.quantity || 1)),
        unit: UNITS.includes(r.unit) ? r.unit : f.unit,
      }))
      setScan({ busy: false, msg: 'Photo read. Check the details below.', note: dated ? 'Expiry date read from the label.' : 'No date found on the label, so the expiry date is an estimate. Please check it.' })
    } catch (e) {
      setScan({ busy: false, msg: 'Couldn’t read the photo. Try again.', note: e.message })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = () => {
    const name = form.name.trim()
    if (!name) { toast('Enter a food name to add the item.'); return }
    if (!form.exp) { toast('Choose an expiry date.'); return }
    upsert('items', { id: uid(), name, cat: form.cat, exp: form.exp, qty: `${form.qty} ${form.unit}`, pct: 100, em: emojiFor(name), added: iso(today()), photo })
    toast(`${name} added to inventory`)
    back()
  }

  return (
    <>
      <TopBar title="Add Food Item" />
      <div className="screen">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPhoto(e.target.files[0])} />
        <button className="scan" disabled={scan.busy}
          onClick={() => (usingBackend ? fileRef.current.click() : toast('Photo scan needs the FOODWISE backend. Enter the item manually for now.'))}>
          <Icon name="cam" />{scan.msg}
        </button>
        {scan.note && <p className="note" style={{ textAlign: 'center' }}>{scan.note}</p>}
        <div className="or">or enter manually</div>
        <div className="photo-field">
          <Thumb className="em big" src={photo || foodPhoto(form.name)} em={form.name ? emojiFor(form.name) : '📷'} />
          <div className="field" style={{ flex: 1, margin: 0 }}><label htmlFor="fn">Food name</label><input id="fn" className="input" placeholder="e.g., Milk" value={form.name} onChange={set('name')} /></div>
        </div>
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files[0]; e.target.value = ''
          if (f) { try { setPhoto(await shrinkImage(f, 360)) } catch (err) { toast(err.message) } }
        }} />
        <div className="photo-actions">
          <button className="link small" onClick={() => photoRef.current.click()}><Icon name="image" />{photo ? 'Change photo' : 'Add your own photo'}</button>
          {photo && <button className="link small muted" onClick={() => setPhoto(null)}>Remove</button>}
        </div>
        <div className="field">
          <label htmlFor="fc">Category</label>
          <select id="fc" className="input" value={form.cat} onChange={set('cat')}>
            <option value="fridge">🧊 Fridge</option><option value="freezer">❄️ Freezer</option><option value="pantry">🥫 Pantry</option>
          </select>
        </div>
        <div className="field"><label htmlFor="fd">Expiry date</label><input id="fd" className="input" type="date" value={form.exp} onChange={set('exp')} /></div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="fq">Quantity</label>
            <div className="stepper">
              <button onClick={() => setForm((f) => ({ ...f, qty: Math.max(1, f.qty - 1) }))} aria-label="Less">−</button>
              <input id="fq" inputMode="numeric" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: Math.max(1, parseInt(e.target.value) || 1) }))} />
              <button onClick={() => setForm((f) => ({ ...f, qty: f.qty + 1 }))} aria-label="More">+</button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="fu">Unit</label>
            <select id="fu" className="input" value={form.unit} onChange={set('unit')}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select>
          </div>
        </div>
        <button className="btn" onClick={save}>Add item</button>
      </div>
    </>
  )
}
