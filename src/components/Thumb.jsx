import { useState } from 'react'

/** A photo with the emoji as fallback while there is no photo or it fails to load. */
export default function Thumb({ src, em, className = 'em', alt = '' }) {
  const [failed, setFailed] = useState(null)
  const ok = src && failed !== src
  return (
    <div className={`${className}${ok ? ' has-img' : ''}`}>
      {ok ? <img src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} /> : em}
    </div>
  )
}
