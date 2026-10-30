import math
import random
import pygame
from shared.points import random_points
from algorithms.registry import ALGORITHMS


color_red = (255, 0, 0)  # Red color
color_black = (0, 0, 0)  # Black color
color_white = (255, 255, 255)  # White color
color_grey = (200, 200, 200)  # Grey color
radius = 5  # Radius of the circle

ROLE_COLOURS = {
    "start": (255, 20, 147),  # pink
    "prev": (128, 0, 128),    # purple
    "current": (0, 255, 0),   # green
    "candidate": (0, 0, 255), # blue
    "testing": (255, 165, 0), # orange
    "top": (0, 255, 255),     # cyan
    "popped": (0, 0, 0)       # black
}

pygame.init()
PANEL_HEIGHT = 70  # strip at the top for text, so it never covers the plot
screen = pygame.display.set_mode((800, 600 + PANEL_HEIGHT))
running = True
clock = pygame.time.Clock()
origin = (400, PANEL_HEIGHT + 300)  # centre of the plot area below the panel (maths (0,0))
scale = 40
font = pygame.font.Font(None, 18)


def conversion(p):
    p_x, p_y = p
    return (origin[0] + p_x * scale, origin[1] - p_y * scale)

def draw_line(a, b, colour):
    pygame.draw.line(screen, colour, conversion(a), conversion(b), 2)

def load_points(new_points):
    """New points always come with their own steps and a reset index, so the three never get out of sync."""
    return new_points, ALGORITHMS[algorithm_name](new_points), 0

def draw_text_panel(lines):
    """Text lines in the strip above the plot (covers the grid there, so it stays readable)."""
    pygame.draw.rect(screen, color_white, (0, 0, screen.get_width(), PANEL_HEIGHT))
    pygame.draw.line(screen, color_black, (0, PANEL_HEIGHT), (screen.get_width(), PANEL_HEIGHT), 1)
    y = 8
    for line in lines:
        surface = font.render(line, True, color_black)
        screen.blit(surface, (12, y))
        y += surface.get_height() + 6

algorithm_name = "Jarvis march"
points, steps, index = load_points(random_points(random.randint(5, 15), -7, 7))

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN and event.key == pygame.K_c:
            points, steps, index = load_points([])
        if event.type == pygame.KEYDOWN and event.key == pygame.K_RIGHT:
            if index < len(steps) - 1:
                index += 1
        if event.type == pygame.KEYDOWN and event.key == pygame.K_LEFT:
            if index > 0:
                index -= 1
        if event.type == pygame.KEYDOWN and event.key == pygame.K_r:
            points, steps, index = load_points(random_points(random.randint(5, 15), -7, 7))
        if event.type == pygame.KEYDOWN and event.key == pygame.K_g:
            algorithm_names = list(ALGORITHMS)
            current_index = algorithm_names.index(algorithm_name)
            algorithm_name = algorithm_names[(current_index + 1) % len(algorithm_names)]
            points, steps, index = load_points(points)
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

    draw_line((x_min, 0), (x_max, 0), color_black)  # x-axis
    draw_line((0, y_min), (0, y_max), color_black)  # y-axis

    for point in points:
        pygame.draw.circle(screen, color_red, conversion(point), radius)

    if steps:   # nothing to draw after C
        step = steps[index]

        # Draw the traversal path before the hull and role lines.
        path = step.get("path", [])
        for i in range(len(path) - 1):
            draw_line(path[i], path[i + 1], (120, 120, 120))
        
        # a) the hull so far: neighbouring points joined, no wrap-around (not closed yet)
        for i in range(len(step["hull"]) - 1):
            draw_line(step["hull"][i], step["hull"][i + 1], color_black)

        # b) the step's lines, each in its role's colour
        for a, b, role in step["lines"]:
            draw_line(a, b, ROLE_COLOURS[role])

        # c) the step's points, slightly bigger, on top of everything
        for role, point in step["points"].items():
            pygame.draw.circle(screen, ROLE_COLOURS[role], conversion(point), radius + 2)

        # d) text: algorithm, progress, what this step is, and its conclusion
        draw_text_panel([
            algorithm_name,
            f"Step {index + 1} / {len(steps)}:  {step['title']}",
            step["text"],
        ])

        # Draw labels last so they remain visible over the points and paths.
        for point, label in step.get("labels", {}).items():
            label_surface = font.render(str(label), True, color_black)
            point_x, point_y = conversion(point)
            screen.blit(label_surface, (point_x + radius + 3, point_y - label_surface.get_height() - 3))
        
    else:
        draw_text_panel([algorithm_name, "No points: press R for a random set."])

    pygame.display.flip()
    clock.tick(60)
pygame.quit()