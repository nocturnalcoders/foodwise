import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'

export default function Splash() {
  const { user } = useStore()
  const { go } = useUI()
  const start = () => go(user ? 'home' : 'login', { reset: true })
  return (
    <div className="splash" onClick={start} onKeyDown={(e) => e.key === 'Enter' && start()} role="button" tabIndex={0}>
      <div className="basket">🧺</div>
      <div className="logo">FOODWISE</div>
      <div className="tagline">Manage food, reduce waste, save money</div>
      <p className="muted small" style={{ marginTop: 60 }}>Tap to start</p>
    </div>
  )
}
