import pytest

from shared.points import random_points


def test_points_are_unique_and_in_range():
    points = random_points(10, 0, 100)
    assert len(points) == 10
    assert len(set(points)) == 10
    for x, y in points:
        assert 0 <= x <= 100
        assert 0 <= y <= 100


def test_can_fill_the_whole_grid():
    # 0..10 has exactly 11 * 11 = 121 grid positions
    points = random_points(121, 0, 10)
    assert len(set(points)) == 121


def test_more_points_than_grid_positions_raises():
    with pytest.raises(ValueError):
        random_points(122, 0, 10)
