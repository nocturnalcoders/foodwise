import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import TopBar from '../components/TopBar.jsx'
import Segmented from '../components/Segmented.jsx'
import Empty from '../components/Empty.jsx'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'
import { useAddToShop } from '../lib/useShopping.jsx'
import { emojiFor, findHave, singular } from '../lib/food.js'

export default function ShoppingList() {
  const { data, upsert, remove } = useStore()
  const { go } = useUI()
  const addToShop = useAddToShop()
  const [tab, setTab] = useState('todo')
  const [text, setText] = useState('')
  const todo = data.shop.filter((s) => !s.done)
  const done = data.shop.filter((s) => s.done)
  const list = tab === 'todo' ? todo : done

  const add = () => {
    const v = text.trim(); if (!v) return
    setText('')
    addToShop(v[0].toUpperCase() + v.slice(1))
  }

  // Closed loop: items thrown away 3+ times get a "buy less" hint
  const counts = {}
  data.waste.forEach((w) => { const k = w.name.toLowerCase(); counts[k] = (counts[k] || 0) + 1 })
  const repeat = Object.entries(counts).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 2)

  return (
    <>
      <TopBar title="Shopping List" />
      <div className="screen">
        <Segmented value={tab} onChange={setTab} options={[['todo', `To buy (${todo.length})`], ['done', `Bought (${done.length})`]]} />
        {tab === 'todo' && (
          <div className="addline">
            <input className="input" placeholder="Add an item, e.g., Milk" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} aria-label="New item" />
            <button className="btn sm" onClick={add} aria-label="Add"><Icon name="plus" /></button>
          </div>
        )}
        {!list.length && <Empty icon="🛒">{tab === 'todo' ? 'Your list is empty. Add what you need above.' : 'Nothing ticked off yet.'}</Empty>}
        {list.map((s) => {
          const h = !s.done && findHave(data.items, singular(s.name))
          return (
            <div className={`shop ${s.done ? 'done' : ''}`} key={s.id}>
              <input type="checkbox" checked={s.done} onChange={() => upsert('shop', { ...s, done: !s.done })} aria-label={`Mark ${s.name}`} />
              <span>
                {emojiFor(s.name)} {s.name}
                {h && <><br /><span className="tag-amber">You have {h.name} at home ({h.pct}% left)</span></>}
              </span>
              {s.done && <button className="btn ghost sm" onClick={() => { remove('shop', s.id); go('add', { params: { name: s.name } }) }}>Add to inventory</button>}
              <button className="iconbtn" onClick={() => remove('shop', s.id)} aria-label="Remove"><Icon name="trash" /></button>
            </div>
          )
        })}
        {tab === 'todo' && repeat.length > 0 && (
          <div className="alertbox">
            <b>From your waste history</b>
            {repeat.map(([k, n]) => <div key={k}>You’ve thrown away {k} {n} times. Buy a smaller amount next time.</div>)}
          </div>
        )}
      </div>
    </>
  )
}
