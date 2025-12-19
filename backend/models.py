from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    """User model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    plans = db.relationship('StudyPlan', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

class StudyPlan(db.Model):
    """Study plan model"""
    __tablename__ = 'study_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    days = db.Column(db.Integer, nullable=False)
    hours_per_day = db.Column(db.Float, nullable=False)
    plan_data = db.Column(db.JSON, nullable=False)
    completion_percentage = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    progress = db.relationship('UserProgress', backref='plan', lazy=True, cascade='all, delete-orphan')
    notes = db.relationship('StudyNotes', backref='plan', lazy=True, cascade='all, delete-orphan')
    sessions = db.relationship('StudySession', backref='plan', lazy=True, cascade='all, delete-orphan')

class UserProgress(db.Model):
    """Track progress on topics"""
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('study_plans.id'), nullable=False)
    day = db.Column(db.Integer, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    time_spent = db.Column(db.Integer, default=0)  # seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudyNotes(db.Model):
    """Store study notes"""
    __tablename__ = 'study_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('study_plans.id'), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudySession(db.Model):
    """Track study sessions"""
    __tablename__ = 'study_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('study_plans.id'), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # seconds
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
