// The Python files the browser needs (paths inside web/public/python/)
const PYTHON_FILES = [
  "algorithms/__init__.py",
  "algorithms/jarvis.py",
  "algorithms/graham.py",
  "algorithms/registry.py",
  "shared/geometry.py",
  "shared/points.py",
];

// Small Python helper: runs an algorithm and returns its steps as JSON text.
// JSON can't have tuples as dictionary keys, so "labels" becomes a list of [point, label] pairs.
const BRIDGE = `
import json
from algorithms.registry import ALGORITHMS

def steps_json(name, points_json):
    points = [tuple(p) for p in json.loads(points_json)]
    steps = ALGORITHMS[name](points)
    for step in steps:
        step["labels"] = [[list(p), label] for p, label in step.get("labels", {}).items()]
    return json.dumps(steps)
`;

let pyodidePromise = null;

// Start Pyodide only once, however many times this is called.
function startPython() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const { loadPyodide } = await import(
        /* @vite-ignore */ "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs"
      );
      const pyodide = await loadPyodide();
      pyodide.FS.mkdirTree("algorithms");
      pyodide.FS.mkdirTree("shared");
      for (const file of PYTHON_FILES) {
        const text = await (await fetch(`/python/${file}`)).text();
        pyodide.FS.writeFile(file, text);
      }
      pyodide.runPython(BRIDGE);
      return pyodide;
    })();
  }
  return pyodidePromise;
}

// points: a list of [x, y] pairs. Returns the steps exactly as your Python made them.
export async function getSteps(algorithmName, points) {
  const pyodide = await startPython();
  const stepsJson = pyodide.globals.get("steps_json")(
    algorithmName,
    JSON.stringify(points),
  );
  return JSON.parse(stepsJson);
}
