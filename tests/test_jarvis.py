import random

from algorithms.jarvis import jarvis_march, jarvis_steps
from shared.geometry import cross
from shared.points import random_points


def test_square_with_interior_point():
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]
    assert jarvis_march(points) == [(0, 0), (4, 0), (4, 4), (0, 4)]


def test_point_on_an_edge_is_not_a_hull_point():
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 0)]
    assert jarvis_march(points) == [(0, 0), (4, 0), (4, 4), (0, 4)]


def test_random_inputs():
    random.seed(0)
    for _ in range(100):
        points = random_points(random.randint(3, 30), -20, 20)
        hull = jarvis_march(points)

        # no point lies to the right of any hull edge
        for i in range(len(hull)):
            a, b = hull[i], hull[(i + 1) % len(hull)]
            for r in points:
                assert cross(a, b, r) >= 0, f"{r} is right of {a} -> {b}, hull = {hull}"

        steps = jarvis_steps(points)
        # the steps end with the same hull as jarvis_march, closed
        assert steps[-1]["hull"] == hull + [hull[0]]
        # the done step shows only the hull: no candidates or tested points left
        assert steps[-1]["points"] == {} and steps[-1]["lines"] == []
        # snapshot check: the first step only knows the start point
        assert steps[0]["hull"] == [hull[0]]
        # one "next hull point" step per hull point
        assert sum(s["title"].startswith("Next hull point") for s in steps) == len(hull)
        # no step tests the current point or the candidate itself
        for step in steps:
            roles = step["points"]
            if "testing" in roles:
                assert roles["testing"] not in (roles["current"], roles["candidate"]), step["title"]
