import heapq
import random

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

    # all x-coordinates (left and right), without duplicates, sorted
    xs = sorted(set([left for (left, right, height) in rectangles] +
                    [right for (left, right, height) in rectangles]))

    area = 0
    for i in range(len(xs) - 1):
        a = xs[i]
        b = xs[i + 1]

        # highest rectangle that covers the whole strip [a, b]
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
            width = random.randint(1, 20)     # > 0, so no degenerate rectangle
            height = random.randint(1, 20)    # > 0
            rectangles.append((left, left + width, height))

        expected = brute_force_area(rectangles)
        result = manhattan_skyline_plane_sweep(rectangles)
        assert result == expected, f"Failed for {rectangles}: {result} != {expected}"

    print(f"All {trials} tests passed.")


# ---------------------------------------------------------------------------
# Generators: n rectangles (left, right, height) of a given type
# ---------------------------------------------------------------------------

def no_overlap(n):
    """Side by side with gaps in between: at most one rectangle active at a time."""
    return [(2 * i, 2 * i + 1, random.randint(1, 100)) for i in range(n)]


def random_rectangles(n):
    """Random left side in [0, 10n], width 1..20, height 1..100."""
    rectangles = []
    for _ in range(n):
        left = random.randint(0, 10 * n)
        rectangles.append((left, left + random.randint(1, 20), random.randint(1, 100)))
    return rectangles


def all_overlap(n):
    """Every rectangle contains the strip [n, n+1]: there they are all active at once."""
    return [(random.randint(0, n), random.randint(n + 1, 2 * n + 1), random.randint(1, 100))
            for _ in range(n)]


def umbrella(n):
    """
    Umbrella rectangle: one wide, tall rectangle and n-1 small,
    non-overlapping rectangles underneath it.
    The small ones are never active at the same time, but they stay dead in
    the heap because the umbrella is on top (lazy deletion).
    """
    return [(0, 2 * n + 1, 1000)] + [(2 * i + 1, 2 * i + 2, random.randint(1, 100))
                                     for i in range(n - 1)]


TYPES = {
    "no overlap": no_overlap,
    "random": random_rectangles,
    "all overlap": all_overlap,
    "umbrella": umbrella,
}


def check_types_against_brute_force(n=200):
    """Sanity check: every generator gives an input where sweep == brute force."""
    for name, generate in TYPES.items():
        rectangles = generate(n)
        assert brute_force_area(rectangles) == manhattan_skyline_plane_sweep(rectangles), name


if __name__ == "__main__":
    rectangles = [(0, 10, 10), (1, 4, 8), (2, 12, 5)]
    area = manhattan_skyline_plane_sweep(rectangles)
    print(f"The area of the Manhattan skyline is: {area}")
    test_against_brute_force(1000)
    check_types_against_brute_force()
    print("All tests passed successfully.")
