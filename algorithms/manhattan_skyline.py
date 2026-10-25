import gc
import heapq
import math
import os
import random
import subprocess
import sys
import time

# brute force algorithm for Manhattan skyline
def brute_force_area(rectangles):
    """
    Computes the area under the Manhattan skyline by brute force.

    For every strip between two consecutive x-coordinates, loop over
    ALL rectangles to find the highest one that covers the strip.

    Returns:
        int/float: The area under the skyline.
    """
    if not rectangles:
        return 0

    # alle x-coördinaten (links en rechts), zonder dubbels, gesorteerd
    xs = sorted(set([left for (left, right, height) in rectangles] +
                    [right for (left, right, height) in rectangles]))

    area = 0
    for i in range(len(xs) - 1):
        a = xs[i]
        b = xs[i + 1]

        # hoogste rechthoek die het hele stuk [a, b] overdekt
        max_height = 0
        for (left, right, height) in rectangles:
            if left <= a and right >= b:
                max_height = max(max_height, height)

        area = area + max_height * (b - a)

    return area

# sweep line algorithm for Manhattan skyline
def manhattan_skyline_plane_sweep(rectangles):
    """
    Computes the Manhattan skyline of a set of rectangles.

    Returns:
        int: The area of the Manhattan skyline.
    """
    if not rectangles:
        return 0
    
    events = []
    for (left, right, height) in rectangles:
        events.append((left, 'START', height, right))
        events.append((right, 'END', 0, 0))        

    events.sort(key=lambda event: event[0])

    heap = []
    area = 0
    prev_x = events[0][0]
    current_height = 0

    for event in events:
        x = event[0]
        area = area + current_height * (x - prev_x)
        if event[1] == 'START':
            heapq.heappush(heap, (-event[2], event[3]))  # Push (-height, right) onto the heap
        while heap and heap[0][1] <= x:
            heapq.heappop(heap)
        if not heap:
            current_height = 0
        else:
            current_height = -heap[0][0]
        prev_x = x

    return area


def test_against_brute_force(trials=1000):
    for _ in range(trials):
        n = random.randint(1, 20)
        rectangles = []
        for _ in range(n):
            left = random.randint(0, 50)
            width = random.randint(1, 20)     # > 0, dus geen gedegenereerde rechthoek
            height = random.randint(1, 20)    # > 0
            rectangles.append((left, left + width, height))

        expected = brute_force_area(rectangles)
        result = manhattan_skyline_plane_sweep(rectangles)
        assert result == expected, f"Fout bij {rectangles}: {result} != {expected}"

    print(f"Alle {trials} tests geslaagd.")


# ---------------------------------------------------------------------------
# Generatoren: n rechthoeken (left, right, height) van een bepaald type
# ---------------------------------------------------------------------------

def no_overlap(n):
    """Naast elkaar met gaten ertussen: hooguit één rechthoek tegelijk actief."""
    return [(2 * i, 2 * i + 1, random.randint(1, 100)) for i in range(n)]


def random_rectangles(n):
    """Willekeurige linkerkant in [0, 10n], breedte 1..20, hoogte 1..100."""
    rectangles = []
    for _ in range(n):
        left = random.randint(0, 10 * n)
        rectangles.append((left, left + random.randint(1, 20), random.randint(1, 100)))
    return rectangles


def all_overlap(n):
    """Elke rechthoek bevat het stuk [n, n+1]: daar zijn ze allemaal tegelijk actief."""
    return [(random.randint(0, n), random.randint(n + 1, 2 * n + 1), random.randint(1, 100))
            for _ in range(n)]


def umbrella(n):
    """
    Overkoepelende rechthoek ('paraplu'): één brede, hoge rechthoek en n-1
    kleine, niet-overlappende rechthoeken eronder.
    De kleintjes zijn nooit tegelijk actief, maar blijven dood in de heap liggen
    omdat de paraplu bovenaan staat (lazy deletion).
    """
    return [(0, 2 * n + 1, 1000)] + [(2 * i + 1, 2 * i + 2, random.randint(1, 100))
                                     for i in range(n - 1)]


TYPES = {
    "geen overlap": no_overlap,
    "random": random_rectangles,
    "alles overlapt": all_overlap,
    "overkoepelende rechthoek": umbrella,
}

# eigen marker per type; overkoepelend open en groter, zodat hij 'alles overlapt'
# niet bedekt in de heapgrafiek (daar zijn hun waarden identiek)
MARKERS = {
    "geen overlap": dict(marker="o"),
    "random": dict(marker="^"),
    "alles overlapt": dict(marker="o", markersize=5),
    "overkoepelende rechthoek": dict(marker="s", markersize=10, markerfacecolor="none",
                                     linestyle="--"),
}


# ---------------------------------------------------------------------------
# Metingen
# ---------------------------------------------------------------------------

def sweep_stats(rectangles):
    """
    Dezelfde sweep als manhattan_skyline_plane_sweep, maar telt pushes, pops
    en de maximale heapgrootte. (Apart van de tijdmeting, zodat het tellen
    de gemeten tijd niet beïnvloedt.)
    """
    events = []
    for (left, right, height) in rectangles:
        events.append((left, 'START', height, right))
        events.append((right, 'END', 0, 0))
    events.sort(key=lambda event: event[0])

    heap = []
    pushes = pops = max_heap = 0
    for event in events:
        x = event[0]
        if event[1] == 'START':
            heapq.heappush(heap, (-event[2], event[3]))
            pushes += 1
            max_heap = max(max_heap, len(heap))
        while heap and heap[0][1] <= x:
            heapq.heappop(heap)
            pops += 1
    return {"pushes": pushes, "pops": pops, "max_heap": max_heap}


def time_once(function, rectangles):
    """Eén meting in seconden, zonder garbage collector ertussen (zoals timeit)."""
    gc.disable()
    try:
        start = time.perf_counter()
        function(rectangles)
        return time.perf_counter() - start
    finally:
        gc.enable()


def mean(values):
    return sum(values) / len(values)


def run_sweep_experiment(ns, sets=10):
    """Per type en per n: gemiddelde over `sets` verschillende inputs."""
    results = {name: [] for name in TYPES}
    print(f"gemiddelde over {sets} sets per n")
    print(f"{'type':<25} {'n':>7} {'tijd (ms)':>10} {'ns/(n log n)':>13} "
        f"{'pushes':>7} {'pops':>7} {'max heap':>9}")
    for name, generate in TYPES.items():
        for n in ns:
            times, stats = [], []
            for _ in range(sets):
                rectangles = generate(n)
                times.append(time_once(manhattan_skyline_plane_sweep, rectangles))
                stats.append(sweep_stats(rectangles))
            row = {"n": n, "time": mean(times)}
            for key in ("pushes", "pops", "max_heap"):
                row[key] = mean([s[key] for s in stats])
            results[name].append(row)
            print(f"{name:<25} {n:>7} {row['time'] * 1e3:>10.2f} "
                f"{row['time'] / (n * math.log2(n)) * 1e9:>13.1f} "
                f"{row['pushes']:>7.0f} {row['pops']:>7.0f} {row['max_heap']:>9.1f}")
    return results


def run_brute_force_experiment(ns, sets=10):
    rows = []
    print(f"\nbrute force vs. sweep (random), gemiddelde over {sets} sets per n")
    print(f"{'n':>6} {'brute force (ms)':>17} {'sweep (ms)':>11} {'factor':>7}")
    for n in ns:
        brute, sweep = [], []
        for _ in range(sets):
            rectangles = random_rectangles(n)
            assert brute_force_area(rectangles) == manhattan_skyline_plane_sweep(rectangles)
            brute.append(time_once(brute_force_area, rectangles))
            sweep.append(time_once(manhattan_skyline_plane_sweep, rectangles))
        row = {"n": n, "brute": mean(brute), "sweep": mean(sweep)}
        rows.append(row)
        print(f"{n:>6} {row['brute'] * 1e3:>17.2f} {row['sweep'] * 1e3:>11.2f} "
              f"{row['brute'] / row['sweep']:>7.0f}x")
    return rows


def check_types_against_brute_force(n=200):
    """Sanity check: elke generator geeft een input waarop sweep == brute force."""
    for name, generate in TYPES.items():
        rectangles = generate(n)
        assert brute_force_area(rectangles) == manhattan_skyline_plane_sweep(rectangles), name



if __name__ == "__main__":
    import matplotlib
    matplotlib.use("Agg")   # geen matplotlib-vensters, alleen bestanden

    rectangles = [(0, 10, 10), (1, 4, 8), (2, 12, 5)]
    area = manhattan_skyline_plane_sweep(rectangles)
    print(f"The area of the Manhattan skyline is: {area}")
    test_against_brute_force(1000)
    print("All tests passed successfully.")

    print("\nExperimenten lopen (ongeveer een minuut)...\n")
    random.seed(1)   # zelfde input bij elke run
    check_types_against_brute_force()
    results = run_sweep_experiment([1000 * 2 ** k for k in range(9)])   # 1000 .. 256 000
    brute_rows = run_brute_force_experiment([50 * 2 ** k for k in range(6)])   # 50 .. 1600
    open_graphs(make_plots(results, brute_rows))
