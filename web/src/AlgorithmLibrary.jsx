import { useState } from "react";
import Brand from "./Brand.jsx";
export const themeFor = {
  "Jarvis March": "jarvis",
  "Graham Scan": "graham",
  "Manhattan Skyline": "skyline",
};
export const slugFor = {
  "Jarvis March": "jarvis-march",
  "Graham Scan": "graham-scan",
  "Manhattan Skyline": "manhattan-skyline",
};
export function algorithmFromHash() {
  return Object.keys(slugFor).find(
    (a) => `#${slugFor[a]}` === window.location.hash,
  );
}
const entries = [
  {
    name: "Jarvis March",
    family: "Convex hull",
    description:
      "Wrap a set of points, choosing one outermost vertex at a time.",
    complexity: "O(nh)",
    method: "Gift wrapping",
  },
  {
    name: "Graham Scan",
    family: "Convex hull",
    description: "Sort by angle, then build a convex boundary with a stack.",
    complexity: "O(n log n)",
    method: "Angular sweep",
  },
  {
    name: "Manhattan Skyline",
    family: "Sweep line",
    description: "Move through a cityscape to trace its changing silhouette.",
    complexity: "O(n log n)",
    method: "Event processing",
  },
];
function Arrow({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}
function AlgorithmDrawing({ algorithm }) {
  const vertices = [
    [47, 122],
    [79, 57],
    [152, 36],
    [225, 82],
    [241, 147],
    [153, 177],
  ];
  const interior = [
    [101, 116],
    [147, 83],
    [176, 129],
    [130, 148],
    [195, 94],
  ];
  return (
    <svg
      className="algorithm-drawing"
      viewBox="0 0 290 215"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 10 }, (_, x) =>
        Array.from({ length: 7 }, (_, y) => (
          <circle
            key={`${x}-${y}`}
            cx={20 + x * 28}
            cy={22 + y * 28}
            r=".8"
            fill="var(--control-border)"
            opacity=".4"
          />
        )),
      )}
      {algorithm === "Manhattan Skyline" ? (
        <>
          <path d="M28 181h239" stroke="var(--control-border)" />
          {[
            [37, 112, 48, 69],
            [67, 65, 55, 116],
            [109, 95, 48, 86],
            [145, 38, 45, 143],
            [179, 79, 48, 102],
            [220, 127, 36, 54],
          ].map(([x, y, w, h], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              fill="var(--theme-illustration)"
              fillOpacity=".7"
              stroke="var(--control-border)"
            />
          ))}
          <path
            d="M28 181h9v-69h30V65h55v30h23V38h45v41h37v48h29v54h11"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M168 23v169"
            stroke="var(--accent)"
            strokeWidth="1.3"
            strokeDasharray="4 4"
          />
          <circle
            cx="168"
            cy="38"
            r="4"
            fill="var(--theme-soft)"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
        </>
      ) : (
        <>
          <path
            d="m47 122 32-65 73-21 73 46 16 65-88 30-106-55Z"
            fill="var(--theme-illustration)"
            fillOpacity=".4"
            stroke="var(--control-border)"
            strokeWidth="1"
            strokeDasharray={algorithm === "Jarvis March" ? "0" : "3 4"}
          />
          {algorithm === "Jarvis March" ? (
            <>
              <path
                d="m47 122 32-65 73-21"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <path
                d="m152 36 73 46"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <path
                d="m152 36 24 93"
                stroke="var(--accent)"
                strokeWidth="1"
                opacity=".5"
                strokeDasharray="3 4"
              />
              <path
                d="M166 47a27 27 0 0 1 7 14"
                stroke="var(--accent)"
                strokeWidth="1"
              />
            </>
          ) : (
            <>
              {[...vertices.slice(0, 5), ...interior.slice(0, 3)].map(
                ([x, y], i) => (
                  <path
                    key={i}
                    d={`M153 177  ${x} ${y}`}
                    stroke="var(--control-border)"
                    strokeWidth=".9"
                  />
                ),
              )}
              <path
                d="m153 177-106-55 32-65 73-21"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <path
                d="m79 57 68 26 5-47"
                stroke="var(--accent)"
                strokeWidth="1.3"
                strokeDasharray="4 4"
              />
              <circle cx="147" cy="83" r="9" fill="var(--theme-soft)" />
              <path
                d="m144 80 6 6m-6 0 6-6"
                stroke="var(--accent)"
                strokeWidth="1.4"
              />
            </>
          )}
          {[...vertices, ...interior].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i < 6 ? 3.4 : 2.7}
              fill={i < 3 ? "var(--accent)" : "var(--theme-wash)"}
              stroke={i < 6 ? "var(--accent)" : "var(--control-border)"}
              strokeWidth="1.2"
            />
          ))}
          <circle
            cx={algorithm === "Jarvis March" ? 152 : 153}
            cy={algorithm === "Jarvis March" ? 36 : 177}
            r="9"
            stroke="var(--accent)"
            strokeWidth=".8"
            opacity=".5"
          />
          <text
            x={algorithm === "Jarvis March" ? 144 : 163}
            y={algorithm === "Jarvis March" ? 21 : 194}
            fill="var(--accent)"
            fontSize="8"
            fontFamily="IBM Plex Mono, monospace"
          >
            {algorithm === "Jarvis March" ? "current" : "pivot"}
          </text>
        </>
      )}
    </svg>
  );
}
export default function AlgorithmLibrary({ onSelect, onGuide }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All algorithms");
  const visible = entries.filter(
    (e) =>
      (category === "All algorithms" || e.family === category) &&
      `${e.name} ${e.family} ${e.method}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="library-main">
      <header className="library-header">
        <div className="library-identity">
          <Brand
            onClick={() => {
              setQuery("");
              setCategory("All algorithms");
            }}
          />
          <span className="identity-divider" />
          <span>COMPUTATIONAL GEOMETRY</span>
        </div>
        <button className="library-guide" onClick={onGuide}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15" />
          </svg>
          Workspace guide
          <Arrow size={14} />
        </button>
      </header>
      <div className="library-content">
        <section className="library-heading">
          <h1 tabIndex={-1}>Choose an algorithm</h1>
        </section>
        <div className="library-toolbar">
          <div className="library-filters" aria-label="Filter algorithms">
            {["All algorithms", "Convex hull", "Sweep line"].map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
                {c === "All algorithms" && <span>3</span>}
              </button>
            ))}
          </div>
          <label className="library-search">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              aria-label="Search algorithms"
              placeholder="Find an algorithm…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")}>
                ×
              </button>
            )}
          </label>
        </div>
        <section className="algorithm-cards" aria-label="Available algorithms">
          {visible.map((entry) => (
            <article
              key={entry.name}
              className={`algorithm-choice theme-${themeFor[entry.name]}`}
            >
              <button
                className="algorithm-card"
                onClick={() => onSelect(entry.name)}
                aria-label={`Open ${entry.name} visualization`}
              >
                <span className="card-art">
                  <span className="card-family">
                    <span />
                    {entry.family}
                  </span>
                  <AlgorithmDrawing algorithm={entry.name} />
                </span>
                <span className="card-content">
                  <span className="card-title">
                    {entry.name}
                    <span className="card-arrow">
                      <Arrow size={19} />
                    </span>
                  </span>
                  <span className="card-description">{entry.description}</span>
                  <span className="card-bottom">
                    <span className="card-complexity">{entry.complexity}</span>
                    <span>
                      Open visualization <Arrow size={13} />
                    </span>
                  </span>
                </span>
              </button>
            </article>
          ))}
        </section>
        {visible.length === 0 && (
          <div className="library-empty">
            <h2>No algorithms found</h2>
            <p>Try a different name or choose another category.</p>
            <button
              className="secondary-button"
              onClick={() => {
                setQuery("");
                setCategory("All algorithms");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
