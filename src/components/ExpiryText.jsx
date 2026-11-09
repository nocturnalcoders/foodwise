import { daysLeft } from '../lib/dates.js'

export default function ExpiryText({ exp }) {
  const d = daysLeft(exp)
  const s = (n) => (Math.abs(n) === 1 ? '' : 's')
  if (d < 0) return <span className="tag-red">Expired {-d} day{s(d)} ago</span>
  if (d === 0) return <span className="tag-red">Expires today</span>
  if (d <= 3) return <span className="tag-red">Expires in {d} day{s(d)}</span>
  if (d <= 7) return <span className="tag-amber">{d} days left</span>
  return <span className="muted small">{d} days left</span>
}
