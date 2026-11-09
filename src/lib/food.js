import { daysLeft } from './dates.js'
import { RECIPES } from '../data/recipes.js'

// Assumptions used for impact estimates. Shown to users as estimates.
export const PRICE_PER_KG = 6.5 // average S$ per kg of household food
export const CO2_PER_KG = 2.5 // kg CO2e avoided per kg of food not wasted
export const SAVED_KG_PER_ITEM = 0.3 // rough weight credited when an item is used up

const EMOJI = [['milk','🥛'],['egg','🥚'],['lettuce','🥬'],['cabbage','🥬'],['spinach','🥬'],['chicken','🍗'],['beef','🥩'],['pork','🥩'],['fish','🐟'],['salmon','🐟'],['prawn','🦐'],['apple','🍎'],['banana','🍌'],['orange','🍊'],['grape','🍇'],['tomato','🍅'],['carrot','🥕'],['onion','🧅'],['garlic','🧄'],['potato','🥔'],['rice','🍚'],['pasta','🍝'],['noodle','🍜'],['bread','🍞'],['cheese','🧀'],['butter','🧈'],['yogurt','🥣'],['pea','🫛'],['corn','🌽'],['broccoli','🥦'],['cucumber','🥒'],['pepper','🫑'],['mushroom','🍄'],['tofu','🧊'],['strawberr','🍓'],['juice','🧃'],['flour','🌾']]
export const emojiFor = (name) => {
  const n = name.toLowerCase()
  const f = EMOJI.find(([k]) => n.includes(k))
  return f ? f[1] : '🍽️'
}

export const singular = (name) => name.toLowerCase().trim().replace(/e?s$/, '')

/** Find an item at home whose name contains the ingredient keyword. */
export const findHave = (items, keyword) =>
  items.find((i) => i.name.toLowerCase().includes(keyword) && i.pct > 0)

export const allRecipes = (data) => [...(data.recipes || []), ...RECIPES]
export const getRecipe = (data, id) =>
  allRecipes(data).find((r) => r.id === id) || { id, name: 'Removed recipe', em: '🍽️', min: 0, ing: [], steps: [] }

/** h = ingredients you have, e = of those, expiring within 3 days, miss = missing */
export const recipeScore = (items, r) => {
  let h = 0, e = 0
  r.ing.forEach((k) => {
    const it = findHave(items, k)
    if (it) { h++; if (daysLeft(it.exp) <= 3) e++ }
  })
  return { h, e, miss: r.ing.length - h }
}
