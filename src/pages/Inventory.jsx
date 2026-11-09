import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ItemRow from '../components/ItemRow.jsx'
import TopBar from '../components/TopBar.jsx'
import Empty from '../components/Empty.jsx'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { daysLeft } from '../lib/dates.js'

const TABS = [['all','All'],['fridge','Fridge'],['freezer','Freezer'],['pantry','Pantry']]

export default function Inventory() {
  const { data } = useStore()
  const { go } = useUI()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const count = (k) => data.items.filter((i) => k === 'all' || i.cat === k).length
  const list = data.items
    .filter((i) => (tab === 'all' || i.cat === tab) && i.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.exp.localeCompare(b.exp))
  const soon = list.filter((i) => daysLeft(i.exp) <= 3)
  const other = list.filter((i) => daysLeft(i.exp) > 3)

  return (
    <>
      <TopBar title="My Inventory" />
      <div className="screen">
        <div className="chips">
          {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l} ({count(k)})</button>)}
        </div>
        <div className="search"><Icon name="search" /><input placeholder="Search food items" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search food items" /></div>
        {!list.length && <Empty icon="🧺">No items here yet. Tap + to add your first one.</Empty>}
        {soon.length > 0 && <><h2 className="sec">Expiring soon</h2>{soon.map((i) => <ItemRow key={i.id} item={i} />)}</>}
        {other.length > 0 && <><h2 className="sec">Other items</h2>{other.map((i) => <ItemRow key={i.id} item={i} />)}</>}
        <div style={{ height: 60 }} />
      </div>
      <button className="fab" onClick={() => go('add')} aria-label="Add food item"><Icon name="plus" /></button>
    </>
  )
}
