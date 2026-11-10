/**
 * FOODWISE data layer.
 *
 * Every screen talks to the data through this file only. Two adapters share
 * the same functions:
 *   - local:  saves to the browser (localStorage). Used when VITE_API_URL is empty.
 *   - remote: calls the FOODWISE backend REST API. Used when VITE_API_URL is set.
 *
 * The endpoints the backend must provide are listed in API.md.
 */
import { seed } from '../data/seed.js'

export const COLLECTIONS = ['items', 'shop', 'meals', 'waste', 'saved', 'recipes']
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const usingBackend = Boolean(API_URL)

export class NeedsBackend extends Error {
  constructor(feature) { super(`${feature} needs the FOODWISE backend.`); this.needsBackend = true }
}

let token = null
export const setToken = (t) => { token = t || null }

async function request(method, path, body, isForm = false) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })
  if (!res.ok) {
    let msg = `${method} ${path} failed (${res.status})`
    try { const j = await res.json(); if (j.detail || j.message) msg = j.detail || j.message } catch {}
    const err = new Error(msg); err.status = res.status; throw err
  }
  return res.status === 204 ? null : res.json()
}

/* ---------- local adapter (offline, browser storage) ---------- */
const KEY = 'foodwise-data-v1'
let cache = null
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const write = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch {} }
const copy = (o) => JSON.parse(JSON.stringify(o))

const local = {
  async authConfig() { return { google_client_id: null, apple_client_id: null } },
  async register({ name, email }) { return { user: { id: 'local', name: name || email.split('@')[0], email, has_password: true }, token: null } },
  async login({ email }) { return { user: { id: 'local', name: email.split('@')[0], email, has_password: true }, token: null } },
  async google() { throw new NeedsBackend('Google sign-in') },
  async apple() { throw new NeedsBackend('Apple sign-in') },
  async updateMe(patch) { return patch },
  async loadAll() {
    if (!cache) { cache = read() || seed(); COLLECTIONS.forEach((c) => { cache[c] ||= [] }); write() }
    return copy(cache)
  },
  async upsert(col, obj) {
    const a = cache[col]; const i = a.findIndex((x) => x.id === obj.id)
    if (i >= 0) a[i] = obj; else a.push(obj)
    write(); return obj
  },
  async remove(col, id) { cache[col] = cache[col].filter((x) => x.id !== id); write() },
  async reset() { cache = seed(); write(); return copy(cache) },
  async scanPhoto() { throw new NeedsBackend('Photo scan') },
  async suggestRecipe() { throw new NeedsBackend('AI recipes') },
  async getHousehold() { return null },
  async createHousehold() { throw new NeedsBackend('Household sharing') },
  async joinHousehold() { throw new NeedsBackend('Household sharing') },
  async leaveHousehold() { throw new NeedsBackend('Household sharing') },
}

/* ---------- remote adapter (REST backend) ---------- */
const remote = {
  authConfig: () => request('GET', '/api/auth/config'),
  register: (body) => request('POST', '/api/auth/register', body),
  login: (body) => request('POST', '/api/auth/login', body),
  google: (body) => request('POST', '/api/auth/google', body),
  apple: (body) => request('POST', '/api/auth/apple', body),
  updateMe: (patch) => request('PATCH', '/api/auth/me', patch),
  async loadAll() {
    const out = {}
    await Promise.all(COLLECTIONS.map(async (c) => { out[c] = await request('GET', `/api/${c}`) }))
    return out
  },
  upsert: (col, obj) => request('PUT', `/api/${col}/${obj.id}`, obj),
  remove: (col, id) => request('DELETE', `/api/${col}/${id}`),
  async reset() { throw new Error('Reset is only available in offline mode.') },
  scanPhoto(file) {
    const fd = new FormData(); fd.append('photo', file)
    return request('POST', '/api/ai/scan', fd, true)
  },
  suggestRecipe: (items) => request('POST', '/api/ai/recipe', { items }),
  getHousehold: () => request('GET', '/api/household'),
  createHousehold: (name) => request('POST', '/api/household', { name }),
  joinHousehold: (code) => request('POST', '/api/household/join', { code }),
  leaveHousehold: () => request('POST', '/api/household/leave'),
}

export const api = usingBackend ? remote : local
