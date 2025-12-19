import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import jwt
from functools import wraps
from dotenv import load_dotenv

from models import db, User, StudyPlan, UserProgress, StudyNotes, StudySession
from config import get_config

load_dotenv()

def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=os.getenv('CORS_ORIGINS', '*').split(','))

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
        """Generate new study plan"""
        try:
            data = request.json
            subject = data.get('subject', 'DSA')
            days = int(data.get('days', 7))
            hours = float(data.get('hours', 2))
            level = data.get('level', 'Beginner')

            # Create simple plan data
            plan_data = [
                {
                    'day': i,
                    'topics': [
                        {'name': f'Topic {j}', 'completed': False, 'hours': hours}
                        for j in range(1, 3)
                    ]
                }
                for i in range(1, days + 1)
            ]

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
                'plan': plan_data,
                'total_hours': days * hours
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/plans/<int:plan_id>', methods=['GET'])
    @token_required
    def get_plan(current_user_id, plan_id):
        """Get specific plan"""
        try:
            plan = StudyPlan.query.filter_by(id=plan_id, user_id=current_user_id).first()
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404

            return jsonify({
                'id': plan.id,
                'subject': plan.subject,
                'level': plan.level,
                'days': plan.days,
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
        """Get notes for plan"""
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


if __name__ == '__main__':
    env = os.getenv('FLASK_ENV', 'development')
    app = create_app(env)
    
    with app.app_context():
        db.create_all()
        print("\n" + "="*60)
        print("✅ AI Study Planner Backend Started")
        print("="*60)
        print(f"🌍 Environment: {env.upper()}")
        print(f"🗄️  Database: {'SQLite' if env == 'development' else 'PostgreSQL'}")
        print(f"🔗 API: http://localhost:5000/api")
        print(f"❤️  Health: http://localhost:5000/api/health")
        print("="*60 + "\n")
    
    if env == 'production':
        # For production, gunicorn will handle this
        pass
    else:
        app.run(debug=True, port=5000)
