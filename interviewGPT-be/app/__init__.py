import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from .config import JD_FOLDER, RESUME_FOLDER, ARCHIVE_FOLDER, AUDIO_FOLDER

db = SQLAlchemy()


class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///response_cache.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


def create_app(config_class=Config):
    # Load environment variables
    load_dotenv()

    # Initialize the Flask application
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)

    # Import models to register them with SQLAlchemy
    with app.app_context():
        from .models import Job, Resume, ExtractedInfo, ResumeScore, Candidate, TechnicalQuestion, BehaviouralQuestion, CodingQuestion, CandidateQuestion, AssessmentAttempt, AudioTranscription, CodeResponse, TechResponse
        db.create_all()

        # Import blueprints
        from .job_routes import job_bp
        from .resume_routes import ats_bp
        from .assessment_generating_routes import assessment_bp
        from .question_management_routes import question_management_bp
        from .response_evaluate_routes import response_evaluate_bp

        # Register blueprints
        app.register_blueprint(job_bp)
        app.register_blueprint(ats_bp)
        app.register_blueprint(assessment_bp)
        app.register_blueprint(question_management_bp)
        app.register_blueprint(response_evaluate_bp)

    return app
