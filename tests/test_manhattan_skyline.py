import random

import pytest

from algorithms.manhattan_skyline import manhattan_skyline_plane_sweep, manhattan_skyline_steps


def brute_force_area(rectangles):
    """Reference: for every strip between consecutive x-coordinates, take the
    highest rectangle that covers it. O(n^2), but obviously correct."""
    xs = sorted({x for (left, right, height) in rectangles for x in (left, right)})
    area = 0
    for a, b in zip(xs, xs[1:]):
        max_height = max(
            (height for (left, right, height) in rectangles if left <= a and right >= b),
            default=0,
        )
        area += max_height * (b - a)
    return area


def random_input(n):
    rectangles = []
    for _ in range(n):
        left = random.randint(0, 50)
        rectangles.append((left, left + random.randint(1, 20), random.randint(1, 20)))
    return rectangles


# Generators for inputs with a known shape: n rectangles (left, right, height).
def no_overlap(n):
    """Side by side with gaps in between: at most one rectangle active at a time."""
    return [(2 * i, 2 * i + 1, random.randint(1, 100)) for i in range(n)]


def wide_random(n):
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
    """One wide, tall rectangle over n-1 small ones. The small ones stay in the
    heap after they end, because the umbrella is on top (lazy deletion)."""
    return [(0, 2 * n + 1, 1000)] + [(2 * i + 1, 2 * i + 2, random.randint(1, 100))
                                    for i in range(n - 1)]


def test_example():
    assert manhattan_skyline_plane_sweep([(0, 10, 10), (1, 4, 8), (2, 12, 5)]) == 110


def test_empty_input():
    assert manhattan_skyline_plane_sweep([]) == 0
    assert manhattan_skyline_steps([]) == []


def test_sweep_matches_brute_force():
    random.seed(0)
    for _ in range(1000):
        rectangles = random_input(random.randint(1, 20))
        assert manhattan_skyline_plane_sweep(rectangles) == brute_force_area(rectangles), rectangles


def test_steps_end_with_the_brute_force_area():
    random.seed(1)
    for _ in range(1000):
        rectangles = random_input(random.randint(1, 20))
        assert manhattan_skyline_steps(rectangles)[-1]["area"] == brute_force_area(rectangles), rectangles


@pytest.mark.parametrize("generate", [no_overlap, wide_random, all_overlap, umbrella])
def test_input_shapes_match_brute_force(generate):
    random.seed(2)
    rectangles = generate(200)
    assert manhattan_skyline_plane_sweep(rectangles) == brute_force_area(rectangles)
    assert manhattan_skyline_steps(rectangles)[-1]["area"] == brute_force_area(rectangles)


def test_building_ending_underneath_gets_its_own_step():
    # (1, 3) ends at x = 3 while the taller (0, 10) is still on top of the heap
    steps = manhattan_skyline_steps([(0, 10, 10), (1, 3, 5)])
    underneath = [s for s in steps if s["title"] == "Building ends underneath"]
    assert len(underneath) == 1
    assert underneath[0]["sweep"] == 3
