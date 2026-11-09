import Icon from './Icon.jsx'
import ExpiryText from './ExpiryText.jsx'
import ItemSheet from '../sheets/ItemSheet.jsx'
import { daysLeft } from '../lib/dates.js'
import { useUI } from '../lib/ui.jsx'

export default function ItemRow({ item }) {
  const { openSheet } = useUI()
  const d = daysLeft(item.exp)
  return (
    <button className={`row ${d <= 0 ? 'warn' : d <= 3 ? 'soon' : ''}`} onClick={() => openSheet(<ItemSheet id={item.id} />)}>
      <div className="em">{item.em}</div>
      <div className="t">
        <b>{item.name}</b>
        <ExpiryText exp={item.exp} />
        <div className="bar"><i style={{ width: `${item.pct}%` }} /></div>
      </div>
      <Icon name="chev" />
    </button>
  )
}
