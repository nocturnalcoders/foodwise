import { useState } from 'react'
import { usingBackend } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'

export default function Login() {
  const { login } = useStore()
  const { go, toast } = useUI()
  const [name, setName] = useState('Loki')
  const [email, setEmail] = useState('nyanlinhtet@jcu.edu.sg')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!email.trim()) { toast('Enter your email to continue.'); return }
    setBusy(true)
    try { await login(name.trim() || 'Friend', email.trim(), password); go('home', { reset: true }) }
    catch (e) { toast(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="auth">
      <h1>Welcome to</h1>
      <div className="logo">FOODWISE</div>
      <div className="hero-em">🥛🥕🥬🍅</div>
      <div className="field"><label htmlFor="nm">Your name</label><input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Loki" /></div>
      <div className="field"><label htmlFor="em">Email</label><input id="em" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      {usingBackend && <div className="field"><label htmlFor="pw">Password</label><input id="pw" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>}
      <button className="btn" disabled={busy} onClick={submit}>{busy ? 'Logging in…' : 'Log in'}</button>
      <button className="btn ghost" style={{ marginTop: 10 }} disabled={busy} onClick={submit}>Sign up</button>
      <div className="or">or continue with</div>
      <div className="social"><button onClick={submit}>Google</button><button onClick={submit}>Apple</button></div>
      {!usingBackend && <p className="muted small" style={{ textAlign: 'center', marginTop: 18 }}>Offline mode: your account and data stay on this device.</p>}
    </div>
  )
}
