from shared.geometry import cross


def test_right_turn_is_negative():
    assert cross((0, 0), (1, 1), (2, 0)) == -2
    assert cross((0, 0), (2, 0), (1, 1)) == 2


def test_left_turn_is_positive():
    assert cross((0, 0), (4, 0), (4, 3)) == 12
    assert cross((0, 0), (4, 3), (4, 0)) == -12


def test_collinear_is_zero():
    assert cross((0, 0), (2, 2), (3, 3)) == 0
    assert cross((0, 0), (3, 3), (2, 2)) == 0
