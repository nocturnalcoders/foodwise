/**
 * "Continue with Google / Apple" popups. Each returns what the backend's
 * /api/auth/google or /api/auth/apple expects. Client IDs come from /api/auth/config.
 */
const loaded = {}
function loadScript(src) {
  loaded[src] ||= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src; s.async = true
    s.onload = resolve
    s.onerror = () => { delete loaded[src]; reject(new Error('Could not load the sign-in window. Check your connection.')) }
    document.head.appendChild(s)
  })
  return loaded[src]
}

export async function googleSignIn(clientId) {
  await loadScript('https://accounts.google.com/gsi/client')
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (r) => (r.error ? reject(new Error('Google sign-in was cancelled.')) : resolve({ access_token: r.access_token })),
      error_callback: () => reject(new Error('Google sign-in was cancelled.')),
    })
    client.requestAccessToken()
  })
}

export async function appleSignIn(clientId) {
  await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
  window.AppleID.auth.init({ clientId, scope: 'name email', redirectURI: window.location.origin, usePopup: true })
  try {
    const r = await window.AppleID.auth.signIn()
    const n = r.user?.name
    return { id_token: r.authorization.id_token, name: n ? `${n.firstName || ''} ${n.lastName || ''}`.trim() : '' }
  } catch {
    throw new Error('Apple sign-in was cancelled.')
  }
}
