# backend/ml/smart_adjust.py

def smart_adjust(day_data):
    """
    day_data example:
    {
      "subtopics": [
        {"name": "Arrays", "completed": true, "hours": 2},
        {"name": "Strings", "completed": false, "hours": 2}
      ]
    }
    """

    subtopics = day_data["subtopics"]
    total = len(subtopics)
    completed = sum(1 for s in subtopics if s["completed"])
    progress = (completed / total) * 100

    adjusted = []

    for sub in subtopics:
        if sub["completed"]:
            adjusted.append(sub)
            continue

        hours = sub["hours"]

        if progress < 50:
            hours += 1        # behind
        elif progress < 80:
            hours += 0.5      # on track
        else:
            hours = max(0.5, hours - 0.5)  # ahead

        adjusted.append({**sub, "hours": hours})

    return {
        "progress": round(progress),
        "subtopics": adjusted
    }
