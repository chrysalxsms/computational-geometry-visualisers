import pygame

color = (255, 0, 0)  # Red color
radius = 5  # Radius of the circle

pygame.init()
screen = pygame.display.set_mode((800, 600))
running = True
clock = pygame.time.Clock()
points = []

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.MOUSEBUTTONDOWN:
            points.append(event.pos)
        if event.type == pygame.KEYDOWN and event.key == pygame.K_c:
            points = []
    screen.fill((255, 255, 255))
    for point in points:
        pygame.draw.circle(screen, color, point, radius)
    pygame.display.flip()
    clock.tick(60)
pygame.quit()