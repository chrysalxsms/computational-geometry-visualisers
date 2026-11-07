import heapq
from collections import Counter

# sweep line algorithm for Manhattan skyline
def manhattan_skyline_plane_sweep(rectangles):
    """
    Computes the Manhattan skyline of a set of rectangles.

    Returns:
        int: The area of the Manhattan skyline.
    """
    if not rectangles:
        return 0

    events = []
    for (left, right, height) in rectangles:
        events.append((left, 'START', height, right))
        events.append((right, 'END', 0, 0))

    events.sort(key=lambda event: event[0])

    heap = []
    area = 0
    prev_x = events[0][0]
    current_height = 0

    for event in events:
        x = event[0]
        area = area + current_height * (x - prev_x)
        if event[1] == 'START':
            heapq.heappush(heap, (-event[2], event[3]))  # Push (-height, right) onto the heap
        while heap and heap[0][1] <= x:
            heapq.heappop(heap)
        if not heap:
            current_height = 0
        else:
            current_height = -heap[0][0]
        prev_x = x

    return area


def active_buildings(heap, x):
    """The heap's entries (-height, right, left) as rectangles (left, right, height). 
    The function leaves out buildings that have already ended (right <= x), but are still in the heap because of lazy deletion."""
    return [(left, right, -neg_height) for (neg_height, right, left) in heap if right > x]


def manhattan_skyline_steps(rectangles):
    """
    Computes the steps of the  Manhattan skyline algorithm.

    Returns:
        list of step dicts.
    """
    if not rectangles:
        return []

    events = []
    for (left, right, height) in rectangles:
        events.append((left, 'START', height, right))
        events.append((right, 'END', height, left))   # END also carries the building, for the step text

    # same x: START before END (no dip to 0 where buildings touch), and the tallest START first,
    # so the skyline changes at most once per x
    events.sort(key=lambda event: (event[0], 0 if event[1] == 'START' else 1, -event[2]))

    heap = []
    in_heap = Counter()  # copies of each entry still in the heap, so checking is O(1) instead of a scan
    steps = []
    skyline = []
    area = 0
    prev_x = events[0][0]
    current_height = 0
    steps.append({
        "title": "Events sorted",
        "text": f"Sort the {len(events)} building edges by x; the sweep line visits them from left to right.",
        "events": 0,
        "sweep": events[0][0],
        "skyline": list(skyline),
        "active": [],
        "area": area,
    })

    for i, event in enumerate(events):
        x = event[0]
        area = area + current_height * (x - prev_x)
        if event[1] == 'START':
            entry = (-event[2], event[3], event[0])
            heapq.heappush(heap, entry)
            in_heap[entry] += 1
            steps.append({
                    "title": "Push building onto heap",
                    "text": f"Building ({event[0]}, {event[3]}) with height {event[2]} starts at x = {x}, so it is pushed onto the max-heap of active buildings.",
                    "events": i + 1,
                    "sweep": x,
                    "skyline": list(skyline),
                    "active": active_buildings(heap, x),
                    "area": area,
                })
        while heap and heap[0][1] <= x:
            popped = heapq.heappop(heap)
            in_heap[popped] -= 1
            if popped[1] == x:
                reason = f"it ends at x = {x}"
            else:
                reason = (f"it ended at x = {popped[1]}, but stayed in the heap underneath a taller building; "
                        f"it is only removed now that it has reached the top (lazy deletion)")
            steps.append({
                    "title": "Pop building from heap",
                    "text": f"Building ({popped[2]}, {popped[1]}) with height {-popped[0]} is removed from the heap: {reason}.",
                    "events": i + 1,
                    "sweep": x,
                    "skyline": list(skyline),
                    "active": active_buildings(heap, x),
                    "area": area,
                })
        # the building that ends here was not popped: a taller building is above it in the heap
        if event[1] == 'END' and in_heap[(-event[2], x, event[3])] > 0:
            steps.append({
                    "title": "Building ends underneath",
                    "text": f"Building ({event[3]}, {x}) with height {event[2]} ends at x = {x}, but it is not on top of the heap, "
                            f"so the skyline does not change. It stays in the heap until it reaches the top.",
                    "events": i + 1,
                    "sweep": x,
                    "skyline": list(skyline),
                    "active": active_buildings(heap, x),
                    "area": area,
                })
        old_height = current_height
        if not heap:
            current_height = 0
            if old_height != current_height:
                skyline.extend([(x, old_height), (x, current_height)])
                steps.append({
                    "title": "Update skyline",
                    "text": f"The heap is empty, so no building is active: the skyline drops from {old_height} to 0 at x = {x}.",
                    "events": i + 1,
                    "sweep": x,
                    "skyline": list(skyline),
                    "active": active_buildings(heap, x),
                    "area": area,
                })
        else:
            current_height = -heap[0][0]
            if old_height != current_height:
                skyline.extend([(x, old_height), (x, current_height)])
                steps.append({
                    "title": "Update skyline",
                    "text": f"The tallest active building is now ({heap[0][2]}, {heap[0][1]}) with height {current_height}, "
                            f"on top of the heap, so the skyline steps from {old_height} to {current_height} at x = {x}.",
                    "events": i + 1,
                    "sweep": x,
                    "skyline": list(skyline),
                    "active": active_buildings(heap, x),
                    "area": area,
                })
        prev_x = x
    steps.append({
        "title": "Done",
        "text": f"All {len(events)} events are processed. The area under the skyline is {area}.",
        "events": len(events),
        "sweep": x,
        "skyline": list(skyline),
        "active": active_buildings(heap, x),
        "area": area,
    })
    return steps
