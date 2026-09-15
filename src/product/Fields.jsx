export function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  ...props
}) {
  return (
    <label className="pcv-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          maxLength={20000}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={2000}
          {...props}
        />
      )}
    </label>
  );
}
export function OrderButtons({ index, length, onMove, name = "item" }) {
  return (
    <span className="pcv-order">
      <button
        aria-label={`Move ${name} up`}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        aria-label={`Move ${name} down`}
        disabled={index === length - 1}
        onClick={() => onMove(1)}
      >
        ↓
      </button>
    </span>
  );
}
