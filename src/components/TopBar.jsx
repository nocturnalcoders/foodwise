import Icon from './Icon.jsx'
import { useUI } from '../lib/ui.jsx'

export default function TopBar({ title }) {
  const { back } = useUI()
  return (
    <div className="topbar">
      <button className="iconbtn" onClick={back} aria-label="Back"><Icon name="back" /></button>
      <h1>{title}</h1>
    </div>
  )
}
