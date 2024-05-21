from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func,desc
import os
from app import db
import uuid


class Job(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100), nullable=False)
    jd = db.Column(db.Text, nullable=False)
    resumes = db.relationship('Resume', backref='job', lazy=True)
    #status of the job 
    active = db.Column(db.Boolean, default=True, nullable=False)
     # Timestamp when the job is uploaded
    #timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Job {self.role}>'
    
# Resume model
class Resume(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)

    def __repr__(self):
        return f'<Resume {self.filename}>'
# ExtractedInfo table:
class ExtractedInfo(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    resume_id = db.Column(db.String, db.ForeignKey('resume.id'), nullable=False)
    name = db.Column(db.String(100))
    total_experience = db.Column(db.String(50))
    phone_number = db.Column(db.String(30))
    email_id=db.Column(db.String(30))
    address = db.Column(db.String(200))
    linkedin_id = db.Column(db.String(200))
    github_id = db.Column(db.String(200))
    nationality = db.Column(db.Text)
    tech_skill = db.Column(db.JSON)
    behaviour_skill = db.Column(db.JSON)
    date_of_birth = db.Column(db.Text)

class ResumeScore(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    #resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'), nullable=False)
    resume_filename=db.Column(db.Text)
    name = db.Column(db.String(100))
    jd_match = db.Column(db.String(10), nullable=False)
    match_status = db.Column(db.String(20), nullable=False)
    matching_skills = db.Column(db.JSON, nullable=True)
    missing_skills = db.Column(db.JSON, nullable=True)
    selected_status = db.Column(db.Boolean, default=False, nullable=False)
    assessment_status = db.Column(db.Integer, nullable=False, default=0)
    experience_match = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(100))

    def __repr__(self):
        return f'<ResumeScore {self.id}>'


# tabes for quesition store
class Candidate(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    job = db.relationship('Job', backref=db.backref('candidates', lazy=True))
    version_number = db.Column(db.Integer, default=1, nullable=False)  # Add this column and set default to 1
 
class TechnicalQuestion(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(255), nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    job = db.relationship('Job', backref=db.backref('technical_questions', lazy=True))
    version_number = db.Column(db.Integer, default=1, nullable=False)  # Add this column and set default to 1
    name = db.Column(db.String(255), nullable=False)

class BehaviouralQuestion(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    job = db.relationship('Job', backref=db.backref('behavioural_questions', lazy=True))
    version_number = db.Column(db.Integer, default=1, nullable=False)  # Add this column and set default to 1
    name = db.Column(db.String(255), nullable=False)

class CodingQuestion(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=False)
    sample_input = db.Column(db.Text, nullable=False)
    sample_output = db.Column(db.Text, nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    job = db.relationship('Job', backref=db.backref('coding_questions', lazy=True))
    version_number = db.Column(db.Integer, default=1, nullable=False)  # Add this column and set default to 1
    name = db.Column(db.String(255), nullable=False)

class CandidateQuestion(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.String, db.ForeignKey('candidate.id'), nullable=False)
    question_type = db.Column(db.String(50), nullable=False)
    question_id = db.Column(db.Integer, nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    job = db.relationship('Job', backref=db.backref('candidate_questions', lazy=True))
    version_number = db.Column(db.Integer, default=1, nullable=False)  # Add this column and set default to 1
    name = db.Column(db.String(255), nullable=False)

class AssessmentAttempt(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.String, db.ForeignKey('candidate.id'), nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    job = db.relationship('Job', backref=db.backref('assessment_attempts', lazy=True))
    version_number = db.Column(db.Integer, default=1, nullable=False)  # Add this column and set default to 1

class AudioTranscription(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255))
    name = db.Column(db.String(255), nullable=False)
    job_id = db.Column(db.String, db.ForeignKey('job.id'), nullable=False)
    audio_transcript = db.Column(db.Text)

class CodeResponse(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    code_response = db.Column(db.JSON, nullable=False)
    job_id = db.Column(db.String, nullable=False)
    name = db.Column(db.String(255), nullable=False)

class TechResponse(db.Model):
    id=db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    #id = db.Column(db.Integer, primary_key=True)
    tech_response = db.Column(db.JSON, nullable=False)
    job_id = db.Column(db.String, nullable=False)
    name = db.Column(db.String(255), nullable=False)