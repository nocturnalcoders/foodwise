import { useRef, useState } from 'react'
import { useUI } from '../lib/ui.jsx'

export const ONBOARD_KEY = 'foodwise-onboarded-v1'

const SLIDES = [
  { img: '/img/onboard/1.jpg', em: '🥬', title: 'Know what’s in your kitchen', text: 'Track your fridge, freezer and pantry in one place. Snap a photo and FOODWISE fills in the details.' },
  { img: '/img/onboard/2.jpg', em: '🍳', title: 'Cook what’s about to expire', text: 'Get alerts before food goes off, plus recipes that use what you already have.' },
  { img: '/img/onboard/3.jpg', em: '🌱', title: 'Waste less, save more', text: 'See how much food and money you save every month, and shop smarter next time.' },
]

export default function Onboarding() {
  const { go } = useUI()
  const [i, setI] = useState(0)
  const touch = useRef(null)
  const last = i === SLIDES.length - 1
  const done = () => { try { localStorage.setItem(ONBOARD_KEY, '1') } catch {} go('login', { reset: true }) }
  const next = () => (last ? done() : setI(i + 1))

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - (touch.current ?? 0)
    if (dx < -50 && !last) setI(i + 1)
    if (dx > 50 && i > 0) setI(i - 1)
  }

  return (
    <div className="onboard" onTouchStart={(e) => { touch.current = e.touches[0].clientX }} onTouchEnd={onTouchEnd}>
      <button className="skip" onClick={done}>Skip</button>
      <div className="slides" style={{ transform: `translateX(-${i * 100}%)` }}>
        {SLIDES.map((s, n) => (
          <div className="slide" key={n} aria-hidden={n !== i}>
            <div className="pic" style={{ backgroundImage: `url(${s.img})` }}><span>{s.em}</span></div>
            <h1>{s.title}</h1>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
      <div className="onboard-foot">
        <div className="dots">{SLIDES.map((_, n) => <button key={n} className={n === i ? 'on' : ''} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} />)}</div>
        <button className="btn" onClick={next}>{last ? 'Get started' : 'Next'}</button>
      </div>
    </div>
  )
}
