import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-12345')
    JSON_SORT_KEYS = False

class DevelopmentConfig(Config):
    """Development configuration"""
    SQLALCHEMY_DATABASE_URI = 'sqlite:///study_planner.db'
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///study_planner.db')
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    DEBUG = True
    TESTING = True

def get_config(config_name=None):
    """Get configuration object based on environment"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    config_map = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': TestingConfig,
    }
    
    return config_map.get(config_name, DevelopmentConfig)
