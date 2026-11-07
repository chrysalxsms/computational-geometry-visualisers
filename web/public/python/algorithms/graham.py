import math

from shared.geometry import cross


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
