# Computational Geometry Visualisers

Step-by-step visualisations of computational geometry algorithms, built in Python with pygame.
Each step shows what the algorithm is testing, what it decides, and why, so you can follow it one comparison at a time.

## Features

- **Jarvis march (gift wrapping)** convex hull, visualised step by step
  - every orientation test is its own step, with the cross product value and the decision it leads to
  - colour-coded roles: current hull point (green), candidate (blue), point being tested (orange)
  - the hull is built up as the algorithm finds each point, then closed in the final step
- Step forward and backward through the whole run
- Random point sets on a labelled coordinate grid
- Text panel showing the algorithm, step number and an explanation of each step

## Controls

| Key | Action |
|-----|--------|
| `→` | Next step |
| `←` | Previous step |
| `R` | New random set of points |
| `C` | Clear all points |

## Getting started

```bash
git clone https://github.com/chrysalxsms/computational-geometry-visualisers.git
cd computational-geometry-visualisers
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Project structure

```
main.py                    window, drawing and keyboard controls
algorithms/
  registry.py              maps algorithm names to their step functions
  jarvis.py                Jarvis march + step generator
  manhattan_skyline.py     sweep-line skyline area (not visualised yet)
shared/
  geometry.py              cross product / orientation test
  points.py                random unique point generation
```

Each algorithm produces a list of **steps**. A step is a snapshot of the hull so far, the highlighted points and lines, and a text explanation. The UI only draws steps, so adding an algorithm means writing its step function and registering it in `registry.py`.

## Testing

The modules contain self-tests. Run them from the project root:

```bash
python -m shared.geometry
python -m shared.points
python -m algorithms.jarvis
python -m algorithms.manhattan_skyline
```

The Jarvis tests check the hull on fixed cases and on 100 random point sets, and check that the step sequence ends with the same hull. The skyline sweep is checked against a brute-force solution on 1000 random inputs.

## Roadmap

- [x] Jarvis march with step-through
- [ ] Graham scan
- [ ] Chan's algorithm
- [ ] Algorithm selection
- [ ] Autoplay with adjustable speed
- [ ] Visualise the Manhattan skyline sweep

