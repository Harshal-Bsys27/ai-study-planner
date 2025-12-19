import os
from datetime import timedelta

class Config:
    """Flask configuration"""
    SQLALCHEMY_DATABASE_URI = 'sqlite:///study_planner.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    JSON_SORT_KEYS = False
    JWT_EXPIRATION = timedelta(days=30)
