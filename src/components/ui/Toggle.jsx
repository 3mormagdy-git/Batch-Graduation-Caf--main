export default function Toggle({ checked, onChange, label = 'Toggle availability' }) {
  return (
    <button
      className={`availability-toggle${checked ? ' checked' : ''}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  )
}
