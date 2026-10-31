export default function Brand({ onClick, label = "ALGO" }) {
  return (
    <button
      className="brand"
      onClick={onClick}
      aria-label={`${label} — all algorithms`}
    >
      <svg
        className="brand-symbol"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m7 24 8-17 15 13-11 10L7 24Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="m7 24 23-4M15 7l4 23"
          stroke="currentColor"
          strokeWidth=".8"
          opacity=".45"
        />
        {[
          [7, 24],
          [15, 7],
          [30, 20],
          [19, 30],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.3"
            fill="#fff"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        ))}
      </svg>
      <span className="brand-word">{label}</span>
    </button>
  );
}
