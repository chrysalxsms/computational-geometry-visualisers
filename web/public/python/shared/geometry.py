def cross(a, b, c):     # each argument is an (x,y) tuple
    # unpack the tuples into x and y coordinates
    x_a, y_a = a
    x_b, y_b = b
    x_c, y_c = c
    # calculate the cross product
    return (x_b - x_a) * (y_c - y_a) - (y_b - y_a) * (x_c - x_a)

if __name__ == "__main__":      # three test cases
    # right-turn case
    a = (0, 0)
    b = (1, 1)
    c = (2, 0)
    assert(cross(a, b, c) == -2)  # Output: -2
    assert(cross(a, c, b) == 2)  # Output: 2

    # left-turn case
    a = (0, 0)
    b = (4, 0)
    c = (4, 3)
    assert(cross(a, b, c) == 12)  # Output: 12
    assert(cross(a, c, b) == -12)  # Output: -12

    # collinear case
    a = (0, 0)
    b = (2, 2)
    c = (3, 3)
    assert(cross(a, b, c) == 0)  # Output: 0
    assert(cross(a, c, b) == 0)  # Output: 0