def cross(a, b, c):     # each argument is an (x,y) tuple
    # unpack the tuples into x and y coordinates
    x_a, y_a = a
    x_b, y_b = b
    x_c, y_c = c
    # calculate the cross product
    return (x_b - x_a) * (y_c - y_a) - (y_b - y_a) * (x_c - x_a)
