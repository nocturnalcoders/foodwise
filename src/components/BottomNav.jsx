import Icon from './Icon.jsx'
import { useUI } from '../lib/ui.jsx'

const TABS = [['home','home','Home'],['inventory','box','Inventory'],['plan','cal','Plan'],['insights','chart','Insights'],['profile','user','Profile']]
// Which tab is highlighted for each screen
const TAB_OF = { home:'home', inventory:'inventory', add:'inventory', plan:'plan', recipes:'plan', shop:'home', waste:'insights', insights:'insights', profile:'profile' }

export default function BottomNav() {
  const { screen, go } = useUI()
  return (
    <nav className="nav">
      {TABS.map(([s, icon, label]) => (
        <button key={s} className={TAB_OF[screen] === s ? 'on' : ''} onClick={() => go(s, { reset: true })} aria-label={label}>
          <Icon name={icon} />{label}
        </button>
      ))}
    </nav>
  )
}
