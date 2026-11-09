import Icon from '../components/Icon.jsx'
import TopBar from '../components/TopBar.jsx'
import HouseholdSheet from '../sheets/HouseholdSheet.jsx'
import { usingBackend } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'

export default function Profile() {
  const { user, prefs, setPrefs, reset, logout } = useStore()
  const { go, openSheet, toast } = useUI()

  const about = () => openSheet(
    <>
      <div className="basket" style={{ fontSize: 50 }}>🧺</div>
      <h2>FOODWISE</h2>
      <p className="small" style={{ margin: '8px 0' }}>A household food management prototype by BU3102 Group 33, James Cook University Singapore. It links inventory, expiry alerts, recipes, waste history and smart shopping into one loop, so past waste shapes future purchases.</p>
      <p className="note">{usingBackend ? 'Connected to the FOODWISE backend.' : 'Offline mode: data is stored only on this device.'}</p>
    </>,
  )

  return (
    <>
      <TopBar title="Profile" />
      <div className="screen">
        <div className="prof">
          <div className="avatar">{(user?.name || '?')[0].toUpperCase()}</div>
          <div><b style={{ fontSize: 18 }}>{user?.name || 'Guest'}</b><div className="muted small">{user?.email}</div></div>
        </div>
        <div className="menu">
          <button onClick={() => openSheet(<HouseholdSheet />)}><Icon name="users" /><span>My household<br /><span className="muted small">Share food with the people you live with</span></span><Icon name="chev" /></button>
          <div className="mi">
            <Icon name="bell" /><span>Expiry notifications</span>
            <button className={`switch ${prefs.notif ? 'on' : ''}`} onClick={() => setPrefs({ notif: !prefs.notif })} aria-label="Toggle notifications" aria-pressed={prefs.notif} />
          </div>
          <button onClick={() => go('shop')}><Icon name="cart" /><span>Shopping list</span><Icon name="chev" /></button>
          {!usingBackend && (
            <button onClick={() => { if (confirm('Reset all data to the demo set?')) { reset(); toast('Demo data restored') } }}>
              <Icon name="gear" /><span>Reset demo data</span><Icon name="chev" />
            </button>
          )}
          <button onClick={about}><Icon name="info" /><span>About FOODWISE</span><Icon name="chev" /></button>
          <button onClick={() => { logout(); go('login', { reset: true }) }} style={{ color: 'var(--red)' }}><Icon name="out" /><span>Log out</span></button>
        </div>
      </div>
    </>
  )
}
