import random

def random_points(n, low, high):
    if n > (high - low + 1) ** 2:
        raise ValueError("Cannot generate more unique points than the available range.")
    points = set()
    while len(points) < n:
        p = (random.randint(low, high), random.randint(low, high))
        points.add(p)
    return list(points)

if __name__ == "__main__":
    n = 10
    low = 0
    high = 100
    points = random_points(n, low, high)
    assert(len(points) == n)
    assert(len(points) == len(set(points)))  # Ensure all points are unique
    for p in points:
        px, py = p
        assert(low <= px <= high)
        assert(low <= py <= high)

    # boundary: 0..10 has exactly 11 * 11 = 121 grid positions
    full_grid = random_points(121, 0, 10)  # exactly full: must work
    assert len(full_grid) == 121
    assert len(set(full_grid)) == 121      # every grid position, no duplicates
    try:
        random_points(122, 0, 10)  # This should raise an error
        assert False, "Expected ValueError for too many points"
    except ValueError as e:
        print("Caught expected exception:", e)