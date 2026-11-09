export const DAY = 864e5
export const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
export const iso = (d) => {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
export const addDays = (n, base = today()) => { const d = new Date(base); d.setDate(d.getDate() + n); return d }
export const parse = (s) => new Date(s + 'T00:00:00')
export const daysLeft = (s) => Math.round((parse(s) - today()) / DAY)
export const fmtDay = (d) => `${WD[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`
export const monthStart = (offset = 0) => { const t = today(); return new Date(t.getFullYear(), t.getMonth() + offset, 1) }
export const sumKg = (arr, from, to) =>
  arr.filter((w) => { const d = parse(w.date); return d >= from && d < to }).reduce((a, w) => a + w.kg, 0)
export const kg = (n) => (Math.round(n * 10) / 10).toFixed(1)
export const uid = () => Math.random().toString(36).slice(2, 9)
