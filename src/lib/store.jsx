import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, setToken, usingBackend, COLLECTIONS } from './api.js'
import { useUI } from './ui.jsx'

/** App data (items, shopping list, meals, waste...) plus user and preferences. */
const StoreCtx = createContext(null)
const USER_KEY = 'foodwise-user-v1'
const PREF_KEY = 'foodwise-prefs-v1'
const readJSON = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback } }
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const empty = () => Object.fromEntries(COLLECTIONS.map((c) => [c, []]))

export function StoreProvider({ children }) {
  const { toast } = useUI()
  const [data, setData] = useState(null)
  const [user, setUser] = useState(() => readJSON(USER_KEY, null))
  const [prefs, setPrefsState] = useState(() => readJSON(PREF_KEY, { fav: ['r4'], notif: true }))

  const fail = useCallback((e) => {
    console.error(e)
    toast(e?.message || 'Something went wrong. Try again.')
  }, [toast])

  const load = useCallback(async () => {
    try { setData(await api.loadAll()) } catch (e) { fail(e); setData(empty()) }
  }, [fail])

  useEffect(() => {
    setToken(user?.token)
    if (!usingBackend || user) load()
    else setData(empty())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Optimistic update: change the screen first, then save. */
  const upsert = useCallback((col, obj) => {
    setData((d) => {
      const a = d[col]; const i = a.findIndex((x) => x.id === obj.id)
      return { ...d, [col]: i >= 0 ? a.map((x) => (x.id === obj.id ? obj : x)) : [...a, obj] }
    })
    api.upsert(col, obj).catch(fail)
  }, [fail])

  const remove = useCallback((col, id) => {
    setData((d) => ({ ...d, [col]: d[col].filter((x) => x.id !== id) }))
    api.remove(col, id).catch(fail)
  }, [fail])

  /** method: 'login' | 'register' | 'google' | 'apple'; body is what that endpoint expects. */
  const signIn = useCallback(async (method, body) => {
    const r = await api[method](body)
    const u = { ...r.user, token: r.token }
    setToken(r.token); writeJSON(USER_KEY, u); setUser(u)
    await load()
  }, [load])

  const updateProfile = useCallback(async (patch) => {
    const saved = await api.updateMe(patch)
    setUser((u) => {
      const n = { ...u, ...saved, token: u.token }
      if ('avatar' in saved) n.avatar = saved.avatar || null
      writeJSON(USER_KEY, n); return n
    })
  }, [])

  const logout = useCallback(() => {
    setToken(null); localStorage.removeItem(USER_KEY); setUser(null)
  }, [])

  const setPrefs = useCallback((patch) => {
    setPrefsState((p) => { const n = { ...p, ...patch }; writeJSON(PREF_KEY, n); return n })
  }, [])

  const reset = useCallback(async () => {
    try { setData(await api.reset()) } catch (e) { fail(e) }
  }, [fail])

  return (
    <StoreCtx.Provider value={{ data, user, prefs, upsert, remove, signIn, updateProfile, logout, setPrefs, reset, reload: load }}>
      {children}
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
