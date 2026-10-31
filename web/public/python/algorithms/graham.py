import math
import random

from shared.geometry import cross
from shared.points import random_points


def dist(p, q):
    return (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2

def graham_scan(P):
    if len(P) < 3:
        return P

    # 1. start point: lowest y, leftmost x on a tie
    p0 = min(P, key=lambda p: (p[1], p[0]))

    # 2. sort the OTHER points by polar angle around p0, nearest first on a tie
    #    (sorted() makes a new list, so the caller's P is not changed)
    others = [p for p in P if p != p0]
    others = sorted(others, key=lambda p: (math.atan2(p[1] - p0[1], p[0] - p0[0]), dist(p0, p)))

    # 3. points with the same angle from p0 (same ray): keep only the farthest
    unique_points = [p0]
    for p in others:
        last = unique_points[-1]
        if last != p0 and cross(p0, last, p) == 0:   # p0, last and p on one line
            if dist(p0, p) > dist(p0, last):
                unique_points[-1] = p                # p is farther: it replaces last
            continue                                 # else p is closer: drop it
        unique_points.append(p)

    # 4. all points on one line: only p0 and the farthest point are left
    if len(unique_points) < 3:
        return unique_points

    # 5. scan: a Python list is the stack (append = push, pop = pop, S[-1] = top)
    S = [unique_points[0], unique_points[1]]
    for p in unique_points[2:]:
        while len(S) > 1 and cross(S[-2], S[-1], p) <= 0:   # not a left turn
            S.pop()
        S.append(p)

    return S

def graham_steps(P):
    if len(P) < 3:
        return []
    steps = []

    p0 = min(P, key=lambda p: (p[1], p[0]))

    others = [p for p in P if p != p0]
    others = sorted(others, key=lambda p: (math.atan2(p[1] - p0[1], p[0] - p0[0]), dist(p0, p)))

    unique_points = [p0]
    for p in others:
        last = unique_points[-1]
        if last != p0 and cross(p0, last, p) == 0:   # p0, last and p on one line
            if dist(p0, p) > dist(p0, last):
                unique_points[-1] = p                # p is farther: it replaces last
            continue                                 # else p is closer: drop it
        unique_points.append(p)

    # STEP: start point
    steps.append({
        "title": "Start point",
        "hull": [], "path": [], "labels": {},
        "points": {"start": p0},
        "lines": [],
        "text": f"Start at {p0}: choose the point with the lowest y-coordinate; break ties by choosing the leftmost point.",
    })

    # labels: the sort order, built ONCE and never changed (so sharing it is safe)
    labels = {}
    for i, p in enumerate(unique_points):
        labels[p] = str(i)

    # STEP: sorted
    steps.append({
        "title": "Sorted by angle",
        "hull": [], "path": [], "labels": labels,
        "points": {"start": p0},
        "lines": [],
        "text": f"Each label is the order of that point after sorting by polar angle around {p0}; points on the same ray keep only the farthest one.",
    })

    # 4. all points on one line: go straight to Done
    if len(unique_points) < 3:
        S = unique_points
    else:
        # 5. scan, with a step recorded at every check and every pop
        S = [unique_points[0], unique_points[1]]
        for p in unique_points[2:]:
            while len(S) > 1:
                o = cross(S[-2], S[-1], p)

                # STEP: check the turn (recorded BEFORE deciding)
                if o > 0:
                    text = f"This is a left turn because the cross product is {o} > 0, so {p} is pushed onto the stack for now."
                else:
                    text = f"This is not a left turn because the cross product is {o} <= 0, so {S[-1]} cannot be on the convex hull and must be popped."
                steps.append({
                    "title": f"Check turn {S[-2]} -> {S[-1]} -> {p}",
                    "hull": [], "path": S.copy(), "labels": labels,
                    "points": {"prev": S[-2], "top": S[-1], "testing": p},
                    "lines": [(S[-2], S[-1], "top"), (S[-1], p, "testing")],
                    "text": text,
                })

                if o > 0:
                    break             # left turn: stop popping

                popped = S.pop()

                if o < 0:
                    pop_text = f"{popped} makes a clockwise turn, so it lies inside the hull and cannot be part of the convex boundary."
                else:
                    pop_text = f"{popped} is collinear with the edge, so it lies between the neighboring hull points and is not a corner of the convex boundary."

                # STEP: popped (path already WITHOUT the popped point)
                steps.append({
                    "title": f"Popped {popped}",
                    "hull": [], "path": S.copy(), "labels": labels,
                    "points": {"popped": popped},
                    "lines": [],
                    "text": pop_text,
                })
            S.append(p)

    # STEP: done (closed hull, nothing else)
    steps.append({
        "title": "Done",
        "hull": S + [S[0]], "path": [], "labels": labels,
        "points": {}, "lines": [],
        "text": "The stack is now the convex hull in counterclockwise order; every remaining edge has all other points on the left.",
    })
    return steps



if __name__ == "__main__":
    from algorithms.jarvis import jarvis_march

    # square with a point inside: starts at the lowest point, counterclockwise
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]
    assert graham_scan(points) == [(0, 0), (4, 0), (4, 4), (0, 4)]

    # points on edges (including the last ray back to p0) are not hull points
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 0), (0, 2), (2, 4)]
    assert graham_scan(points) == [(0, 0), (4, 0), (4, 4), (0, 4)]

    # all on one line: just the two ends
    assert graham_scan([(0, 0), (1, 1), (3, 3)]) == [(0, 0), (3, 3)]

    # the caller's list is not changed
    points = [(3, 1), (0, 0), (1, 2), (2, 5)]
    copy = list(points)
    graham_scan(points)
    assert points == copy, "graham_scan changed its input list"

    # graham_steps returns no visualization steps for fewer than three points.
    assert graham_steps([]) == []
    assert graham_steps([(0, 0), (1, 1)]) == []

    # A clockwise check pops an interior point; the final step closes the hull.
    points = [(0, 0), (2, 1), (1, 1), (0, 3)]
    copy = list(points)
    steps = graham_steps(points)
    assert points == copy, "graham_steps changed its input list"
    assert [step["title"] for step in steps[:2]] == ["Start point", "Sorted by angle"]
    assert steps[0]["points"]["start"] == (0, 0)
    assert any(step["title"] == "Check turn (2, 1) -> (1, 1) -> (0, 3)" for step in steps)
    assert any(step["title"] == "Popped (1, 1)" for step in steps)
    assert steps[-1]["title"] == "Done"
    assert steps[-1]["hull"] == [(0, 0), (2, 1), (0, 3), (0, 0)]

    # Collinear points produce only the two endpoints, with no scan steps.
    steps = graham_steps([(0, 0), (1, 1), (3, 3)])
    assert [step["title"] for step in steps] == ["Start point", "Sorted by angle", "Done"]
    assert steps[-1]["hull"] == [(0, 0), (3, 3), (0, 0)]

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
            a = hull[i]
            b = hull[(i + 1) % len(hull)]
            for r in points:
                assert cross(a, b, r) >= 0, f"{r} is right of {a} -> {b}, hull = {hull}"
        # same hull points as Jarvis (different start point, so compare as sets)
        assert set(hull) == set(jarvis_march(points)), f"graham {hull} vs jarvis {jarvis_march(points)}"

    
    print("All Graham scan tests passed.")