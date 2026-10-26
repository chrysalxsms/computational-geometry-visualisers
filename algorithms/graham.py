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

    for _ in range(300):
        points = random_points(random.randint(3, 30), -20, 20)
        hull = graham_scan(points)
        # no point lies to the right of any hull edge
        for i in range(len(hull)):
            a = hull[i]
            b = hull[(i + 1) % len(hull)]
            for r in points:
                assert cross(a, b, r) >= 0, f"{r} is right of {a} -> {b}, hull = {hull}"
        # same hull points as Jarvis (different start point, so compare as sets)
        assert set(hull) == set(jarvis_march(points)), f"graham {hull} vs jarvis {jarvis_march(points)}"

    print("All Graham scan tests passed.")
