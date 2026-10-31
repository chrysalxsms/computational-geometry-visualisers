import { useEffect, useMemo, useState } from "react";
import {
  createBuildings,
  createPoints,
  hullFrames,
  initialBuildings,
  initialPoints,
  presetNote,
  presetsFor,
  skylineFrames,
  snippets,
} from "./geometry.js";
import AlgorithmLibrary, {
  algorithmFromHash,
  slugFor,
  themeFor,
} from "./AlgorithmLibrary.jsx";
import Brand from "./Brand.jsx";

function Icon({ name, size = 18 }) {
  const paths = {
    polygon: (
      <>
        <path d="m5 8 8-5 7 9-5 8-11-4L5 8Z" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="13" cy="3" r="1.5" />
        <circle cx="20" cy="12" r="1.5" />
        <circle cx="15" cy="20" r="1.5" />
        <circle cx="4" cy="16" r="1.5" />
      </>
    ),
    sweep: (
      <>
        <path d="M3 20V9h5v11m0 0V4h7v16m0 0v-8h6v8M2 20h20M12 2v20" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    play: <path d="m9 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
    pause: <path d="M8 5v14M16 5v14" strokeWidth="4" />,
    next: (
      <>
        <path d="m5 5 10 7-10 7V5Z" />
        <path d="M19 5v14" />
      </>
    ),
    back: (
      <>
        <path d="m19 5-10 7 10 7V5Z" />
        <path d="M5 5v14" />
      </>
    ),
    reset: <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />,
    shuffle: (
      <path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3.5-2 5-5m2-3c1.5-2.5 3-4 5-4h3m-4-4 4 4-4 4" />
    ),
    code: <path d="m7 6-6 6 6 6m10-12 6 6-6 6m-4-15-2 18" />,
    book: (
      <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15" />
    ),
    keyboard: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v.1" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
const X = (x) => 45 + x * 5.7;
const Y = (y) => 365 - y * 3.15;
const position = (p) => `${X(p.x)},${Y(p.y)}`;
export default function App() {
  const [algorithm, setAlgorithm] = useState(
    () => algorithmFromHash() ?? "Jarvis March",
  );
  const [screen, setScreen] = useState(() =>
    algorithmFromHash() ? "visualization" : "library",
  );
  const [points, setPoints] = useState(initialPoints);
  const [buildings, setBuildings] = useState(initialBuildings);
  const [preset, setPreset] = useState("Random");
  const [customInput, setCustomInput] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState("Visualization");
  const [labels, setLabels] = useState(true);
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState(null);
  const isSkyline = algorithm === "Manhattan Skyline";
  const frames = useMemo(
    () =>
      isSkyline ? skylineFrames(buildings) : hullFrames(points, algorithm),
    [points, buildings, algorithm, isSkyline],
  );
  const frame = frames[Math.min(step, frames.length - 1)];
  const completed = step === frames.length - 1;
  const count = isSkyline ? buildings.length : points.length;
  const reset = () => {
    setPlaying(false);
    setStep(0);
  };
  const selectAlgorithm = (a) => {
    reset();
    setAlgorithm(a);
    setPoints(initialPoints);
    setCustomInput(false);
    setBuildings(initialBuildings);
    setPreset("Random");
    setEditing(false);
    setModal(null);
    setTab("Visualization");
    setScreen("visualization");
    window.history.pushState(null, "", `#${slugFor[a]}`);
    window.scrollTo(0, 0);
  };
  const returnToLibrary = () => {
    reset();
    setEditing(false);
    setModal(null);
    setScreen("library");
    window.history.pushState(null, "", "#algorithms");
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    const handleRoute = () => {
      const selected = algorithmFromHash();
      setPlaying(false);
      setStep(0);
      setModal(null);
      setEditing(false);
      setCustomInput(false);
      setPreset("Random");
      setPoints(initialPoints);
      setBuildings(initialBuildings);
      setTab("Visualization");
      setScreen(selected ? "visualization" : "library");
      if (selected) setAlgorithm(selected);
    };
    window.addEventListener("hashchange", handleRoute);
    return () => window.removeEventListener("hashchange", handleRoute);
  }, []);
  useEffect(() => {
    document.title =
      screen === "library" ? "ALGO — Algorithm library" : `${algorithm} — ALGO`;
    document.querySelector("h1")?.focus({ preventScroll: true });
  }, [screen, algorithm]);
  const loadPreset = (p, n = count) => {
    setCustomInput(false);
    reset();
    setPreset(p);
    setEditing(false);
    if (isSkyline) setBuildings(createBuildings(p, n));
    else setPoints(createPoints(p, n, algorithm));
  };
  const togglePlay = () => {
    setEditing(false);
    if (completed) setStep(0);
    setPlaying((p) => !p);
  };
  const move = (direction) => {
    setPlaying(false);
    setStep((s) => Math.max(0, Math.min(frames.length - 1, s + direction)));
  };
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () =>
        setStep((s) => {
          if (s >= frames.length - 2) {
            setPlaying(false);
            return frames.length - 1;
          }
          return s + 1;
        }),
      1100 / speed,
    );
    return () => clearInterval(timer);
  }, [playing, speed, frames.length]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setModal(null);
        setEditing(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (screen !== "library") returnToLibrary();
        else setModal(null);
        window.requestAnimationFrame(() =>
          document.querySelector(".library-search input")?.focus(),
        );
        return;
      }
      if (modal || e.target.matches("input, button, select, textarea")) return;
      if (e.key === "?") {
        setModal("shortcuts");
        return;
      }
      if (screen !== "visualization") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        move(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1);
      }
      if (e.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    dialog?.querySelector("input, button")?.focus();
    const trap = (e) => {
      if (e.key !== "Tab" || !dialog) return;
      const items = [
        ...dialog.querySelectorAll('button, input, [tabindex="0"]'),
      ];
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [modal]);
  const addPoint = (e) => {
    if (!editing || isSkyline || points.length >= 50) return;
    const svg = e.currentTarget,
      ctm = svg.getScreenCTM();
    if (!ctm) return;
    const cursor = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      ctm.inverse(),
    );
    const x = Math.round((cursor.x - 45) / 5.7),
      y = Math.round((365 - cursor.y) / 3.15);
    if (
      x < 0 ||
      x > 100 ||
      y < 0 ||
      y > 100 ||
      points.some((p) => Math.hypot(p.x - x, p.y - y) < 2)
    )
      return;
    reset();
    setPoints((p) => [...p, { id: `P${p.length}`, x, y }]);
    setCustomInput(true);
  };
  const point = (id) => points.find((p) => p.id === id);
  const current = point(frame.current),
    candidate = point(frame.candidate),
    test = point(frame.test);
  const hull = frame.hull.map((id) => point(id)).filter(Boolean);
  const code = snippets[algorithm];
  const uniqueHull = new Set(frame.hull).size;
  return (
    <div
      className={`app-shell ${
        screen === "visualization"
          ? `theme-${themeFor[algorithm]}`
          : "library-shell"
      }`}
    >
      {screen === "library" ? (
        <AlgorithmLibrary
          onSelect={selectAlgorithm}
          onGuide={() => setModal("guide")}
        />
      ) : (
        <main className="workspace-main">
          <header className="topbar">
            <div className="workspace-navigation">
              <Brand
                onClick={returnToLibrary}
                label={algorithm === "Jarvis March" ? "title" : "ALGO"}
              />
              <span className="identity-divider" />
              <button className="back-to-library" onClick={returnToLibrary}>
                <span>
                  <Icon name="arrow" size={15} />
                </span>
                All algorithms
              </button>
            </div>
            <div className="topbar-right">
              <button
                className="icon-button"
                title="Keyboard shortcuts"
                onClick={() => setModal("shortcuts")}
              >
                <Icon name="keyboard" size={18} />
              </button>
            </div>
          </header>
          <div className="main-content">
            <section className="page-heading">
              <h1 tabIndex={-1}>{algorithm}</h1>
              <button
                className="secondary-button"
                onClick={() => setModal("guide")}
              >
                <Icon name="book" size={15} />
                How it works
              </button>
            </section>
            <div className="workspace-tabs">
              <div>
                {["Visualization", "About the algorithm"].map((t, i) => (
                  <button
                    key={t}
                    className={`tab ${tab === t ? "active" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    <Icon name={i ? "book" : "polygon"} size={15} />
                    {t}
                  </button>
                ))}
              </div>
              <span className="algorithm-type">
                {isSkyline ? "Sweep line algorithm" : "Convex hull algorithm"}
              </span>
            </div>
            {tab === "About the algorithm" ? (
              <section className="about-panel">
                <span className="section-kicker">
                  {isSkyline ? "SWEEP LINE" : "CONVEX HULL"}
                </span>
                <h2>
                  {algorithm === "Jarvis March"
                    ? "Wrap the outer boundary."
                    : algorithm === "Graham Scan"
                      ? "Keep the turns that matter."
                      : "Follow the changing horizon."}
                </h2>
                <p>
                  {algorithm === "Jarvis March"
                    ? "Jarvis March, also called gift wrapping, starts at the leftmost point and repeatedly scans every other point to find the next outermost vertex. Collinear ties are resolved by choosing the farthest point. It finishes when it returns to the starting vertex."
                    : algorithm === "Graham Scan"
                      ? "Graham Scan chooses the lowest point as a pivot, sorts the remaining points by polar angle, and processes them with a stack. A non-left turn removes the middle vertex. The result is a counterclockwise convex boundary; collinear interior points are discarded."
                      : "The Manhattan skyline algorithm sweeps through sorted building-edge events. At each x-coordinate it updates an active set of buildings and finds the maximum height. A change in maximum height creates a skyline key point. Events at the same x-coordinate are processed together."}
                </p>
                <h3>Experiment with the input</h3>
                <p>
                  {presetNote(algorithm, "Best case")}{" "}
                  {presetNote(algorithm, "Worst case")}
                </p>
                <div className="about-note">
                  <Icon name="info" size={16} />
                  <span>
                    {isSkyline
                      ? "The pseudocode uses a max-heap with lazy removal or a balanced multiset."
                      : "Orientation is determined by the sign of the 2D cross product."}
                  </span>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setTab("Visualization")}
                >
                  Back to visualization <Icon name="arrow" size={15} />
                </button>
              </section>
            ) : (
              <>
                <section className="preset-panel" aria-label="Input presets">
                  <div className="preset-row">
                    <div className="preset-label">
                      <Icon name="shuffle" size={15} />
                      <h2>Input presets</h2>
                    </div>
                    <div className="preset-buttons">
                      {presetsFor(algorithm).map((p) => (
                        <button
                          key={p}
                          title={presetNote(algorithm, p)}
                          className={`preset-button ${
                            !customInput && preset === p ? "active" : ""
                          }`}
                          aria-pressed={!customInput && preset === p}
                          onClick={() => loadPreset(p)}
                        >
                          {p === "Best case" && (
                            <span className="preset-dot mint" />
                          )}
                          {p === "Worst case" && (
                            <span className="preset-dot peach" />
                          )}
                          {p}
                          {!customInput && preset === p && (
                            <Icon name="check" size={12} />
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      className="icon-button regenerate"
                      title="Regenerate selected preset"
                      onClick={() => loadPreset(preset)}
                    >
                      <Icon name="reset" size={16} />
                    </button>
                  </div>
                  <p className="preset-note">
                    <Icon name="info" size={12} />
                    {customInput
                      ? "Custom point set · choose a preset to replace your input."
                      : presetNote(algorithm, preset)}
                  </p>
                </section>
                <div className="visualization-grid">
                  <section className="visual-card">
                    <div className="panel-heading">
                      <div>
                        <span className="panel-dot" />
                        <h2>
                          {isSkyline ? "Sweep canvas" : "Geometry canvas"}
                        </h2>
                      </div>
                      <span className="array-tag">
                        {count} {isSkyline ? "buildings" : "points"}
                      </span>
                    </div>
                    <div className="chart-toolbar">
                      <div className="legend">
                        <span>
                          <i className="legend-input" />
                          {isSkyline ? "Building" : "Input point"}
                        </span>
                        <span>
                          <i className="legend-candidate" />
                          {isSkyline ? "Sweep line" : "Candidate"}
                        </span>
                        <span>
                          <i className="legend-hull" />
                          {isSkyline ? "Skyline" : "Hull edge"}
                        </span>
                        {!isSkyline && (
                          <span>
                            <i className="legend-test" />
                            Testing
                          </span>
                        )}
                      </div>
                      <label className="label-toggle">
                        <input
                          type="checkbox"
                          checked={labels}
                          onChange={(e) => setLabels(e.target.checked)}
                        />
                        <span>Labels</span>
                      </label>
                    </div>
                    <div
                      className={`geometry-canvas ${editing ? "editing" : ""}`}
                    >
                      <svg
                        viewBox="0 0 660 405"
                        onClick={addPoint}
                        role="img"
                        aria-label={
                          isSkyline
                            ? "Buildings with a left-to-right sweep line and skyline outline"
                            : `Point set showing ${algorithm} at step ${step}`
                        }
                      >
                        <defs>
                          <pattern
                            id="dots"
                            x={X(0)}
                            y={Y(100)}
                            width="28.5"
                            height="15.75"
                            patternUnits="userSpaceOnUse"
                          >
                            <circle cx="1" cy="1" r=".65" fill="#e6e0ed" />
                          </pattern>
                          <linearGradient
                            id="hull-fill"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop stopColor="#c8e1d5" stopOpacity=".2" />
                            <stop
                              offset="1"
                              stopColor="#c8e1d5"
                              stopOpacity=".06"
                            />
                          </linearGradient>
                        </defs>
                        <rect
                          x="45"
                          y="50"
                          width="570"
                          height="315"
                          fill="url(#dots)"
                        />
                        {[0, 20, 40, 60, 80, 100].map((v) => (
                          <g key={v}>
                            <line
                              x1={X(v)}
                              y1="50"
                              x2={X(v)}
                              y2="365"
                              stroke="#f2eef6"
                              strokeWidth=".7"
                            />
                            <line
                              x1="45"
                              y1={Y(v)}
                              x2="615"
                              y2={Y(v)}
                              stroke="#f2eef6"
                              strokeWidth=".7"
                            />
                            <text
                              x={X(v)}
                              y="386"
                              textAnchor="middle"
                              className="axis-label"
                            >
                              {v}
                            </text>
                            <text
                              x="30"
                              y={Y(v) + 3}
                              textAnchor="end"
                              className="axis-label"
                            >
                              {v}
                            </text>
                          </g>
                        ))}
                        <path
                          d="M45 45v320h578"
                          fill="none"
                          stroke="#dcd5e5"
                          strokeWidth="1"
                        />
                        <text x="635" y="368" className="axis-name">
                          x
                        </text>
                        <text x="42" y="32" className="axis-name">
                          y
                        </text>
                        {isSkyline ? (
                          <>
                            {buildings.map((b, i) => (
                              <g key={b.id}>
                                <rect
                                  x={X(b.left)}
                                  y={Y(b.height)}
                                  width={(b.right - b.left) * 5.7}
                                  height={b.height * 3.15}
                                  fill={
                                    frame.activeBuildings.includes(b.id)
                                      ? "var(--theme-illustration)"
                                      : "var(--theme-soft)"
                                  }
                                  fillOpacity=".65"
                                  stroke={
                                    frame.activeBuildings.includes(b.id)
                                      ? "var(--accent)"
                                      : "var(--point-stroke)"
                                  }
                                  strokeWidth="1.2"
                                />
                                {labels && (
                                  <text
                                    x={X((b.left + b.right) / 2)}
                                    y={Y(b.height) - 9}
                                    textAnchor="middle"
                                    className="point-label"
                                  >
                                    {b.id}
                                  </text>
                                )}
                                <title>{`Building ${i}: x ${b.left}–${b.right}, height ${b.height}`}</title>
                              </g>
                            ))}
                            {frame.skyline.length > 1 && (
                              <polyline
                                points={frame.skyline
                                  .map(([x, y]) => `${X(x)},${Y(y)}`)
                                  .join(" ")}
                                fill="none"
                                stroke="var(--edge-green)"
                                strokeWidth="3"
                                strokeLinejoin="round"
                              />
                            )}
                            {frame.sweep !== undefined && (
                              <g>
                                <line
                                  x1={X(frame.sweep)}
                                  y1="42"
                                  x2={X(frame.sweep)}
                                  y2="365"
                                  stroke="var(--accent)"
                                  strokeWidth="1.5"
                                  strokeDasharray="5 4"
                                />
                                <rect
                                  x={X(frame.sweep) - 25}
                                  y="17"
                                  width="50"
                                  height="19"
                                  rx="4"
                                  fill="var(--theme-soft)"
                                />
                                <text
                                  x={X(frame.sweep)}
                                  y="30"
                                  textAnchor="middle"
                                  className="sweep-label"
                                >
                                  x = {frame.sweep}
                                </text>
                              </g>
                            )}
                          </>
                        ) : (
                          <>
                            {hull.length > 2 && (
                              <polygon
                                points={hull.map(position).join(" ")}
                                fill="url(#hull-fill)"
                              />
                            )}
                            {hull.length > 1 && (
                              <polyline
                                points={hull.map(position).join(" ")}
                                fill="none"
                                stroke="var(--edge-green)"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                            )}
                            {current && candidate && (
                              <line
                                x1={X(current.x)}
                                y1={Y(current.y)}
                                x2={X(candidate.x)}
                                y2={Y(candidate.y)}
                                stroke="var(--accent)"
                                strokeWidth="1.7"
                                strokeDasharray="6 4"
                              />
                            )}
                            {current && test && (
                              <line
                                x1={X(current.x)}
                                y1={Y(current.y)}
                                x2={X(test.x)}
                                y2={Y(test.y)}
                                stroke="var(--test-amber)"
                                strokeWidth="1.4"
                                strokeDasharray="3 4"
                              />
                            )}
                            {points.map((p) => {
                              const active = p.id === frame.current,
                                testing = p.id === frame.test,
                                proposed = p.id === frame.candidate,
                                onHull = frame.hull.includes(p.id);
                              const color = testing
                                ? "var(--test-amber)"
                                : proposed
                                  ? "var(--accent)"
                                  : active || onHull
                                    ? "var(--edge-green)"
                                    : "var(--point-stroke)";
                              return (
                                <g key={p.id}>
                                  {active && (
                                    <circle
                                      cx={X(p.x)}
                                      cy={Y(p.y)}
                                      r="10"
                                      fill="#dfede5"
                                      stroke="#b5d1c1"
                                      strokeWidth=".8"
                                    />
                                  )}
                                  <circle
                                    cx={X(p.x)}
                                    cy={Y(p.y)}
                                    r={
                                      active || testing || proposed ? 4.5 : 3.8
                                    }
                                    fill={
                                      active || testing || proposed || onHull
                                        ? color
                                        : "#fff"
                                    }
                                    stroke={color}
                                    strokeWidth="1.6"
                                  />
                                  {labels && (
                                    <text
                                      x={X(p.x) + 10}
                                      y={Y(p.y) - 10}
                                      className="point-label"
                                      style={
                                        active
                                          ? { fill: "var(--edge-green)" }
                                          : undefined
                                      }
                                    >
                                      {p.id}
                                    </text>
                                  )}
                                  <title>{`${p.id}: (${p.x}, ${p.y})`}</title>
                                </g>
                              );
                            })}
                          </>
                        )}
                      </svg>
                      <span className="canvas-coordinate">
                        {isSkyline
                          ? "CARTESIAN PLANE / SKYLINE"
                          : "CARTESIAN PLANE / CONVEX HULL"}
                      </span>
                    </div>
                    <div className="canvas-settings">
                      <label>
                        {isSkyline ? "Buildings" : "Points"}
                        <strong>{count}</strong>
                        <input
                          aria-label={
                            isSkyline
                              ? "Number of buildings"
                              : "Number of points"
                          }
                          type="range"
                          min={isSkyline ? 4 : 5}
                          max={isSkyline ? 16 : 35}
                          value={Math.min(count, isSkyline ? 16 : 35)}
                          onChange={(e) =>
                            loadPreset(preset, Number(e.target.value))
                          }
                        />
                      </label>
                      <div>
                        {!isSkyline && (
                          <button
                            className={`text-button ${
                              editing ? "editing-button" : ""
                            }`}
                            aria-pressed={editing}
                            onClick={() => {
                              setPlaying(false);
                              setEditing(!editing);
                            }}
                          >
                            <Icon name={editing ? "check" : "plus"} size={14} />
                            {editing ? "Done adding" : "Add points"}
                          </button>
                        )}
                        <span className="settings-divider" />
                        <button
                          className="text-button"
                          onClick={() => loadPreset(preset)}
                        >
                          <Icon name="shuffle" size={14} />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </section>
                  <aside className="explanation-column">
                    <section
                      className={`step-card ${
                        completed ? "step-complete" : ""
                      }`}
                    >
                      <div className="panel-heading">
                        <div>
                          <Icon name="book" size={16} />
                          <h2>Current step</h2>
                        </div>
                        <span className="step-index">
                          {String(step + 1).padStart(2, "0")}
                          <span> / {frames.length}</span>
                        </span>
                      </div>
                      <div
                        className="step-body"
                        aria-live={playing ? "off" : "polite"}
                      >
                        <span className="phase-tag">
                          <span />
                          {frame.phase}
                        </span>
                        <h3>{frame.title}</h3>
                        <p>{frame.detail}</p>
                        <div className="step-variables">
                          {isSkyline ? (
                            <>
                              <span>
                                x <strong>{frame.sweep ?? "—"}</strong>
                              </span>
                              <span>
                                active{" "}
                                <strong>{frame.activeBuildings.length}</strong>
                              </span>
                            </>
                          ) : (
                            <>
                              <span>
                                current <strong>{frame.current ?? "—"}</strong>
                              </span>
                              <span>
                                candidate{" "}
                                <strong>{frame.candidate ?? "—"}</strong>
                              </span>
                            </>
                          )}
                          {frame.test && (
                            <span>
                              test <strong>{frame.test}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="step-footer">
                        <span className={playing ? "pulse-dot" : "quiet-dot"} />
                        {completed
                          ? "Algorithm complete"
                          : playing
                            ? "Following playback"
                            : "Step through at your own pace"}
                        <Icon name={completed ? "check" : "arrow"} size={13} />
                      </div>
                    </section>
                    <section className="code-card">
                      <div className="panel-heading">
                        <div>
                          <Icon name="code" size={15} />
                          <h2>Pseudocode</h2>
                        </div>
                        <span className="code-language">Python</span>
                      </div>
                      <div className="code-lines">
                        {code.map((line, i) => (
                          <div
                            key={i}
                            className={`code-line ${
                              frame.line === i ? "highlight-line" : ""
                            }`}
                          >
                            <span className="line-number">{i + 1}</span>
                            <code>
                              {line
                                .split(
                                  /(\b(?:while|if|for|in|return|break|True)\b)/g,
                                )
                                .map((part, j) => (
                                  <span
                                    key={j}
                                    className={
                                      /^(while|if|for|in|return|break|True)$/.test(
                                        part,
                                      )
                                        ? "syntax-keyword"
                                        : ""
                                    }
                                  >
                                    {part}
                                  </span>
                                ))}
                            </code>
                          </div>
                        ))}
                      </div>
                    </section>
                  </aside>
                </div>
                <section
                  className="playback-panel"
                  aria-label="Playback controls"
                >
                  <div className="playback-controls">
                    <button
                      className="icon-button"
                      title="Reset (R)"
                      onClick={reset}
                    >
                      <Icon name="reset" size={17} />
                    </button>
                    <button
                      className="icon-button"
                      title="Previous step (Left arrow)"
                      disabled={step === 0}
                      onClick={() => move(-1)}
                    >
                      <Icon name="back" size={16} />
                    </button>
                    <button
                      className="play-button"
                      aria-label={
                        playing ? "Pause" : completed ? "Replay" : "Play"
                      }
                      onClick={togglePlay}
                    >
                      <Icon name={playing ? "pause" : "play"} size={19} />
                    </button>
                    <button
                      className="icon-button"
                      title="Next step (Right arrow)"
                      disabled={completed}
                      onClick={() => move(1)}
                    >
                      <Icon name="next" size={16} />
                    </button>
                  </div>
                  <div className="playback-progress">
                    <div>
                      <span>
                        {completed
                          ? "Complete"
                          : playing
                            ? "Playing"
                            : step === 0
                              ? "Ready to start"
                              : "Paused"}
                        <span className="progress-separator">·</span>
                        <span className="step-count">
                          Step {step} of {frames.length - 1}
                        </span>
                      </span>
                      <span>
                        {Math.round((step / (frames.length - 1)) * 100)}%
                      </span>
                    </div>
                    <input
                      aria-label="Playback position"
                      type="range"
                      min="0"
                      max={frames.length - 1}
                      value={step}
                      onChange={(e) => {
                        setPlaying(false);
                        setStep(Number(e.target.value));
                      }}
                      style={{
                        "--progress": `${(step / (frames.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="speed-control">
                    <span>Speed</span>
                    <select
                      aria-label="Playback speed"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                    >
                      {[0.5, 1, 1.5, 2, 3].map((s) => (
                        <option key={s} value={s}>
                          {s}×
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon purple">
                      <Icon name="code" size={18} />
                    </div>
                    <div>
                      <span>Time complexity</span>
                      <strong>
                        {algorithm === "Jarvis March" ? "O(nh)" : "O(n log n)"}
                        <small>
                          {algorithm === "Jarvis March"
                            ? "output-sensitive"
                            : "worst case"}
                        </small>
                      </strong>
                    </div>
                    <span
                      className="metric-info"
                      title={
                        algorithm === "Jarvis March"
                          ? "n is the input size; h is the number of hull vertices."
                          : "The conceptual algorithm includes sorting and an efficient active-set or stack implementation."
                      }
                    >
                      i
                    </span>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon peach">
                      <Icon name={isSkyline ? "sweep" : "polygon"} size={18} />
                    </div>
                    <div>
                      <span>
                        {isSkyline ? "Active buildings" : "Hull vertices"}
                      </span>
                      <strong>
                        {isSkyline ? frame.activeBuildings.length : uniqueHull}
                        <small>
                          {isSkyline
                            ? `of ${count} buildings`
                            : `of ${count} points`}
                        </small>
                      </strong>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon mint-icon">
                      <Icon name="search" size={18} />
                    </div>
                    <div>
                      <span>
                        {isSkyline ? "Edges processed" : "Orientation tests"}
                      </span>
                      <strong>
                        {frame.checks}
                        <small>
                          {isSkyline ? "sweep events" : "cross products"}
                        </small>
                      </strong>
                    </div>
                  </div>
                </div>
              </>
            )}
            <span className="notation-note">
              {isSkyline
                ? "n = number of buildings"
                : "n = number of points · h = hull vertices"}
            </span>
          </div>
        </main>
      )}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <Icon name="close" />
            </button>
            {modal === "shortcuts" ? (
              <>
                <span className="section-kicker">WORKSPACE CONTROLS</span>
                <h2 id="modal-title">Keyboard shortcuts</h2>
                {[
                  ["Play / pause", "Space"],
                  ["Next step", "→"],
                  ["Previous step", "←"],
                  ["Reset", "R"],
                  ["Find an algorithm", "Ctrl / ⌘ K"],
                  ["Close dialog / stop adding", "Esc"],
                ].map(([label, key]) => (
                  <div className="shortcut-row" key={key}>
                    <span>{label}</span>
                    <kbd>{key}</kbd>
                  </div>
                ))}
              </>
            ) : (
              <>
                <span className="section-kicker">WORKSPACE GUIDE</span>
                <h2 id="modal-title">See the geometry unfold.</h2>
                <p>
                  Explore convex hull and sweep-line algorithms with a
                  coordinate canvas and a written explanation for every step.
                </p>
                {[
                  [
                    "Choose your input",
                    "Best and worst cases are algorithm-specific. Hover over each preset for its behavior, or read the note below the buttons.",
                  ],
                  [
                    "Follow each decision",
                    "The Current step panel explains each operation. The canvas legend identifies the candidate direction, the point being tested, and the hull boundary. Each algorithm has its own color theme.",
                  ],
                  [
                    "Control the pace",
                    "Play the sequence, adjust the speed, or use the arrows to move one step at a time. Python-style pseudocode highlights the current operation.",
                  ],
                ].map(([title, text], i) => (
                  <div className="guide-step" key={title}>
                    <span>0{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
                <button
                  className="primary-button"
                  onClick={() => setModal(null)}
                >
                  {screen === "library"
                    ? "Back to algorithms"
                    : "Back to workspace"}{" "}
                  <Icon name="arrow" size={15} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
