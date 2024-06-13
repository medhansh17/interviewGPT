# new models.py
import uuid
from datetime import datetime, timezone
from itsdangerous import URLSafeTimedSerializer
from flask_login import UserMixin
from . import db
from sqlalchemy import LargeBinary
# user login package



class Job(db.Model):
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    role = db.Column(db.String(100), nullable=False)
    jd = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    active = db.Column(db.Boolean, default=True, nullable=False)
    resumes = db.relationship('Resume', backref='job', cascade='all, delete')
    candidates = db.relationship(
        'Candidate', backref='job', cascade='all, delete')
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Job {self.role}>'


class Resume(db.Model):
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    extracted_info = db.relationship(
        'ExtractedInfo', backref='resume', cascade='all, delete')
    resume_scores = db.relationship(
        'ResumeScore', backref='resume', cascade='all, delete')
    candidates = db.relationship(
        'Candidate', backref='resume', cascade='all, delete')
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Resume {self.filename}>'


class ExtractedInfo(db.Model):
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    resume_id = db.Column(db.String, db.ForeignKey(
        'resume.id'), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100))
    total_experience = db.Column(db.String(50))
    phone_number = db.Column(db.String(30))
    email_id = db.Column(db.String(30))
    address = db.Column(db.String(200))
    linkedin_id = db.Column(db.String(200))
    github_id = db.Column(db.String(200))
    nationality = db.Column(db.Text)
    tech_skill = db.Column(db.JSON)
    behaviour_skill = db.Column(db.JSON)
    date_of_birth = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class ResumeScore(db.Model):
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    resume_id = db.Column(db.String, db.ForeignKey(
        'resume.id'), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    resume_filename = db.Column(db.Text, nullable=True)
    name = db.Column(db.String(100), nullable=True)
    jd_match = db.Column(db.String(10), nullable=True)
    match_status = db.Column(db.String(20), nullable=True)
    matching_skills = db.Column(db.JSON, nullable=True)
    missing_skills = db.Column(db.JSON, nullable=True)
    selected_status = db.Column(db.Boolean, nullable=True, default=None)
    assessment_status = db.Column(db.Integer, nullable=True, default=None)
    experience_match = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(100), nullable=True)
    isfilled = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<ResumeScore {self.id}>'


class Candidate(db.Model):
    __tablename__ = 'candidate'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    resume_id = db.Column(db.String, db.ForeignKey(
        'resume.id'), nullable=False)
    technical_questions = db.relationship(
        'TechnicalQuestion', backref='candidate', cascade='all, delete')
    behavioural_questions = db.relationship(
        'BehaviouralQuestion', backref='candidate', cascade='all, delete')
    coding_questions = db.relationship(
        'CodingQuestion', backref='candidate', cascade='all, delete')
    candidate_questions = db.relationship(
        'CandidateQuestion', backref='candidate', cascade='all, delete')
    audio_transcriptions = db.relationship(
        'AudioTranscription', backref='candidate', cascade='all, delete')
    code_responses = db.relationship(
        'CodeResponse', backref='candidate', cascade='all, delete')
    tech_responses = db.relationship(
        'TechResponse', backref='candidate', cascade='all, delete')
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class TechnicalQuestion(db.Model):
    __tablename__ = 'technical_question'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(255), nullable=False)
    user_answer = db.Column(db.String(255), nullable=True)
    tech_eval = db.Column(db.JSON, nullable=True)
    candidate_id = db.Column(db.String, db.ForeignKey(
        'candidate.id'), nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class BehaviouralQuestion(db.Model):
    __tablename__ = 'behavioural_question'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    candidate_id = db.Column(db.String, db.ForeignKey(
        'candidate.id'), nullable=False)
    audio_transcript = db.Column(db.Text)
    behav_eval = db.Column(db.JSON, nullable=True)
    audio_file_path = db.Column(db.String(255), nullable=True)  # New column for audio file path
    audio_data = db.Column(LargeBinary, nullable=True)  # New column for binary audio data
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CodingQuestion(db.Model):
    __tablename__ = 'coding_question'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    sample_input = db.Column(db.Text, nullable=False)
    sample_output = db.Column(db.Text, nullable=False)
    user_code = db.Column(db.Text, nullable=True)
    code_eval = db.Column(db.JSON, nullable=False)
    candidate_id = db.Column(db.String, db.ForeignKey(
        'candidate.id'), nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CandidateQuestion(db.Model):
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    candidate_id = db.Column(db.String, db.ForeignKey(
        'candidate.id'), nullable=False)
    question_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AudioTranscription(db.Model):
    __tablename__ = 'audio_transcription'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    # question_id = db.Column(db.String, db.ForeignKey('behavioural_question.id'), nullable=False)
    question = db.Column(db.String(255))
    candidate_id = db.Column(db.String, db.ForeignKey(
        'candidate.id'), nullable=False)
    audio_transcript = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CodeResponse(db.Model):
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.String, db.ForeignKey(
        'coding_question.id'), nullable=False)
    code_response = db.Column(db.JSON, nullable=False)
    candidate_id = db.Column(db.String, db.ForeignKey(
        'candidate.id'), nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class TechResponse(db.Model):
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.String, db.ForeignKey(
        'technical_question.id'), nullable=False)
    tech_response = db.Column(db.JSON, nullable=False)
    candidate_id = db.Column(db.String, db.ForeignKey(
        'candidate.id'), nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(64), unique=True)

    def __repr__(self):
        return f'<Role {self.name}>'


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(80), nullable=True)
    last_name = db.Column(db.String(80), nullable=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    role = db.relationship('Role', backref=db.backref('users', lazy=True))
    email_confirmed = db.Column(db.Boolean, nullable=True, default=False)
    email_confirmation_sent_on = db.Column(db.DateTime, nullable=True)
    email_confirmed_on = db.Column(db.DateTime, nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)

    def get_reset_token(self,secret_key, expires_sec=1800):
        s = URLSafeTimedSerializer(secret_key, expires_sec)
        return s.dumps({'user_id': self.id}).decode('utf-8')

    @staticmethod
    def verify_reset_token(token,secret_key):
        s = URLSafeTimedSerializer(secret_key)
        try:
            user_id = s.loads(token)['user_id']
        except:
            return None
        return User.query.get(user_id)