"""
Future ML Logic:
- Predict required study hours
- Adjust difficulty dynamically
- Detect ahead / on-track / behind
"""

def predict_study_hours(level, available_hours):
    if level == "Beginner":
        return min(available_hours, 2)
    elif level == "Intermediate":
        return min(available_hours, 3)
    else:
        return min(available_hours, 4)
