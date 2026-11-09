import { useEffect, useState } from 'react'
import { api, usingBackend } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'

/** Household sharing. Works when the backend is connected (see API.md). */
export default function HouseholdSheet() {
  const { user, reload } = useStore()
  const { toast, closeSheet } = useUI()
  const [hh, setHh] = useState(undefined) // undefined = loading, null = none
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { api.getHousehold().then(setHh).catch(() => setHh(null)) }, [])

  const run = async (fn, done) => {
    setBusy(true)
    try { const r = await fn(); setHh(r); await reload(); toast(done) } catch (e) { toast(e.message) } finally { setBusy(false) }
  }

  if (!usingBackend) {
    return (
      <>
        <h2>Share with your household</h2>
        <p className="small" style={{ margin: '8px 0 12px' }}>Household sharing lets everyone at home see the same inventory, shopping list and meal plan.</p>
        <p className="alertbox">This needs the FOODWISE backend. The app is running offline right now, so data stays on this device.</p>
      </>
    )
  }
  if (hh === undefined) return <p className="muted">Loading household…</p>

  if (hh) {
    return (
      <>
        <h2>{hh.name}</h2>
        <p className="muted small">Everyone here shares one inventory, shopping list, meal plan and waste log.</p>
        <div className="code">{hh.code}</div>
        <p className="small muted" style={{ textAlign: 'center', marginBottom: 14 }}>Share this code with your housemates.</p>
        {(hh.members || []).map((m) => (
          <div className="row" key={m.id}><div className="em">👤</div><div className="t"><b>{m.name}</b></div>{m.id === user?.id && <span className="muted small">You</span>}</div>
        ))}
        <p className="note">Subscription covers up to 3 members; extra members have an additional fee.</p>
        <button className="btn danger" style={{ marginTop: 14 }} disabled={busy}
          onClick={() => { if (confirm('Leave this household?')) run(() => api.leaveHousehold().then(() => null), 'You left the household').then(closeSheet) }}>
          Leave household
        </button>
      </>
    )
  }

  return (
    <>
      <h2>Share with your household</h2>
      <p className="muted small" style={{ marginBottom: 14 }}>Create a household to share one inventory, shopping list and meal plan.</p>
      <button className="btn" disabled={busy} onClick={() => run(() => api.createHousehold(`${user?.name || 'My'}’s household`), 'Household created')}>Create a household</button>
      <div className="or">or join one</div>
      <div className="addline">
        <input className="input" placeholder="Code, e.g. K7M2QP" maxLength={6} value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
        <button className="btn sm" disabled={busy || code.length !== 6} onClick={() => run(() => api.joinHousehold(code), 'You joined the household')}>Join</button>
      </div>
    </>
  )
}
