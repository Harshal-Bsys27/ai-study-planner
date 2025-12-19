from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
import jwt
from functools import wraps
from dotenv import load_dotenv
from models import db, User, StudyPlan, UserProgress, StudyNotes, StudySession
from config import Config

load_dotenv()

def create_app():
    """Create and configure Flask app"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    CORS(app, origins="*")

    # ===============================
    # AUTH DECORATOR
    # ===============================
    def token_required(f):
        """Decorator to require JWT token"""
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'error': 'Token missing'}), 401
            
            try:
                token = token.split(' ')[1]
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                current_user_id = data['user_id']
            except:
                return jsonify({'error': 'Invalid token'}), 401
            
            return f(current_user_id, *args, **kwargs)
        return decorated

    # ===============================
    # AUTH ENDPOINTS
    # ===============================
    
    @app.route('/api/register', methods=['POST'])
    def register():
        """Register new user"""
        try:
            data = request.json
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if not username or not email or not password:
                return jsonify({'error': 'Missing fields'}), 400
            
            if User.query.filter_by(username=username).first():
                return jsonify({'error': 'Username already exists'}), 400
            
            if User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already exists'}), 400
            
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
            token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'User created successfully',
                'token': token,
                'user': {'id': user.id, 'username': username}
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/login', methods=['POST'])
    def login():
        """Login user"""
        try:
            data = request.json
            username = data.get('username')
            password = data.get('password')
            
            user = User.query.filter_by(username=username).first()
            if not user or not user.check_password(password):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': {'id': user.id, 'username': username}
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # ===============================
    # PLAN ENDPOINTS
    # ===============================

    @app.route('/api/health', methods=['GET'])
    def health():
        """Health check"""
        return jsonify({'status': 'healthy', 'message': 'Backend is running'}), 200

    @app.route('/api/plans', methods=['GET'])
    @token_required
    def get_plans(current_user_id):
        """Get all user's plans"""
        try:
            plans = StudyPlan.query.filter_by(user_id=current_user_id).all()
            return jsonify([{
                'id': p.id,
                'subject': p.subject,
                'level': p.level,
                'days': p.days,
                'hours_per_day': p.hours_per_day,
                'completion_percentage': p.completion_percentage,
                'created_at': p.created_at.isoformat()
            } for p in plans]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/generate-plan', methods=['POST'])
    @token_required
    def generate_plan(current_user_id):
        """Generate a new study plan"""
        try:
            data = request.json
            subject = data.get('subject', 'DSA')
            days = int(data.get('days', 7))
            hours = float(data.get('hours', 2))
            level = data.get('level', 'Beginner')

            plan_data = create_simple_plan(subject, days, hours, level)

            new_plan = StudyPlan(
                user_id=current_user_id,
                subject=subject,
                level=level,
                days=days,
                hours_per_day=hours,
                plan_data=plan_data,
                completion_percentage=0
            )
            db.session.add(new_plan)
            db.session.commit()

            return jsonify({
                'id': new_plan.id,
                'subject': subject,
                'level': level,
                'days': days,
                'hours_per_day': hours,
                'plan': plan_data,
                'total_hours': days * hours
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/plans/<int:plan_id>', methods=['GET'])
    @token_required
    def get_plan(current_user_id, plan_id):
        """Get specific study plan"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404

            return jsonify({
                'id': plan.id,
                'subject': plan.subject,
                'level': plan.level,
                'days': plan.days,
                'hours_per_day': plan.hours_per_day,
                'completion_percentage': plan.completion_percentage,
                'plan': plan.plan_data,
                'created_at': plan.created_at.isoformat()
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/plans/<int:plan_id>/progress', methods=['POST'])
    @token_required
    def update_progress(current_user_id, plan_id):
        """Update topic progress"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404

            data = request.json
            progress = UserProgress(
                plan_id=plan_id,
                day=data.get('day'),
                topic=data.get('topic'),
                completed=data.get('completed', False),
                time_spent=data.get('time_spent', 0)
            )
            db.session.add(progress)

            total_topics = sum(len(day['topics']) for day in plan.plan_data)
            completed_topics = UserProgress.query.filter_by(plan_id=plan_id, completed=True).count()
            
            plan.completion_percentage = (completed_topics / total_topics * 100) if total_topics > 0 else 0
            db.session.commit()

            return jsonify({
                'message': 'Progress updated',
                'completion_percentage': plan.completion_percentage
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/plans/<int:plan_id>/notes', methods=['POST'])
    @token_required
    def save_note(current_user_id, plan_id):
        """Save study notes"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404

            data = request.json
            note = StudyNotes(
                plan_id=plan_id,
                topic=data.get('topic'),
                content=data.get('content')
            )
            db.session.add(note)
            db.session.commit()

            return jsonify({'message': 'Note saved', 'id': note.id}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/plans/<int:plan_id>/notes', methods=['GET'])
    @token_required
    def get_notes(current_user_id, plan_id):
        """Get all notes for a plan"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404

            notes = StudyNotes.query.filter_by(plan_id=plan_id).all()
            return jsonify([{
                'id': n.id,
                'topic': n.topic,
                'content': n.content,
                'created_at': n.created_at.isoformat()
            } for n in notes]), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/plans/<int:plan_id>/session', methods=['POST'])
    @token_required
    def save_session(current_user_id, plan_id):
        """Save study session"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404

            data = request.json
            session = StudySession(
                plan_id=plan_id,
                topic=data.get('topic'),
                duration=data.get('duration', 0)
            )
            db.session.add(session)
            db.session.commit()

            return jsonify({'message': 'Session saved'}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/stats', methods=['GET'])
    @token_required
    def get_stats(current_user_id):
        """Get user statistics"""
        try:
            plans = StudyPlan.query.filter_by(user_id=current_user_id).all()
            all_progress = UserProgress.query.join(StudyPlan).filter(StudyPlan.user_id == current_user_id).all()
            all_sessions = StudySession.query.join(StudyPlan).filter(StudyPlan.user_id == current_user_id).all()
            
            total_time = sum(s.duration for s in all_sessions)
            completed_topics = sum(1 for p in all_progress if p.completed)
            
            return jsonify({
                'total_plans': len(plans),
                'total_topics_completed': completed_topics,
                'total_hours': round(total_time / 3600, 1),
                'average_completion': round(sum(p.completion_percentage for p in plans) / len(plans), 1) if plans else 0
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return app


def create_simple_plan(subject, days, hours, level):
    """Create a simple study plan structure"""
    
    curriculum = {
        "DSA": {
            "Beginner": ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Trees", "Sorting", "Searching", "Hash Tables", "Graphs"],
            "Intermediate": ["Dynamic Programming", "Advanced Trees", "Graph Algorithms", "Greedy Algorithms", "Backtracking", "Bit Manipulation"],
            "Advanced": ["NP-Complete Problems", "Advanced DP", "Network Flow", "String Algorithms", "Computational Geometry"]
        },
        "Python": {
            "Beginner": ["Variables & Data Types", "Control Flow", "Functions", "Lists & Dictionaries", "String Operations", "File I/O"],
            "Intermediate": ["OOP Basics", "Modules & Packages", "Exception Handling", "Decorators", "Generators"],
            "Advanced": ["Metaclasses", "Async Programming", "Performance Optimization", "Testing & Debugging"]
        },
        "Web Dev": {
            "Beginner": ["HTML Basics", "CSS Styling", "JavaScript Fundamentals", "DOM Manipulation", "Forms & Validation"],
            "Intermediate": ["React Basics", "State Management", "API Integration", "Routing", "Styling Solutions"],
            "Advanced": ["Performance Optimization", "Testing", "Deployment", "Security", "Advanced Patterns"]
        }
    }

    topics = curriculum.get(subject, {}).get(level, [])
    
    plan = []
    topics_per_day = max(1, len(topics) // days)
    
    for day in range(1, days + 1):
        start_idx = (day - 1) * topics_per_day
        end_idx = start_idx + topics_per_day if day < days else len(topics)
        day_topics = topics[start_idx:end_idx]
        
        plan.append({
            'day': day,
            'topics': [{'name': t, 'completed': False, 'hours': hours} for t in day_topics]
        })
    
    return plan


if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        db.create_all()
        print("\n" + "="*60)
        print("✅ AI Study Planner Backend Started")
        print("="*60)
        print("🔗 API: http://localhost:5000/api")
        print("❤️  Health: http://localhost:5000/api/health")
        print("📝 Register: POST /api/register")
        print("🔐 Login: POST /api/login")
        print("="*60 + "\n")
    
    app.run(debug=True, port=5000)
