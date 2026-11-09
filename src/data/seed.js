import { today, iso, addDays, uid } from '../lib/dates.js'
import { emojiFor } from '../lib/food.js'

/** Demo data used in offline mode. Dates are relative to today so the demo always looks fresh. */
export function seed() {
  const t = today()
  const d = (n) => iso(addDays(n))
  const items = [
    ['Milk','fridge',2,'1 L',60], ['Lettuce','fridge',3,'1 head',100], ['Chicken Breast','fridge',3,'500 g',100],
    ['Apples','fridge',7,'6 pcs',80], ['Eggs','fridge',10,'10 pcs',70], ['Carrots','fridge',6,'4 pcs',100],
    ['Tomatoes','fridge',5,'5 pcs',100], ['Yogurt','fridge',-1,'2 cups',50],
    ['Frozen Peas','freezer',60,'500 g',70], ['Fish Fillet','freezer',40,'2 pcs',100], ['Dumplings','freezer',90,'1 pack',100],
    ['Rice','pantry',200,'5 kg',40], ['Pasta','pantry',300,'500 g',100], ['Onions','pantry',14,'3 pcs',100],
    ['Garlic','pantry',20,'1 bulb',60], ['Bread','pantry',2,'1 loaf',50],
  ].map(([name, cat, dd, qty, pct]) => ({ id: uid(), name, cat, exp: d(dd), qty, pct, em: emojiFor(name), added: d(-3) }))

  const waste = []
  const pool = [['Lettuce',.4],['Milk',.5],['Chicken',.3],['Bread',.3],['Tomatoes',.2],['Lettuce',.3]]
  for (let m = 6; m >= 1; m--) {
    const n = [5,4,5,3,4,3][6 - m]
    for (let k = 0; k < n; k++) {
      const [name, w] = pool[(m + k) % pool.length]
      const dt = new Date(t.getFullYear(), t.getMonth() - m, 3 + k * 5)
      waste.push({ id: uid(), name, kg: +(w + ((k * 7) % 3) / 10).toFixed(1), date: iso(dt), reason: 'Expired' })
    }
  }
  ;[['Lettuce',.4,-6],['Milk',.3,-3]].forEach(([name, w, o]) => {
    const dt = addDays(o)
    if (dt.getMonth() === t.getMonth()) waste.push({ id: uid(), name, kg: w, date: iso(dt), reason: 'Expired' })
  })

  const saved = [['Spinach',.3,-2],['Chicken Thigh',.5,-4],['Bananas',.6,-5],['Cheese',.2,-1]]
    .map(([name, w, o]) => ({ id: uid(), name, kg: w, date: d(o) }))

  return {
    items, waste, saved,
    shop: [['Spinach',false],['Tofu',false],['Onions',false],['Butter',false],['Rice',true]].map(([name, done]) => ({ id: uid(), name, done })),
    meals: [{ id: uid(), date: d(0), rid: 'r1' }, { id: uid(), date: d(1), rid: 'r4' }, { id: uid(), date: d(2), rid: 'r3' }],
    recipes: [],
  }
}
