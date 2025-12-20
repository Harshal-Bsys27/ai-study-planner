import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps
from dotenv import load_dotenv

from models import db, User, StudyPlan, UserProgress, StudyNotes, StudySession
from config import get_config

load_dotenv()


def create_app():
    app = Flask(__name__)

    env = os.getenv("FLASK_ENV", "production")
    app.config.from_object(get_config(env))

    # -------------------------------
    # INIT EXTENSIONS
    # -------------------------------
    db.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Authorization", "Content-Type"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # ===============================
    # AUTH DECORATOR
    # ===============================
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get("Authorization")

            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Token missing"}), 401

            token = auth_header.split(" ")[1]

            try:
                data = jwt.decode(
                    token,
                    app.config["SECRET_KEY"],
                    algorithms=["HS256"]
                )
                current_user_id = data["user_id"]
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except Exception:
                return jsonify({"error": "Invalid token"}), 401

            return f(current_user_id, *args, **kwargs)

        return decorated

    # ===============================
    # AUTH ROUTES
    # ===============================
    @app.route("/api/register", methods=["POST"])
    def register():
        try:
            data = request.json or {}
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            if not username or not email or not password:
                return jsonify({"error": "Missing fields"}), 400

            if User.query.filter_by(username=username).first():
                return jsonify({"error": "Username already exists"}), 400

            if User.query.filter_by(email=email).first():
                return jsonify({"error": "Email already exists"}), 400

            user = User(username=username, email=email)
            user.set_password(password)

            db.session.add(user)
            db.session.commit()

            token = jwt.encode(
                {
                    "user_id": user.id,
                    "exp": datetime.utcnow() + timedelta(days=7),
                },
                app.config["SECRET_KEY"],
                algorithm="HS256",
            )

            return jsonify({
                "message": "User created successfully",
                "token": token,
                "user": {"id": user.id, "username": user.username}
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/api/login", methods=["POST"])
    def login():
        try:
            data = request.json or {}
            username = data.get("username")
            password = data.get("password")

            user = User.query.filter_by(username=username).first()
            if not user or not user.check_password(password):
                return jsonify({"error": "Invalid credentials"}), 401

            token = jwt.encode(
                {
                    "user_id": user.id,
                    "exp": datetime.utcnow() + timedelta(days=7),
                },
                app.config["SECRET_KEY"],
                algorithm="HS256",
            )

            return jsonify({
                "message": "Login successful",
                "token": token,
                "user": {"id": user.id, "username": user.username}
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # ===============================
    # HEALTH CHECK
    # ===============================
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "message": "Backend is running"}), 200

    # ===============================
    # PLAN ROUTES
    # ===============================
    @app.route("/api/plans", methods=["GET"])
    @token_required
    def get_plans(current_user_id):
        plans = StudyPlan.query.filter_by(user_id=current_user_id).all()
        return jsonify([
            {
                "id": p.id,
                "subject": p.subject,
                "level": p.level,
                "days": p.days,
                "hours_per_day": p.hours_per_day,
                "completion_percentage": p.completion_percentage,
                "created_at": p.created_at.isoformat(),
            }
            for p in plans
        ]), 200

    @app.route("/api/generate-plan", methods=["POST"])
    @token_required
    def generate_plan(current_user_id):
        try:
            data = request.json or {}

            subject = data.get("subject", "DSA")
            days = int(data.get("days", 7))
            hours = float(data.get("hours", 2))
            level = data.get("level", "Beginner")

            plan_data = [
                {
                    "day": i,
                    "topics": [
                        {"name": f"Topic {j}", "completed": False, "hours": hours}
                        for j in range(1, 3)
                    ],
                }
                for i in range(1, days + 1)
            ]

            plan = StudyPlan(
                user_id=current_user_id,
                subject=subject,
                level=level,
                days=days,
                hours_per_day=hours,
                plan_data=plan_data,
                completion_percentage=0,
            )

            db.session.add(plan)
            db.session.commit()

            return jsonify({
                "id": plan.id,
                "subject": subject,
                "level": level,
                "days": days,
                "plan": plan_data,
                "total_hours": days * hours,
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    # ===============================
    # PROGRESS / NOTES / SESSION / STATS
    # (UNCHANGED LOGIC, SAFE)
    # ===============================
    @app.route("/api/plans/<int:plan_id>/progress", methods=["POST"])
    @token_required
    def update_progress(current_user_id, plan_id):
        try:
            plan = StudyPlan.query.filter_by(
                id=plan_id, user_id=current_user_id
            ).first()

            if not plan:
                return jsonify({"error": "Plan not found"}), 404

            data = request.json or {}

            progress = UserProgress(
                plan_id=plan_id,
                day=data.get("day"),
                topic=data.get("topic"),
                completed=data.get("completed", False),
                time_spent=data.get("time_spent", 0),
            )

            db.session.add(progress)

            total_topics = sum(len(d["topics"]) for d in plan.plan_data)
            completed_topics = UserProgress.query.filter_by(
                plan_id=plan_id, completed=True
            ).count()

            plan.completion_percentage = (
                completed_topics / total_topics * 100
                if total_topics > 0
                else 0
            )

            db.session.commit()

            return jsonify({
                "message": "Progress updated",
                "completion_percentage": plan.completion_percentage,
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    return app


# ===============================
# SINGLE APP INSTANCE (IMPORTANT)
# ===============================
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)
