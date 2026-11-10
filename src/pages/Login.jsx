import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { AppleIcon, GoogleIcon } from '../components/BrandIcon.jsx'
import { api, usingBackend } from '../lib/api.js'
import { appleSignIn, googleSignIn } from '../lib/social.js'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { signIn } = useStore()
  const { go, toast } = useUI()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(null) // which button is working: 'email' | 'google' | 'apple'
  const [errors, setErrors] = useState({})
  const [ids, setIds] = useState({ google_client_id: null, apple_client_id: null })
  const isNew = mode === 'register'

  useEffect(() => { api.authConfig().then(setIds).catch(() => {}) }, [])
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: null })) }

  const run = async (which, task) => {
    setBusy(which)
    try { await task(); go('home', { reset: true }) }
    catch (e) {
      // Point the user to the other tab when that is the fix
      if (e.status === 404) setMode('register')
      if (e.status === 409) setMode('login')
      toast(e.message)
    }
    finally { setBusy(null) }
  }

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (isNew && !form.name.trim()) err.name = 'Tell us your name.'
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email.'
    if (usingBackend && form.password.length < (isNew ? 6 : 1)) err.password = isNew ? 'Use at least 6 characters.' : 'Enter your password.'
    setErrors(err)
    if (Object.keys(err).length) return
    const body = { email: form.email.trim(), password: form.password, ...(isNew && { name: form.name.trim() }) }
    run('email', () => signIn(isNew ? 'register' : 'login', body))
  }

  const social = (provider) => {
    if (!usingBackend) { toast(`${provider === 'google' ? 'Google' : 'Apple'} sign-in needs the FOODWISE backend.`); return }
    const id = ids[`${provider}_client_id`]
    if (!id) { toast(`${provider === 'google' ? 'Google' : 'Apple'} sign-in isn’t set up on the server yet.`); return }
    run(provider, async () => {
      const body = provider === 'google' ? await googleSignIn(id) : await appleSignIn(id)
      await signIn(provider, body)
    })
  }

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="logo">FOODWISE</div>
        <p>{isNew ? 'Create an account to start saving food.' : 'Welcome back! Log in to your kitchen.'}</p>
      </div>

      <div className="auth-body">
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={!isNew} className={!isNew ? 'on' : ''} onClick={() => setMode('login')}>Log in</button>
          <button role="tab" aria-selected={isNew} className={isNew ? 'on' : ''} onClick={() => setMode('register')}>Sign up</button>
        </div>

        <form onSubmit={submit} noValidate>
          {isNew && (
            <Field id="nm" label="Your name" icon="user" error={errors.name}>
              <input id="nm" autoComplete="name" value={form.name} onChange={set('name')} placeholder="e.g., Loki" />
            </Field>
          )}
          <Field id="em" label="Email" icon="mail" error={errors.email}>
            <input id="em" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </Field>
          {usingBackend && (
            <Field id="pw" label="Password" icon="lock" error={errors.password}>
              <input id="pw" type={showPw ? 'text' : 'password'} autoComplete={isNew ? 'new-password' : 'current-password'}
                value={form.password} onChange={set('password')} placeholder={isNew ? 'At least 6 characters' : 'Your password'} />
              <button type="button" className="iconbtn" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                <Icon name={showPw ? 'eyeoff' : 'eye'} />
              </button>
            </Field>
          )}
          <button className="btn" type="submit" disabled={!!busy}>
            {busy === 'email' ? (isNew ? 'Creating account…' : 'Logging in…') : (isNew ? 'Create account' : 'Log in')}
          </button>
        </form>

        <div className="or">or continue with</div>
        <div className="social">
          <button onClick={() => social('google')} disabled={!!busy}><GoogleIcon />{busy === 'google' ? 'Opening…' : 'Google'}</button>
          <button onClick={() => social('apple')} disabled={!!busy}><AppleIcon />{busy === 'apple' ? 'Opening…' : 'Apple'}</button>
        </div>

        <p className="muted small switch-mode">
          {isNew ? 'Already have an account? ' : 'New to FOODWISE? '}
          <button className="link" onClick={() => setMode(isNew ? 'login' : 'register')}>{isNew ? 'Log in' : 'Create one'}</button>
        </p>
        {!usingBackend && <p className="note" style={{ textAlign: 'center' }}>Offline mode: your account and data stay on this device.</p>}
      </div>
    </div>
  )
}

function Field({ id, label, icon, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-icon${error ? ' bad' : ''}`}><Icon name={icon} />{children}</div>
      {error && <p className="err" role="alert">{error}</p>}
    </div>
  )
}
