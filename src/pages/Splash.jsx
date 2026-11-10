import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { ONBOARD_KEY } from './Onboarding.jsx'

const seenOnboarding = () => { try { return !!localStorage.getItem(ONBOARD_KEY) } catch { return true } }

export default function Splash() {
  const { user } = useStore()
  const { go } = useUI()
  const start = () => go(user ? 'home' : seenOnboarding() ? 'login' : 'onboard', { reset: true })
  return (
    <div className="splash photo" onClick={start} onKeyDown={(e) => e.key === 'Enter' && start()} role="button" tabIndex={0}>
      <div className="splash-brand">
        <div className="basket">🧺</div>
        <div className="logo">FOODWISE</div>
        <div className="tagline">Manage food, reduce waste, save money</div>
      </div>
      <span className="splash-cta">Tap to start</span>
      <p className="splash-credit">BU3102 Group 33 · James Cook University Singapore</p>
    </div>
  )
}
