import { useRef, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import Icon from '../components/Icon.jsx'
import { shrinkImage } from '../lib/images.js'
import { useStore } from '../lib/store.jsx'
import { useUI } from '../lib/ui.jsx'

export default function ProfileSheet() {
  const { user, updateProfile } = useStore()
  const { closeSheet, toast } = useUI()
  const fileRef = useRef(null)
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar || null)
  const [busy, setBusy] = useState(false)

  const pick = async (file) => {
    if (!file) return
    try { setAvatar(await shrinkImage(file, 256)) } catch (e) { toast(e.message) }
    finally { fileRef.current.value = '' }
  }

  const save = async () => {
    if (!name.trim()) { toast('Enter your name.'); return }
    setBusy(true)
    try {
      const patch = { name: name.trim() }
      if (avatar !== (user?.avatar || null)) patch.avatar = avatar || ''
      await updateProfile(patch)
      closeSheet(); toast('Profile updated')
    } catch (e) { toast(e.message) }
    finally { setBusy(false) }
  }

  return (
    <>
      <h2>Edit profile</h2>
      <div className="avatar-edit">
        <button onClick={() => fileRef.current.click()} aria-label="Change photo">
          <Avatar user={{ name, avatar }} size={92} />
          <span className="cam-badge"><Icon name="cam" /></span>
        </button>
        {avatar && <button className="link small" onClick={() => setAvatar(null)}>Remove photo</button>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
      <div className="field"><label htmlFor="pn">Name</label><input id="pn" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></div>
      <div className="field"><label>Email</label><div className="input muted">{user?.email}</div></div>
      {(user?.google || user?.apple) && (
        <p className="note">Signed in with {[user.google && 'Google', user.apple && 'Apple'].filter(Boolean).join(' and ')}.</p>
      )}
      <button className="btn" style={{ marginTop: 14 }} onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </>
  )
}
