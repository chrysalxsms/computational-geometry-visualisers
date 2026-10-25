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


if __name__ == "__main__":
    # square with a point inside
    points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]
    hull = jarvis_march(points)
    assert hull == [(0, 0), (4, 0), (4, 4), (0, 4)]

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