import random

from algorithms.graham import graham_scan, graham_steps
from algorithms.jarvis import jarvis_march
from shared.geometry import cross
from shared.points import random_points


def test_square_starts_at_lowest_point_counterclockwise():
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]
    assert graham_scan(points) == [(0, 0), (4, 0), (4, 4), (0, 4)]


def test_points_on_edges_are_not_hull_points():
    # includes a point on the last ray back to the start point
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 0), (0, 2), (2, 4)]
    assert graham_scan(points) == [(0, 0), (4, 0), (4, 4), (0, 4)]


def test_collinear_points_give_the_two_ends():
    assert graham_scan([(0, 0), (1, 1), (3, 3)]) == [(0, 0), (3, 3)]


def test_input_list_is_not_changed():
    points = [(3, 1), (0, 0), (1, 2), (2, 5)]
    copy = list(points)
    graham_scan(points)
    graham_steps(points)
    assert points == copy


def test_no_steps_for_fewer_than_three_points():
    assert graham_steps([]) == []
    assert graham_steps([(0, 0), (1, 1)]) == []


def test_steps_pop_an_interior_point_and_close_the_hull():
    steps = graham_steps([(0, 0), (2, 1), (1, 1), (0, 3)])
    assert [step["title"] for step in steps[:2]] == ["Start point", "Sorted by angle"]
    assert steps[0]["points"]["start"] == (0, 0)
    assert any(step["title"] == "Check turn (2, 1) -> (1, 1) -> (0, 3)" for step in steps)
    assert any(step["title"] == "Popped (1, 1)" for step in steps)
    assert steps[-1]["title"] == "Done"
    assert steps[-1]["hull"] == [(0, 0), (2, 1), (0, 3), (0, 0)]


def test_collinear_steps_have_no_scan():
    steps = graham_steps([(0, 0), (1, 1), (3, 3)])
    assert [step["title"] for step in steps] == ["Start point", "Sorted by angle", "Done"]
    assert steps[-1]["hull"] == [(0, 0), (3, 3), (0, 0)]


def test_random_inputs_against_jarvis():
    random.seed(0)
    for _ in range(300):
        points = random_points(random.randint(3, 30), -20, 20)
        hull = graham_scan(points)
        steps = graham_steps(points)

        assert steps[-1]["hull"] == hull + [hull[0]]
        assert all(
            step["points"]["popped"] not in hull
            for step in steps
            if "popped" in step["points"]
        )
        # no point lies to the right of any hull edge
        for i in range(len(hull)):
            a, b = hull[i], hull[(i + 1) % len(hull)]
            for r in points:
                assert cross(a, b, r) >= 0, f"{r} is right of {a} -> {b}, hull = {hull}"
        # same hull points as Jarvis (different start point, so compare as sets)
        assert set(hull) == set(jarvis_march(points))
