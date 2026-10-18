export default function Toggle({ checked, onChange }) {
  return (
    <button
      className={`availability-toggle${checked ? ' checked' : ''}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle availability"
      onClick={onChange}
    >
      <span />
    </button>
  )
}
