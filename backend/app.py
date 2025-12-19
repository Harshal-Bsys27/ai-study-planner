from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ==================================================
# SUBJECT + LEVEL SYLLABUS MAP
# ==================================================
SYLLABUS = {
    "DSA": {
        "Beginner": [
            ("Arrays Basics", 1.5),
            ("Time Complexity", 0.5),
            ("Simple Problems", 1.0),
        ],
        "Intermediate": [
            ("Sliding Window", 1.5),
            ("Binary Search", 1.0),
            ("Recursion", 1.0),
        ],
        "Advanced": [
            ("Dynamic Programming", 2.0),
            ("Graphs", 1.5),
            ("Optimization Techniques", 1.0),
        ],
    },
    "ML": {
        "Beginner": [
            ("What is ML?", 1.0),
            ("Supervised Learning", 1.5),
            ("Linear Regression", 1.0),
        ],
        "Intermediate": [
            ("Feature Engineering", 1.5),
            ("Classification Models", 1.5),
            ("Model Evaluation", 1.0),
        ],
        "Advanced": [
            ("Ensemble Methods", 2.0),
            ("Hyperparameter Tuning", 1.5),
            ("Model Deployment Basics", 1.0),
        ],
    },
    "Python": {
        "Beginner": [
            ("Syntax & Variables", 1.0),
            ("Loops & Conditions", 1.0),
            ("Functions", 1.0),
        ],
        "Intermediate": [
            ("OOP Concepts", 1.5),
            ("File Handling", 1.0),
            ("Modules & Packages", 1.0),
        ],
        "Advanced": [
            ("Decorators", 1.5),
            ("Generators", 1.0),
            ("Performance Optimization", 1.0),
        ],
    },
    "AI": {
        "Beginner": [
            ("AI Overview", 1.0),
            ("Search Algorithms", 1.5),
            ("Knowledge Representation", 1.0),
        ],
        "Intermediate": [
            ("Neural Networks", 1.5),
            ("Backpropagation", 1.5),
            ("Activation Functions", 1.0),
        ],
        "Advanced": [
            ("Deep Architectures", 2.0),
            ("Transformers Intro", 1.5),
            ("Ethics in AI", 1.0),
        ],
    },
}

# ==================================================
# HELPER FUNCTIONS
# ==================================================
def calculate_progress(subtopics):
    if not subtopics:
        return 0
    completed = sum(1 for s in subtopics if s["completed"])
    return round((completed / len(subtopics)) * 100)


def calculate_day_status(progress):
    if progress < 50:
        return "Behind"
    elif progress < 80:
        return "On Track"
    else:
        return "Ahead"


def smart_adjust_logic(day_data):
    """
    Core intelligence: adjusts hours based on
    progress + difficulty level
    """

    level = day_data["level"]
    subtopics = day_data["subtopics"]

    progress = calculate_progress(subtopics)

    for sub in subtopics:
        if not sub["completed"]:
            if level == "Beginner":
                sub["hours"] += 1 if progress < 50 else 0.5
            elif level == "Intermediate":
                sub["hours"] += 1.5 if progress < 60 else 0.5
            elif level == "Advanced":
                sub["hours"] += 2 if progress < 70 else 1

            sub["hours"] = round(sub["hours"], 1)

    return subtopics


# ==================================================
# API: GENERATE STUDY PLAN
# ==================================================
@app.route("/api/generate-plan", methods=["POST"])
def generate_plan():
    data = request.json

    subject = data.get("subject")
    level = data.get("level")
    days = int(data.get("days", 1))
    hours_per_day = float(data.get("hours", 2))

    if subject not in SYLLABUS:
        return jsonify({"error": "Invalid subject"}), 400

    topics = SYLLABUS[subject][level]
    plan = []

    for day in range(1, days + 1):
        subtopics = []
        total_hours = 0

        for topic, base_hours in topics:
            adjusted_hours = min(base_hours, hours_per_day / len(topics))
            total_hours += adjusted_hours

            subtopics.append({
                "name": topic,
                "hours": round(adjusted_hours, 1),
                "completed": False,
                "difficulty": level
            })

        plan.append({
            "day": day,
            "topic": subject,
            "level": level,
            "hours": round(total_hours, 1),
            "progress": 0,
            "status": "Behind",
            "subtopics": subtopics
        })

    return jsonify({"plan": plan})


# ==================================================
# API: SMART ADJUST (IMPORTANT)
# ==================================================
@app.route("/api/smart-adjust", methods=["POST"])
def smart_adjust():
    day_data = request.json

    updated_subtopics = smart_adjust_logic(day_data)
    progress = calculate_progress(updated_subtopics)
    status = calculate_day_status(progress)

    return jsonify({
        "subtopics": updated_subtopics,
        "progress": progress,
        "status": status
    })


# ==================================================
# HEALTH CHECK
# ==================================================
@app.route("/")
def home():
    return "AI Study Planner Backend Running Successfully 🚀"


# ==================================================
# RUN SERVER
# ==================================================
if __name__ == "__main__":
    app.run(debug=True)
