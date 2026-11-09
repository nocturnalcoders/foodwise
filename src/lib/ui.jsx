import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

/** Navigation, bottom sheets and toasts. */
const UICtx = createContext(null)

export function UIProvider({ children }) {
  const [screen, setScreen] = useState('splash')
  const [sheet, setSheet] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [params, setParams] = useState({})
  const history = useRef([])
  const timer = useRef(null)

  const go = useCallback((s, { push = true, reset = false, params: p = {} } = {}) => {
    setParams(p)
    setScreen((cur) => {
      if (reset) history.current = []
      else if (push && cur !== s) history.current.push(cur)
      return s
    })
    setSheet(null)
    document.querySelector('.screen')?.scrollTo(0, 0)
  }, [])
  const back = useCallback(() => go(history.current.pop() || 'home', { push: false }), [go])
  const toast = useCallback((m) => {
    clearTimeout(timer.current)
    setToastMsg(m)
    timer.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])
  const openSheet = useCallback((node) => setSheet(node), [])
  const closeSheet = useCallback(() => setSheet(null), [])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSheet(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <UICtx.Provider value={{ screen, params, go, back, toast, toastMsg, sheet, openSheet, closeSheet }}>
      {children}
    </UICtx.Provider>
  )
}

export const useUI = () => useContext(UICtx)
