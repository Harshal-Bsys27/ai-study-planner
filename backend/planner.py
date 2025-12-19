def generate_study_plan(subject, days, hours, level):
    plan = []

    base_topics = {
        "DSA": ["Arrays", "Linked List", "Stacks"],
        "ML": ["Linear Regression", "Classification", "Clustering"],
        "Python": ["Basics", "OOP", "Libraries"],
        "AI": ["Search", "Knowledge", "Planning"],
    }

    topics = base_topics.get(subject, ["Topic A", "Topic B", "Topic C"])

    for day in range(1, days + 1):
        subtopics = []
        for t in topics:
            subtopics.append({
                "name": t,
                "hours": hours,
                "completed": False
            })

        plan.append({
            "day": day,
            "topic": subject,
            "hours": hours,
            "level": level,
            "subtopics": subtopics
        })

    return plan
