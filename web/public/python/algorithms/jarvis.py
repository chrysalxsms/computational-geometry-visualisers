import random
from shared.geometry import cross
from shared.points import random_points


def dist(p, q):
    return (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2

# Orientation of the triple (p, q, r):
#   > 0  : r is left of p->q   (counterclockwise)
#   < 0  : r is right of p->q  (clockwise)
#   = 0  : collinear

def jarvis_march(P):
    n = len(P)
    if n < 3:
        return P

    # 1. start point: smallest x, smallest y on a tie
    p0 = min(P, key=lambda p: (p[0], p[1]))
    hull = []
    p = p0

    while True:
        hull.append(p)

        # 2. candidate for the next point: any point != p
        q = P[0]
        if q == p:
            q = P[1]

        # 3. find the "rightmost" point as seen from p
        for r in P:
            o = cross(p, q, r)
            if o < 0:       # r is right of p->q
                q = r       # r is a better candidate
            elif o == 0 and dist(p, r) > dist(p, q):
                q = r       # collinear: take the farthest point
        
        p = q

        if p == p0:
            break

    return hull

def jarvis_steps(P):
    n = len(P)
    if n < 3:
        return []

    # 1. start point: smallest x, smallest y on a tie
    p0 = min(P, key=lambda p: (p[0], p[1]))
    hull = []
    steps = []
    p = p0

    while True:
        hull.append(p)

        # 2. candidate for the next point: any point != p
        q = P[0]
        if q == p:
            q = P[1]

        # 3. find the "rightmost" point as seen from p
        for r in P:
            if r == p or r == q:
                continue    # comparing with itself is always collinear: no step needed
            o = cross(p, q, r)
            new_q = q
            if o < 0:       # r is right of p->q
                text = f"cross = {o} < 0: {r} is RIGHT of current -> candidate, so it becomes the new candidate."
                new_q = r       # r is a better candidate
            elif o == 0 and dist(p, r) > dist(p, q):
                text = f"cross = {o} == 0: {r} is collinear and farther than current -> candidate, so it becomes the new candidate."
                new_q = r       # collinear: take the farthest point
            elif o > 0:
                text = f"cross = {o} > 0: {r} is LEFT of current -> candidate, so it is ignored."
            else:
                text = f"cross = {o} == 0: {r} is collinear but not farther than current -> candidate, so it is ignored."
            steps.append({
                "title": f"Testing {r}",
                "hull": hull.copy(),
                "points": {"current": p, "candidate": q, "testing": r},
                "lines": [(p, q, "candidate"), (p, r, "testing")],
                "text": text
            })
            q = new_q

        # 4. conclusion of the scan: q survived every test
        if q == p0:
            text = f"No point is right of {p} -> {q}, and {q} is the start point, so the hull is closed."
        else:
            text = f"No point is right of {p} -> {q}, so {q} is the next hull point."
        steps.append({
            "title": f"Next hull point: {q}",
            "hull": hull.copy(),
            "points": {"current": p, "candidate": q},
            "lines": [(p, q, "candidate")],
            "text": text
        })

        p = q

        if p == p0:
            break

    # 5. done: only the finished hull, closed by repeating the start point
    steps.append({
        "title": "Done",
        "hull": hull + [hull[0]],
        "points": {},
        "lines": [],
        "text": f"Convex hull complete: {len(hull)} points, found counterclockwise from {hull[0]}."
    })

    return steps


if __name__ == "__main__":
    # square with a point inside
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]
    hull = jarvis_march(points)
    assert hull == [(0, 0), (4, 0), (4, 4), (0, 4)]
    for step in jarvis_steps([(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)])[:6]:
        print(step["title"], "|", step["text"])

    # points on an edge
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 0)]
    hull = jarvis_march(points)
    assert hull == [(0, 0), (4, 0), (4, 4), (0, 4)]

    for _ in range(100):
        points = random_points(random.randint(3, 30), -20, 20)
        hull = jarvis_march(points)
        for i in range(len(hull)):
            a = hull[i]
            b = hull[(i + 1) % len(hull)]
            for r in points:
                assert cross(a, b, r) >= 0, f"{r} is right of {a} -> {b}, hull = {hull}"

        # the steps must end with the same hull as jarvis_march, closed
        steps = jarvis_steps(points)
        assert steps[-1]["hull"] == hull + [hull[0]], f"steps end with {steps[-1]['hull']}, expected {hull}"
        # the done step shows only the hull: no candidates or tested points left
        assert steps[-1]["points"] == {} and steps[-1]["lines"] == [], "done step still has roles"
        # snapshot check: the first step only knows the start point
        assert steps[0]["hull"] == [hull[0]], f"first step hull is {steps[0]['hull']}"
        # one "next hull point" step per hull point
        assert sum(s["title"].startswith("Next hull point") for s in steps) == len(hull)
        # skip check: no step tests the current point or the candidate itself
        for step in steps:
            roles = step["points"]
            if "testing" in roles:
                assert roles["testing"] not in (roles["current"], roles["candidate"]), step["title"]