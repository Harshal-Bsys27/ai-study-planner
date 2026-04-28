import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps
from dotenv import load_dotenv
from sqlalchemy import func, text

from models import db, User, StudyPlan, UserProgress, StudyNotes, StudySession, Flashcard, PomodoroSession, StudyStreak
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
    # AUTH DECORATORS
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

            current_user = User.query.get(current_user_id)
            if not current_user:
                return jsonify({"error": "User not found"}), 404
            if not current_user.is_active:
                return jsonify({"error": "Account disabled"}), 403

            return f(current_user_id, *args, **kwargs)
        return decorated

    def admin_required(f):
        """Decorator to require admin role"""
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

            current_user = User.query.get(current_user_id)
            if not current_user:
                return jsonify({"error": "User not found"}), 404
            if not current_user.is_active:
                return jsonify({"error": "Account disabled"}), 403
            if not current_user.is_admin:
                return jsonify({"error": "Admin access required"}), 403

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

            admin_emails = {
                e.strip().lower()
                for e in os.getenv('ADMIN_EMAILS', '').split(',')
                if e.strip()
            }
            admin_usernames = {
                u.strip().lower()
                for u in os.getenv('ADMIN_USERNAMES', '').split(',')
                if u.strip()
            }
            is_admin = email.lower() in admin_emails or username.lower() in admin_usernames

            user = User(username=username, email=email, is_admin=is_admin, is_active=True)
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
                "user": {
                    "id": user.id,
                    "username": username,
                    "email": email,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active
                }
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

            if not user.is_active:
                return jsonify({"error": "Account disabled"}), 403
            
            token = jwt.encode(
                {
                    "user_id": user.id,
                    "exp": datetime.utcnow() + timedelta(days=7),
                },
                app.config["SECRET_KEY"],
                algorithm="HS256"
            )
            
            return jsonify({
                "message": "Login successful",
                "token": token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active
                }
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
        """Get all user's plans"""
        try:
            plans = StudyPlan.query.filter_by(user_id=current_user_id).all()
            return jsonify([
                {
                    "id": p.id,
                    "subject": p.subject,
                    "level": p.level,
                    "days": p.days,
                    "hours_per_day": p.hours_per_day,
                    "completion_percentage": p.completion_percentage,
                    "created_at": p.created_at.isoformat()
                } for p in plans
            ]), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

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

    @app.route("/api/plans/<int:plan_id>", methods=["GET"])
    @token_required
    def get_plan(current_user_id, plan_id):
        """Get specific plan"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({"error": "Plan not found"}), 404

            return jsonify({
                "id": plan.id,
                "subject": plan.subject,
                "level": plan.level,
                "days": plan.days,
                "completion_percentage": plan.completion_percentage,
                "plan": plan.plan_data,
                "created_at": plan.created_at.isoformat()
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/plans/<int:plan_id>", methods=["DELETE"])
    @token_required
    def delete_plan(current_user_id, plan_id):
        """Delete a study plan"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({"error": "Plan not found"}), 404
            
            db.session.delete(plan)
            db.session.commit()
            
            return jsonify({"message": "Plan deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

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

    # ==================== STATS & ANALYTICS ENDPOINTS ====================
    
    @app.route("/api/stats/streak", methods=["GET"])
    @token_required
    def get_streak(current_user_id):
        """Get user's study streak"""
        try:
            streak = StudyStreak.query.filter_by(user_id=current_user_id).first()
            if not streak:
                streak = StudyStreak(user_id=current_user_id, current_streak=0, longest_streak=0)
                db.session.add(streak)
                db.session.commit()
            
            return jsonify({
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak,
                "last_studied": streak.last_study_date.isoformat() if streak.last_study_date else None
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/stats/streak/update", methods=["POST"])
    @token_required
    def update_streak(current_user_id):
        """Update user's study streak"""
        try:
            streak = StudyStreak.query.filter_by(user_id=current_user_id).first()
            if not streak:
                streak = StudyStreak(user_id=current_user_id, current_streak=1, longest_streak=1)
            else:
                streak.current_streak += 1
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
            
            streak.last_study_date = datetime.utcnow()
            db.session.add(streak)
            db.session.commit()
            
            return jsonify({
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/api/analytics/<int:plan_id>", methods=["GET"])
    @token_required
    def get_analytics(current_user_id, plan_id):
        """Get analytics for a plan"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({"error": "Plan not found"}), 404
            
            total_topics = sum(len(d["topics"]) for d in plan.plan_data)
            completed_topics = UserProgress.query.filter_by(
                plan_id=plan_id, completed=True
            ).count()
            
            sessions = StudySession.query.filter_by(plan_id=plan_id).all()
            total_hours = sum(s.duration for s in sessions) / 3600 if sessions else 0
            
            return jsonify({
                "completion_percentage": plan.completion_percentage,
                "total_sessions": len(sessions),
                "total_hours": round(total_hours, 2),
                "topics_completed": completed_topics,
                "total_topics": total_topics
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/pomodoro", methods=["POST"])
    @token_required
    def create_pomodoro(current_user_id):
        """Create a Pomodoro session"""
        try:
            data = request.json
            plan_id = data.get("plan_id")
            topic = data.get("topic", "Focus Session")
            
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({"error": "Plan not found"}), 404
            
            pomodoro = PomodoroSession(plan_id=plan_id, topic=topic)
            db.session.add(pomodoro)
            db.session.commit()
            
            return jsonify({
                "id": pomodoro.id,
                "plan_id": pomodoro.plan_id,
                "topic": pomodoro.topic
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/api/plans/<int:plan_id>/session", methods=["POST"])
    @token_required
    def create_study_session(current_user_id, plan_id):
        """Create a study session"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({"error": "Plan not found"}), 404
            
            data = request.json
            topic = data.get("topic", "Study Session")
            duration = data.get("duration", 0)
            
            session = StudySession(plan_id=plan_id, topic=topic, duration=duration)
            db.session.add(session)
            db.session.commit()
            
            return jsonify({
                "id": session.id,
                "plan_id": session.plan_id,
                "topic": session.topic,
                "duration": session.duration
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/api/plans/search", methods=["GET"])
    @token_required
    def search_plans(current_user_id):
        """Search user's plans"""
        try:
            subject = request.args.get("subject", "").lower()
            level = request.args.get("level", "").lower()
            min_days = request.args.get("min_days", 0, type=int)
            max_days = request.args.get("max_days", 365, type=int)
            
            query = StudyPlan.query.filter_by(user_id=current_user_id)
            
            results = []
            for plan in query.all():
                if subject and subject not in plan.subject.lower():
                    continue
                if level and level not in plan.level.lower():
                    continue
                if not (min_days <= plan.days <= max_days):
                    continue
                
                results.append({
                    "id": plan.id,
                    "subject": plan.subject,
                    "level": plan.level,
                    "days": plan.days,
                    "hours_per_day": plan.hours_per_day,
                    "completion_percentage": plan.completion_percentage
                })
            
            return jsonify({"plans": results}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # ===============================
    # ADMIN ENDPOINTS
    # ===============================
    def build_admin_stats():
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admin_users = User.query.filter_by(is_admin=True).count()

        total_plans = StudyPlan.query.count()
        avg_completion = db.session.query(func.avg(StudyPlan.completion_percentage)).scalar() or 0

        total_flashcards = Flashcard.query.count()
        total_sessions = StudySession.query.count()
        total_hours = (db.session.query(func.sum(StudySession.duration)).scalar() or 0) / 3600

        avg_current_streak = db.session.query(func.avg(StudyStreak.current_streak)).scalar() or 0
        max_longest_streak = db.session.query(func.max(StudyStreak.longest_streak)).scalar() or 0

        return {
            'total_users': total_users,
            'active_users': active_users,
            'admin_users': admin_users,
            'total_plans': total_plans,
            'average_completion': round(avg_completion, 2),
            'total_flashcards': total_flashcards,
            'total_sessions': total_sessions,
            'total_hours': round(total_hours, 2),
            'avg_current_streak': round(avg_current_streak, 2),
            'max_longest_streak': max_longest_streak or 0
        }

    @app.route('/api/admin/stats', methods=['GET'])
    @admin_required
    def admin_stats(current_admin_id):
        """Admin stats overview"""
        try:
            return jsonify(build_admin_stats()), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/admin/users', methods=['GET'])
    @admin_required
    def admin_users(current_admin_id):
        """Admin: list users"""
        try:
            users = User.query.order_by(User.created_at.desc()).all()
            results = []
            for u in users:
                plans_count = StudyPlan.query.filter_by(user_id=u.id).count()
                flashcards_count = db.session.query(func.count(Flashcard.id)) \
                    .join(StudyPlan, Flashcard.plan_id == StudyPlan.id) \
                    .filter(StudyPlan.user_id == u.id).scalar() or 0
                sessions_count = db.session.query(func.count(StudySession.id)) \
                    .join(StudyPlan, StudySession.plan_id == StudyPlan.id) \
                    .filter(StudyPlan.user_id == u.id).scalar() or 0
                total_hours = (db.session.query(func.sum(StudySession.duration)) \
                    .join(StudyPlan, StudySession.plan_id == StudyPlan.id) \
                    .filter(StudyPlan.user_id == u.id).scalar() or 0) / 3600
                streak = StudyStreak.query.filter_by(user_id=u.id).first()

                results.append({
                    'id': u.id,
                    'username': u.username,
                    'email': u.email,
                    'is_admin': u.is_admin,
                    'is_active': u.is_active,
                    'created_at': u.created_at.isoformat(),
                    'plans_count': plans_count,
                    'flashcards_count': int(flashcards_count),
                    'sessions_count': int(sessions_count),
                    'total_hours': round(total_hours, 2),
                    'current_streak': streak.current_streak if streak else 0,
                    'longest_streak': streak.longest_streak if streak else 0
                })

            return jsonify({'count': len(results), 'users': results}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/admin/users/<int:user_id>', methods=['PATCH'])
    @admin_required
    def admin_update_user(current_admin_id, user_id):
        """Admin: update user status"""
        try:
            if current_admin_id == user_id:
                data = request.json or {}
                if data.get('is_active') is False:
                    return jsonify({'error': 'Cannot disable your own account'}), 400

            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404

            data = request.json or {}
            if 'is_active' in data:
                user.is_active = bool(data.get('is_active'))
            if 'is_admin' in data:
                user.is_admin = bool(data.get('is_admin'))

            db.session.commit()
            return jsonify({
                'message': 'User updated',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_admin': user.is_admin,
                    'is_active': user.is_active
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
    @admin_required
    def admin_delete_user(current_admin_id, user_id):
        """Admin: delete user"""
        try:
            if current_admin_id == user_id:
                return jsonify({'error': 'Cannot delete your own account'}), 400

            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404

            db.session.delete(user)
            db.session.commit()

            return jsonify({'message': 'User deleted'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/admin/export', methods=['GET'])
    @admin_required
    def admin_export(current_admin_id):
        """Admin: export users and stats"""
        try:
            stats = build_admin_stats()
            users = User.query.order_by(User.created_at.desc()).all()
            export_users = [{
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'is_admin': u.is_admin,
                'is_active': u.is_active,
                'created_at': u.created_at.isoformat()
            } for u in users]

            return jsonify({
                'stats': stats,
                'users': export_users
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # ==================== FLASHCARD ENDPOINTS ====================
    
    @app.route('/api/flashcards', methods=['POST'])
    @token_required
    def create_flashcard(current_user_id):
        """Create a new flashcard"""
        try:
            data = request.json
            plan_id = data.get('plan_id')
            question = data.get('question')
            answer = data.get('answer')
            topic = data.get('topic')
            
            if not all([plan_id, question, answer, topic]):
                return jsonify({'error': 'Missing required fields'}), 400
            
            # Verify user owns the plan
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404
            
            flashcard = Flashcard(
                plan_id=plan_id,
                question=question,
                answer=answer,
                topic=topic
            )
            db.session.add(flashcard)
            db.session.commit()
            
            return jsonify({
                'id': flashcard.id,
                'plan_id': flashcard.plan_id,
                'question': flashcard.question,
                'answer': flashcard.answer,
                'topic': flashcard.topic,
                'created_at': flashcard.created_at.isoformat()
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/flashcards/<int:plan_id>', methods=['GET'])
    @token_required
    def get_flashcards(current_user_id, plan_id):
        """Get all flashcards for a plan"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404
            
            flashcards = Flashcard.query.filter_by(plan_id=plan_id).all()
            return jsonify({
                'flashcards': [{
                    'id': f.id,
                    'plan_id': f.plan_id,
                    'question': f.question,
                    'answer': f.answer,
                    'topic': f.topic,
                    'created_at': f.created_at.isoformat()
                } for f in flashcards]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/flashcards/<int:flashcard_id>', methods=['GET'])
    @token_required
    def get_flashcard(current_user_id, flashcard_id):
        """Get a specific flashcard"""
        try:
            flashcard = Flashcard.query.get(flashcard_id)
            if not flashcard:
                return jsonify({'error': 'Flashcard not found'}), 404
            
            # Verify user owns the plan
            plan = StudyPlan.query.filter_by(id=flashcard.plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Unauthorized'}), 403
            
            return jsonify({
                'id': flashcard.id,
                'plan_id': flashcard.plan_id,
                'question': flashcard.question,
                'answer': flashcard.answer,
                'topic': flashcard.topic,
                'created_at': flashcard.created_at.isoformat()
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/flashcards/<int:flashcard_id>', methods=['PUT'])
    @token_required
    def update_flashcard(current_user_id, flashcard_id):
        """Update a flashcard"""
        try:
            flashcard = Flashcard.query.get(flashcard_id)
            if not flashcard:
                return jsonify({'error': 'Flashcard not found'}), 404
            
            # Verify user owns the plan
            plan = StudyPlan.query.filter_by(id=flashcard.plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Unauthorized'}), 403
            
            data = request.json
            flashcard.question = data.get('question', flashcard.question)
            flashcard.answer = data.get('answer', flashcard.answer)
            flashcard.topic = data.get('topic', flashcard.topic)
            
            db.session.commit()
            
            return jsonify({
                'id': flashcard.id,
                'plan_id': flashcard.plan_id,
                'question': flashcard.question,
                'answer': flashcard.answer,
                'topic': flashcard.topic,
                'created_at': flashcard.created_at.isoformat()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/flashcards/<int:flashcard_id>', methods=['DELETE'])
    @token_required
    def delete_flashcard(current_user_id, flashcard_id):
        """Delete a flashcard"""
        try:
            flashcard = Flashcard.query.get(flashcard_id)
            if not flashcard:
                return jsonify({'error': 'Flashcard not found'}), 404
            
            # Verify user owns the plan
            plan = StudyPlan.query.filter_by(id=flashcard.plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Unauthorized'}), 403
            
            db.session.delete(flashcard)
            db.session.commit()
            
            return jsonify({'message': 'Flashcard deleted'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    return app


def ensure_user_columns(app):
    """Lightweight SQLite migration for new user columns."""
    with app.app_context():
        if db.engine.dialect.name != 'sqlite':
            return

        columns = [row[1] for row in db.session.execute(text("PRAGMA table_info(users)"))]
        if 'is_admin' not in columns:
            db.session.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
            db.session.execute(text("UPDATE users SET is_admin = 0 WHERE is_admin IS NULL"))
        if 'is_active' not in columns:
            db.session.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))
            db.session.execute(text("UPDATE users SET is_active = 1 WHERE is_active IS NULL"))

        db.session.commit()


def ensure_admin_user(app):
    """Ensure admin user exists with correct password in development mode"""
    with app.app_context():
        admin = User.query.filter_by(username='admin').first()
        
        if admin:
            # Update existing admin with correct password
            admin.set_password('admin123')
            admin.is_admin = True
            admin.is_active = True
            db.session.commit()
            print("✅ Admin user updated with correct password")
        else:
            # Create new admin user
            admin = User(
                username='admin',
                email='admin@example.com',
                is_admin=True,
                is_active=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created")


if __name__ == '__main__':
    env = os.getenv('FLASK_ENV', 'development')
    app = create_app()
    
    if env == "development":
        with app.app_context():
            db.create_all()
            ensure_user_columns(app)
            ensure_admin_user(app)

            print("\n" + "="*60)
            print("✅ AI Study Planner Backend Started")
            print("="*60)
            print(f"🌍 Environment: {env.upper()}")
            print(f"🗄️  Database: {'SQLite' if env == 'development' else 'PostgreSQL'}")
            print(f"🔗 API: http://localhost:5000/api")
            print(f"❤️  Health: http://localhost:5000/api/health")
            print("="*60 + "\n")
    
    app.run(debug=(env == 'development'), host='0.0.0.0', port=5000)
