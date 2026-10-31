import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'

const initialsOf = (fullName) =>
  fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')

// Avatar in the header. Signed in: opens a small menu with the user's details and "Log out".
// Signed out (possible while the route guard is off): links to the sign-in page.
export default function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()

  // close on a click outside the menu or on Escape
  useEffect(() => {
    if (!open) return undefined
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!user) {
    return (
      <Link className="avatar" to="/signin" aria-label="Sign in" title="Sign in">
        <UserRound size={16} strokeWidth={1.8} aria-hidden="true" />
      </Link>
    )
  }

  function handleSignOut() {
    signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        className="avatar"
        type="button"
        aria-label={`Account: ${user.fullName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {initialsOf(user.fullName)}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute top-[calc(100%+6px)] right-0 z-40 w-60 rounded-xl border border-divider bg-white p-1.5 shadow-[0_12px_32px_rgba(28,10,16,0.12)]"
        >
          <div className="mb-1 flex flex-col border-b border-divider px-2.5 pt-2 pb-2.5">
            <span className="text-[14px] leading-5 font-semibold text-ink">{user.fullName}</span>
            <span className="truncate text-[12px] leading-4 text-muted">{user.role}</span>
            <span className="truncate text-[12px] leading-4 text-muted">{user.email}</span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-[13px] leading-[19.5px] font-medium text-[#c23b3b] hover:bg-[#f9e7e7]"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
