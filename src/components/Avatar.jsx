import Thumb from './Thumb.jsx'

export default function Avatar({ user, size = 62 }) {
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.4 }} className="avatar-wrap">
      <Thumb className="avatar" src={user?.avatar} em={(user?.name || '?')[0].toUpperCase()} alt="" />
    </div>
  )
}
