# config.py - Week 2+
# Configuration management and environment variables

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    
    # GeoIP Service (Week 3+)
    GEOIP_API_KEY = os.getenv('GEOIP_API_KEY', '')
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
