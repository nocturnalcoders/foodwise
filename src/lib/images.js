import { EMOJI } from './food.js'

/** Built-in photos live in public/img. A missing file falls back to the emoji (see Thumb). */
export const foodPhoto = (name) => {
  const n = (name || '').toLowerCase()
  const f = EMOJI.find(([k]) => n.includes(k))
  return f ? `/img/food/${f[0]}.png` : null
}
export const recipePhoto = (r) => r.photo || (r.ai ? null : `/img/recipes/${r.id}.jpg`)
export const itemPhoto = (item) => item.photo || foodPhoto(item.name)

/** Shrinks a photo from the camera or gallery into a small JPEG data URL (fits the API limit). */
export async function shrinkImage(file, max = 480, quality = 0.8) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose an image file.')
  const img = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  img.close?.()
  return canvas.toDataURL('image/jpeg', quality)
}
