import random

def random_points(n, low, high):
    if n > (high - low + 1) ** 2:
        raise ValueError("Cannot generate more unique points than the available range.")
    points = set()
    while len(points) < n:
        p = (random.randint(low, high), random.randint(low, high))
        points.add(p)
    return list(points)
