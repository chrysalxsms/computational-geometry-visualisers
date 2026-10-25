from algorithms.jarvis import jarvis_steps

# registry: display name -> function that takes points and returns steps
# (Graham scan and Chan's algorithm get added here; the UI reads this dictionary)
ALGORITHMS = {
    "Jarvis march": jarvis_steps,
}
