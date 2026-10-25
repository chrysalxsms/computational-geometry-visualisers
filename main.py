import math
import random
import pygame
from shared.points import random_points


color_red = (255, 0, 0)  # Red color
color_black = (0, 0, 0)  # Black color
color_white = (255, 255, 255)  # White color
color_grey = (200, 200, 200)  # Grey color
radius = 5  # Radius of the circle

pygame.init()
screen = pygame.display.set_mode((800, 600))
running = True
clock = pygame.time.Clock()
origin = screen.get_rect().center  # Center of the screen (maths (0,0))
scale = 40
font = pygame.font.Font(None, 18)


def conversion(p):
    p_x, p_y = p
    return (origin[0] + p_x * scale, origin[1] - p_y * scale)

def draw_line(a, b):
    pygame.draw.line(screen, color_black, conversion(a), conversion(b), 2)

points = random_points(random.randint(5, 15), -7, 7)  # Generate random points

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN and event.key == pygame.K_c:
            points = []
        if event.type == pygame.KEYDOWN and event.key == pygame.K_r:
            points = random_points(random.randint(5, 15), -7, 7)  # Generate random points
    screen.fill(color_white)

    # screen edges in maths coordinates (inverse of conversion)
    x_min = -origin[0] / scale
    x_max = (screen.get_width() - origin[0]) / scale
    y_max = origin[1] / scale
    y_min = (origin[1] - screen.get_height()) / scale

    # draw grid lines
    for x in range(math.ceil(x_min), math.floor(x_max) + 1):
        conversion_point = conversion((x, 0))
        pygame.draw.line(screen, color_grey, (conversion_point[0], 0), (conversion_point[0], screen.get_height()), 1)
        text_surface = font.render(str(x), True, color_black)
        screen.blit(text_surface, (conversion_point[0] + 2, origin[1] + 2)) # + 2 not - because -y is inverted in pygame
    for y in range(math.ceil(y_min), math.floor(y_max) + 1):
        conversion_point = conversion((0, y))
        pygame.draw.line(screen, color_grey, (0, conversion_point[1]), (screen.get_width(), conversion_point[1]), 1)
        text_surface = font.render(str(y), True, color_black)
        screen.blit(text_surface, (origin[0] + 2, conversion_point[1] + 2)) # + 2 not - because -y is inverted in pygame

    draw_line((x_min, 0), (x_max, 0))  # x-axis
    draw_line((0, y_min), (0, y_max))  # y-axis

    for point in points:
        pygame.draw.circle(screen, color_red, conversion(point), radius)
    pygame.display.flip()
    clock.tick(60)
pygame.quit()