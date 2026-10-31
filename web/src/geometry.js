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
const cross = (a, b, c) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const distance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export function hullFrames(points, algorithm) {
  const frames = [];
  let checks = 0;
  const save = (hull, title, detail, phase, line, current, candidate, test) =>
    frames.push({
      hull: hull.map((p) => p.id),
      title,
      detail,
      phase,
      line,
      checks,
      current: current?.id,
      candidate: candidate?.id,
      test: test?.id,
      skyline: [],
      activeBuildings: [],
    });
  if (algorithm === "Jarvis March") {
    const start = points.reduce((a, p) =>
      p.x < a.x || (p.x === a.x && p.y < a.y) ? p : a,
    );
    const hull = [start];
    let current = start;
    save(
      hull,
      "Start at the leftmost point",
      `${start.id} has the smallest x-coordinate (${start.x}). It must be on the convex hull, so it becomes our starting vertex.`,
      "Initialize",
      0,
      start,
    );
    do {
      let candidate = points.find((p) => p.id !== current.id);
      save(
        hull,
        "Choose an initial candidate",
        `From ${current.id}, start with ${candidate.id} as the candidate for the next hull vertex. Now check every other point against this direction.`,
        "Find next vertex",
        3,
        current,
        candidate,
      );
      for (const test of points) {
        if (test.id === current.id || test.id === candidate.id) continue;
        const turn = cross(current, candidate, test);
        checks++;
        save(
          hull,
          "Test the next point",
          `Check the orientation of ${current.id} → ${candidate.id} → ${test.id}. ${
            Math.abs(turn) < 1e-8
              ? "These points are collinear; compare their distances from the current vertex."
              : turn < 0
                ? `${test.id} is clockwise from the candidate, so it becomes the new candidate.`
                : `${test.id} is counterclockwise from the candidate. Keep ${candidate.id} and continue scanning.`
          }`,
          "Orientation test",
          5,
          current,
          candidate,
          test,
        );
        if (
          turn < 0 ||
          (Math.abs(turn) < 1e-8 &&
            distance(current, test) > distance(current, candidate))
        ) {
          candidate = test;
          save(
            hull,
            "Update the candidate",
            `${candidate.id} is the new outermost candidate from ${current.id}. The dashed segment shows the direction we are now testing.`,
            "Update candidate",
            6,
            current,
            candidate,
          );
        }
      }
      hull.push(candidate);
      save(
        hull,
        candidate.id === start.id
          ? "The hull is complete"
          : "Confirm a hull edge",
        candidate.id === start.id
          ? `We have returned to ${start.id}. The closed boundary contains ${hull.length - 1} hull vertices and encloses every input point.`
          : `No point lies clockwise of ${current.id} → ${candidate.id}. Confirm this edge and continue wrapping from ${candidate.id}.`,
        candidate.id === start.id ? "Complete" : "Commit edge",
        7,
        candidate,
      );
      current = candidate;
    } while (current.id !== start.id && hull.length <= points.length);
  } else {
    const pivot = points.reduce((a, p) =>
      p.y < a.y || (p.y === a.y && p.x < a.x) ? p : a,
    );
    const ordered = points
      .filter((p) => p.id !== pivot.id)
      .sort(
        (a, b) =>
          Math.atan2(a.y - pivot.y, a.x - pivot.x) -
            Math.atan2(b.y - pivot.y, b.x - pivot.x) ||
          distance(pivot, a) - distance(pivot, b),
      );
    const stack = [pivot];
    save(
      stack,
      "Find the lowest point",
      `${pivot.id} is the lowest point (y = ${pivot.y}). Use it as the pivot and sort all other points by polar angle, breaking ties by distance.`,
      "Initialize",
      0,
      pivot,
    );
    save(
      stack,
      "Sort by polar angle",
      `The angular order begins ${ordered
        .slice(0, 5)
        .map((p) => p.id)
        .join(", ")}. Scan this sequence and keep only left turns.`,
      "Sort points",
      1,
      pivot,
      ordered[0],
    );
    for (const p of ordered) {
      while (stack.length >= 2) {
        const a = stack[stack.length - 2],
          b = stack[stack.length - 1],
          turn = cross(a, b, p);
        checks++;
        save(
          stack,
          "Check the turn",
          `Test ${a.id} → ${b.id} → ${p.id}. ${
            turn > 0
              ? "This is a left turn, so the current boundary remains convex."
              : `This ${
                  turn === 0 ? "collinear segment" : "right turn"
                } cannot be part of the outer boundary. Remove ${b.id} from the stack.`
          }`,
          "Orientation test",
          4,
          a,
          b,
          p,
        );
        if (turn > 0) break;
        stack.pop();
        save(
          stack,
          "Remove the middle point",
          `${b.id} is removed from the hull stack. Check ${p.id} against the previous edge before adding it.`,
          "Pop stack",
          5,
          stack[stack.length - 1],
          p,
        );
      }
      stack.push(p);
      save(
        stack,
        "Add a hull candidate",
        `Push ${p.id} onto the stack. There are now ${stack.length} candidate hull vertices. Later points may still remove this vertex.`,
        "Push to stack",
        6,
        p,
      );
    }
    stack.push(pivot);
    save(
      stack,
      "The hull is complete",
      `Connect the final vertex back to ${pivot.id}. The stack contains ${stack.length - 1} hull vertices in counterclockwise order.`,
      "Complete",
      7,
      pivot,
    );
  }
  return frames;
}
export function skylineFrames(buildings) {
  const frames = [],
    skyline = [];
  const events = [...new Set(buildings.flatMap((b) => [b.left, b.right]))].sort(
    (a, b) => a - b,
  );
  const active = new Map();
  let checks = 0,
    lastHeight = 0;
  const save = (sweep, title, detail, phase, line) =>
    frames.push({
      hull: [],
      title,
      detail,
      phase,
      line,
      checks,
      sweep,
      skyline: skyline.map((p) => [...p]),
      activeBuildings: [...active.keys()],
    });
  save(
    undefined,
    "Prepare the sweep events",
    `Sort the ${events.length} distinct building-edge positions from left to right. At each position, process all starts and ends together.`,
    "Initialize",
    0,
  );
  for (const x of events) {
    const entering = buildings.filter((b) => b.left === x),
      leaving = buildings.filter((b) => b.right === x);
    for (const b of leaving) active.delete(b.id);
    for (const b of entering) active.set(b.id, b);
    checks += entering.length + leaving.length;
    save(
      x,
      "Move to the next event",
      `Sweep to x = ${x}. ${
        entering.length
          ? `${entering.map((b) => b.id).join(", ")} enter the active set. `
          : ""
      }${
        leaving.length
          ? `${leaving.map((b) => b.id).join(", ")} leave the active set. `
          : ""
      }${active.size} building${
        active.size === 1 ? " is" : "s are"
      } now active.`,
      "Process event",
      3,
    );
    const height = Math.max(0, ...[...active.values()].map((b) => b.height));
    if (height !== lastHeight) {
      skyline.push([x, lastHeight], [x, height]);
      save(
        x,
        "Record a skyline change",
        `The maximum active height changes from ${lastHeight} to ${height}. Add a key point at (${x}, ${height}) and extend the skyline to this position.`,
        "Update skyline",
        6,
      );
      lastHeight = height;
    } else {
      skyline.push([x, height]);
      save(
        x,
        "The height stays the same",
        `The tallest active building still has height ${height}. This edge is hidden by the existing skyline, so no new key point is needed.`,
        "Continue sweep",
        4,
      );
    }
  }
  save(
    events[events.length - 1],
    "The skyline is complete",
    "All building edges have been processed. The active set is empty, and the skyline returns to ground level.",
    "Complete",
    7,
  );
  return frames;
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
