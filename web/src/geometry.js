import { getSteps } from "./python.js";

export const algorithms = ["Jarvis March", "Graham Scan", "Manhattan Skyline"];
export const presetsFor = (a) =>
  a === "Manhattan Skyline"
    ? ["Random", "Best case", "Worst case", "Overlapping", "Staircase"]
    : ["Random", "Best case", "Worst case", "Collinear", "Clustered"];
export const presetNote = (a, p) => {
  if (a === "Manhattan Skyline")
    return (
      {
        Random: "A mixed cityscape with varied heights and overlaps.",
        "Best case":
          "Disjoint buildings · at most one active building at a time.",
        "Worst case":
          "Nested buildings · maximum overlap and active-set size. Time remains O(n log n).",
        Overlapping:
          "Intersecting rooftops · see how the tallest active building defines the skyline.",
        Staircase: "Increasing heights · a clear sequence of skyline changes.",
      }[p] ?? ""
    );
  if (a === "Jarvis March")
    return (
      {
        Random:
          "A scattered point set with a mix of boundary and interior points.",
        "Best case":
          "Triangular boundary · only three hull vertices, so O(nh) becomes O(n).",
        "Worst case":
          "Points on a circle · every point is on the hull, giving O(n²).",
        Collinear:
          "All points on one line · only the two endpoints belong to the hull.",
        Clustered:
          "A dense central cluster surrounded by a few boundary points.",
      }[p] ?? ""
    );
  return (
    {
      Random:
        "A scattered point set with a mix of boundary and interior points.",
      "Best case":
        "Convex position · no stack removals after sorting. Overall time is still O(n log n).",
      "Worst case":
        "Alternating inner and outer points · repeated stack removals. Overall time is still O(n log n).",
      Collinear:
        "Equal polar angles · keep the farthest point and discard intermediate points.",
      Clustered:
        "Interior points create right turns and are removed from the stack.",
    }[p] ?? ""
  );
};
export function createPoints(preset, n, algorithm) {
  const coords = [];
  const random = (low, high) => low + Math.random() * (high - low);
  if (preset === "Collinear") {
    for (let i = 0; i < n; i++) {
      const v = 12 + (i * 76) / (n - 1);
      coords.push([v, v]);
    }
  } else if (
    (preset === "Worst case" && algorithm === "Jarvis March") ||
    (preset === "Best case" && algorithm === "Graham Scan")
  ) {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      coords.push([50 + 39 * Math.cos(t), 50 + 39 * Math.sin(t)]);
    }
  } else if (preset === "Best case") {
    coords.push([10, 14], [90, 14], [50, 90]);
    for (let i = 3; i < n; i++) {
      const y = random(24, 65);
      const half = ((90 - y) / 76) * 30;
      coords.push([random(50 - half, 50 + half), y]);
    }
  } else if (preset === "Worst case") {
    coords.push([50, 8]);
    for (let i = 1; i < n; i++) {
      const angle = 0.12 + ((i - 1) / (n - 2)) * (Math.PI - 0.24);
      const r = i % 2 ? 79 : 26;
      coords.push([50 + Math.cos(angle) * r * 0.48, 8 + Math.sin(angle) * r]);
    }
  } else if (preset === "Clustered") {
    coords.push([10, 25], [25, 88], [84, 80], [90, 20]);
    for (let i = 4; i < n; i++) coords.push([random(34, 65), random(32, 64)]);
  } else {
    for (let i = 0; i < n; i++) coords.push([random(10, 90), random(10, 90)]);
  }
  return coords.map(([x, y], i) => ({
    id: `P${i}`,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  }));
}
export const initialPoints = [
  [13, 34],
  [26, 72],
  [43, 86],
  [73, 79],
  [88, 49],
  [77, 19],
  [39, 12],
  [35, 44],
  [53, 62],
  [64, 38],
  [49, 28],
  [26, 30],
  [72, 58],
  [45, 53],
  [58, 18],
].map(([x, y], i) => ({ id: `P${i}`, x, y }));

export function createBuildings(preset, n) {
  return Array.from({ length: n }, (_, i) => {
    let left = 5 + Math.random() * 72,
      right = Math.min(95, left + 8 + Math.random() * 22),
      height = 15 + Math.random() * 65;
    if (preset === "Best case") {
      left = 5 + (i * 90) / n;
      right = left + (90 / n) * 0.65;
    }
    if (preset === "Worst case") {
      left = 5 + (i * 35) / n;
      right = 95 - (i * 35) / n;
      height = 15 + (i * 65) / n;
    }
    if (preset === "Overlapping") {
      left = 8 + (i * 60) / n;
      right = Math.min(95, left + 25);
      height = 22 + ((i * 23) % 58);
    }
    if (preset === "Staircase") {
      left = 5 + (i * 80) / n;
      right = Math.min(96, left + 16);
      height = 15 + (i * 65) / n;
    }
    return {
      id: `B${i}`,
      left: +left.toFixed(1),
      right: +right.toFixed(1),
      height: +height.toFixed(1),
    };
  });
}

export const initialBuildings = [
  { id: "B0", left: 8, right: 30, height: 38 },
  { id: "B1", left: 19, right: 42, height: 66 },
  { id: "B2", left: 35, right: 55, height: 47 },
  { id: "B3", left: 49, right: 66, height: 80 },
  { id: "B4", left: 60, right: 79, height: 57 },
  { id: "B5", left: 75, right: 91, height: 32 },
];
// ---------------------------------------------------------------------------
// Frames come from the Python algorithms (web/public/python), run by Pyodide.
// This file only translates Python steps into the frames the UI draws.
// ---------------------------------------------------------------------------

// UI name -> name in the Python registry (algorithms/registry.py)
const PYTHON_NAMES = {
  "Jarvis March": "Jarvis march",
  "Graham Scan": "Graham scan",
};

// A frame with every field the UI reads, showing just a message.
// Used while Python loads, for errors, and for algorithms without Python steps yet.
export function messageFrames(title, detail) {
  return [
    {
      hull: [],
      title,
      detail,
      phase: "",
      line: -1,
      checks: 0,
      current: undefined,
      candidate: undefined,
      test: undefined,
      sweep: undefined,
      skyline: [],
      activeBuildings: [],
    },
  ];
}

function stepToFrame(step, idOf, checks) {
  const frame = messageFrames(step.title, step.text)[0];
  frame.checks = checks;
  frame.hull = (step.hull.length > 0 ? step.hull : (step.path ?? [])).map(idOf);
  const currentPoint =
    step.points.current ??
    step.points.top ??
    step.points.popped ??
    step.points.start;
  frame.current = currentPoint && idOf(currentPoint);
  const candidatePoint = step.points.candidate ?? step.points.prev;
  frame.candidate = candidatePoint && idOf(candidatePoint);
  frame.test = step.points.testing && idOf(step.points.testing);
  frame.phase =
    step.title.startsWith("Testing") || step.title.startsWith("Check turn")
      ? "Orientation test"
      : step.title.startsWith("Popped")
        ? "Pop stack"
        : step.title.startsWith("Next hull point")
          ? "Commit edge"
          : step.title.startsWith("Done")
            ? "Complete"
            : "Setup";
  return frame;
}

// points: the UI's points [{ id, x, y }, ...]. Returns a Promise of frames.
export async function hullFrames(points, algorithm) {
  const ids = new Map(points.map((p) => [`${p.x},${p.y}`, p.id]));
  const idOf = (point) => ids.get(`${point[0]},${point[1]}`);

  const steps = await getSteps(
    PYTHON_NAMES[algorithm],
    points.map((p) => [p.x, p.y]),
  );

  let checks = 0;
  return steps.map((step) => {
    if (step.points.testing) checks += 1; // every step that tests a point is one orientation test
    return stepToFrame(step, idOf, checks);
  });
}

export const snippets = {
  "Jarvis March": [
    "start = current = leftmost(points)",
    "hull = [start]",
    "while True:",
    "    candidate = next_point(current)",
    "    for point in points:",
    "        if is_outermost(current, candidate, point):",
    "            candidate = point",
    "    hull.append(candidate)",
    "    current = candidate",
    "    if current == start: break",
  ],
  "Graham Scan": [
    "pivot = lowest(points)",
    "ordered = sort_by_angle(points, pivot)",
    "stack = [pivot]",
    "for point in ordered:",
    "    while makes_non_left_turn(stack, point):",
    "        stack.pop()",
    "    stack.append(point)",
    "return close_polygon(stack)",
  ],
  "Manhattan Skyline": [
    "events = sorted_edges(buildings)",
    "active = MaxHeap([0])",
    "for x, group in group_by_x(events):",
    "    update_active(active, group)",
    "    height = active.maximum()",
    "    if height != previous_height:",
    "        skyline.append((x, height))",
    "return skyline",
  ],
};
