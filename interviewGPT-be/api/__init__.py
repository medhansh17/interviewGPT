import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from dotenv import load_dotenv
from .config import JD_FOLDER, RESUME_FOLDER, ARCHIVE_FOLDER, AUDIO_FOLDER

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
mail = Mail()

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///response_cache.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

def create_app(config_class=Config):
    # Load environment variables
    load_dotenv()

    # Initialize the Flask application
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
    app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASS')
    app.config['TA_USER']= os.getenv('TA_USER')

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    mail.init_app(app)

    with app.app_context():
        # Import models to register them with SQLAlchemy
        from .models import Job, Resume, ExtractedInfo, ResumeScore, Candidate, TechnicalQuestion, BehaviouralQuestion, CodingQuestion, CandidateQuestion, User,Role
        db.create_all()
        create_initial_roles()

        # Import and register blueprints
        from .job_routes import job_bp


        from .resume_routes import ats_bp
        from .assessment_generating_routes import assessment_bp
        from .question_management_routes import question_management_bp
        from .response_evaluate_routes import response_evaluate_bp
        from .login_routes import login_bp

        app.register_blueprint(job_bp)
        app.register_blueprint(ats_bp)
        app.register_blueprint(assessment_bp)
        app.register_blueprint(question_management_bp)
        app.register_blueprint(response_evaluate_bp)
        app.register_blueprint(login_bp)

    return app
def create_initial_roles():
    from .models import Role
    roles = ['guest', 'bluetick-admin']
    for role in roles:
        if not Role.query.filter_by(name=role).first():
            new_role = Role(name=role)
            db.session.add(new_role)
    db.session.commit()