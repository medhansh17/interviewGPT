from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
import os
import PyPDF2
from PyPDF2 import PdfReader
import json
from openai import OpenAI
from werkzeug.utils import secure_filename
from sqlalchemy import func,desc
## for login page
import lancedb
import os
import jwt
from utils import *
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import UserMixin

from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

from itsdangerous import URLSafeTimedSerializer
from flask import Flask, request, jsonify, render_template_string
from flask_migrate import Migrate
from openai import OpenAI
from threading import Thread
import shutil
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

client = OpenAI()
# Set up OpenAI API key
client.api_keyapi_key = os.getenv("OPENAI_API_KEY")

current_directory=os.getcwd()
# Create the folder to store resume  if it doesn't exist
resume_folder=os.path.join(current_directory,"check_resume_folder_final")
if not os.path.exists(resume_folder):
    os.makedirs(resume_folder)

#Create the folder to stored deleted resume
archive_path=os.path.join(current_directory,"ARCHIVE_FOLDER")
if not os.path.exists(archive_path):
    os.makedirs(archive_path)

# Create the folder to store jd file  if it doesn't exist
jd_folder=os.path.join(current_directory,"jd_file_folder")
if not os.path.exists(jd_folder):
    os.makedirs(jd_folder)

#Create the folder to store candidate audio file 
audio_folder=os.path.join(current_directory,"audio_file_folder")
if not os.path.exists(audio_folder):
    os.makedirs(audio_folder)

# Specify the folder location where you want to store the database file
db_folder=os.path.join(current_directory,"Database")
if not os.path.exists(db_folder):
    os.makedirs(db_folder)


# Specify the SQLite database URI with the folder location
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(db_folder, "jobsv3.db")}'

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobs.db'
db = SQLAlchemy(app)

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


"""
# Create the database tables
with app.app_context():
    db.create_all()
"""

###### login, register api 

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# SECRET_KEY = "THISISMYSECRETKEYFORNOW"
#app = Flask(__name__)

#CORS(app)
app.config['TEMPLATES_AUTO_RELOAD'] = True
# app.secret_key = SECRET_KEY
app.config['UPLOAD_FOLDER'] = 'tmp'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)



bcrypt = Bcrypt(app)


#db = SQLAlchemy(app)
migrate = Migrate(app, db)

app.config['SECRET_KEY'] = "THIISISTHESECRETKEY"
app.config['WTF_CSRF_TIME_LIMIT'] = 86400


s = URLSafeTimedSerializer(app.config["SECRET_KEY"])

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = EMAIL_USER
app.config['MAIL_PASSWORD'] = EMAIL_PASS
# app.config['MAIL_DEFAULT_SENDER'] = EMAIL_USER

mail = Mail(app)

# oauth = OAuth(app)


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=True)
    last_name = db.Column(db.String(80), nullable=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=True)
    # google_id = db.Column(db.String(100), nullable=True)
    email_confirmed = db.Column(db.Boolean, nullable=True, default=False)
    email_confirmation_sent_on = db.Column(db.DateTime, nullable=True)
    email_confirmed_on = db.Column(db.DateTime, nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)

    def get_reset_token(self, expires_sec=1800):
        s = URLSafeTimedSerializer(app.config["SECRET_KEY"], expires_sec)
        return s.dumps({'user_id': self.id}).decode('utf-8')

    @staticmethod
    def verify_reset_token(token):
        s = URLSafeTimedSerializer(app.config["SECRET_KEY"])
        try:
            user_id = s.loads(token)['user_id']
        except:
            return None
        return User.query.get(user_id)


@app.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    print(data)
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Please enter an email'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'There is no account with that email. You must register first.'}), 400

    if not user.email_confirmed:
        return (jsonify({"error": "Please verify your account first."}))

    token = s.dumps(email, salt='password-reset-link')
    confirm_route = 'reset'
    link = f'{EMAIL_VERIFY_URI}/{confirm_route}/{token}'

    html_content = create_reset_password_body(link)

    msg = Message('reset password', sender=EMAIL_USER,
                  recipients=[email], html=html_content)

    # print(link) 

    mail.send(msg)

    return jsonify({'success': 'The Password reset link is sent on your mail.'})


@app.route('/reset/<token>', methods=['GET', 'POST'])
def reset(token):
    if request.method == 'GET':
        try:
            email = s.loads(token, salt='password-reset-link', max_age=1800)
            # Assuming User is your SQLAlchemy User model
            user = User.query.filter_by(email=email).first()
            if user:
                # Here, you can render the HTML template for resetting password
                # You can include the new password form here and send it to the frontend
                html_content = password_reset_form_html(token)
                return render_template_string(html_content)
            else:
                return "User not found."
        except Exception:
            return "Link expired or invalid."
    elif request.method == 'POST':
        token = request.form.get('token')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        try:
            email = s.loads(token, salt='password-reset-link', max_age=1800)
            user = User.query.filter_by(email=email).first()
            if user:
                if new_password == confirm_password:
                    # Update the user's password and reset token logic here
                    user.password = bcrypt.generate_password_hash(
                        new_password)  # Hash the password
                    # Clear the reset token or set it to None in the database
                    user.reset_token = None
                    db.session.commit()
                    # Return success message or redirect to login page
                    login_url = "http://pdf.bluetickconsultants.com/login.html"
                    html_content = password_reset_success_html(login_url)
                    return render_template_string(html_content)
                else:
                    return "Passwords do not match."
            else:
                return "User not found."
        except Exception:
            return "Link expired or invalid."
    else:
        return "Method not allowed."


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print("Login Request Data:", data)

    # Check if email and password are provided in the request body
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    # Check if the user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid credentials.'}), 400

    # Check if the user's email is confirmed
    if not user.email_confirmed:
        return jsonify({'error': 'Please confirm your email before logging in.'}), 401

    # Check if the password matches
    if not bcrypt.check_password_hash(user.password, password.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials. Incorrect password.'}), 401

    user.last_login = datetime.now()
    db.session.commit()

    # If the credentials are valid, create a JWT token
    token_payload = {
        'email': email,
        'user_id': user.id,
        # Set session timeout to 30 minutes
        'exp': datetime.utcnow() + timedelta(weeks=1)
    }
    token = jwt.encode(
        token_payload, app.config['SECRET_KEY'], algorithm='HS256')

    # db_present = False
    # lance_db = lancedb.connect(LANCEDB_PATH)
    # list_of_db_names = lance_db.table_names()
    # print(list_of_db_names)
    # db_name = "user_db_" + str(user.id)
    # print(session_restore)
    # print(db_name in list_of_db_names)
    # if session_restore and db_name in list_of_db_names:
    #     db_present = True

    # Return the token as a JSON response
    return jsonify({'token': token, 'user_id': user.id, "first_name": user.first_name, "last_name": user.last_name}), 200


@app.route('/register', methods=['GET', 'POST'])
def register():

    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        password = data.get('password')

        # Check if email and password are provided in the request body
        if not email or not password:
            return jsonify({'error': 'Email and password are required.'}), 400
        existing_user_email = User.query.filter_by(email=email).first()
        if existing_user_email:
            return jsonify({'error': 'Email already exists.'}), 401
        else:
            try:
                password_encoded = password.encode('utf-8')
                hashed_password = bcrypt.generate_password_hash(
                    password_encoded)
                # print("Hashed Password during registration:", hashed_password)
                new_user = User(email=email, password=hashed_password,
                                first_name=first_name, last_name=last_name)

                token = s.dumps(email, salt='email-confirmation-link')
                confirm_route = 'confirm'
                link = f'{EMAIL_VERIFY_URI}/{confirm_route}/{token}'

                html_content = create_verification_email_body(link)

                msg = Message('verification', sender=EMAIL_USER,
                              recipients=[email], html=html_content)

                # print(link)

                mail.send(msg)
                db.session.add(new_user)
                db.session.commit()
                # print(msg)

                return jsonify({"message": "created user successfully"}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': e}), 401


@app.route('/confirm/<token>')
def confirm(token):
    try:
        email = s.loads(token, salt='email-confirmation-link', max_age=180000)
        user = User.query.filter_by(email=email).first()
        print("here")
        if user:
            user.email_confirmed = True
            print("user confirmed")
            user.email_confirmed_on = datetime.now()
            db.session.commit()
            # Return HTML code with a button that redirects to the login page
            # Generate the correct URL for the login page
            # login_url = "http://pdf.bluetickconsultants.com/login.html"

            # Return HTML code with a button that redirects to the login page
            html_content = email_verified_success_html(FRONTEND_URL)
            print(html_content)

            return render_template_string(html_content)
        else:
            return "User not found."
    except Exception as e:
        return str(e)

##### Functionality API #####
### Main functionality api 
@app.route('/Manual_upload_job', methods=['POST'])
def Manual_upload_job():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job already exists
        with app.app_context():
            existing_job = Job.query.filter_by(role=role, jd=jd).first()
        if existing_job:
            return jsonify({'message': 'Job JD already exists.'}), 400

        # Save the job to the database
        new_job = Job(role=role, jd=jd)
        with app.app_context():
            db.session.add(new_job)
            db.session.commit()
        #return jsonify({'message': 'Job uploaded successfully.','timestamp': new_job.timestamp}), 200
        return jsonify({'message': 'Job uploaded successfully.'}), 200
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

@app.route('/file_upload_jd', methods=['POST'])
def file_upload_jd():
    # Check if the request contains the necessary form data
    if 'role' not in request.form or 'jd_file' not in request.files:
        return jsonify({'error': 'Role and JD file are required.'}), 400

    # Get the role from the form data
    role = request.form['role']

    # Get the JD file from the request
    jd_file = request.files['jd_file']

    # Check if a JD file was uploaded
    if jd_file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    # Define the directory where you want to save the JD file
    upload_directory = jd_folder # Change this to your desired directory

    # Save the JD file to the upload directory
    jd_filename = os.path.join(upload_directory, jd_file.filename)
    jd_file.save(jd_filename)

    # Read the contents of the JD file
    jd_content = ""
    with open(jd_filename, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            jd_content += page.extract_text()

    # Check if the job already exists
    existing_job = Job.query.filter_by(role=role, jd=jd_content).first()
    if existing_job:
        return jsonify({'message': 'Job JD already exists.'}), 400

    # Save the job to the database
    new_job = Job(role=role, jd=jd_content)
    db.session.add(new_job)
    db.session.commit()

    return jsonify({'message': 'Job JD uploaded successfully.'}), 200

#To display the role and jd details in tabular foramt.
@app.route('/export_jobs_json', methods=['GET'])
#@token_required
def export_jobs_json():
    jobs = Job.query.all()
    jobs_list = [{'id': job.id, 'role': job.role, 'jd': job.jd,'active':job.active} for job in jobs]
    return jsonify(jobs_list)

#API to edit the jd, role and status of the job
@app.route('/edit_job/<string:job_id>', methods=['PUT'])
def edit_job(job_id):
    # Get the new role, job description, and status from the request
    new_role = request.json.get('role')
    new_jd = request.json.get('jd')
    new_status = request.json.get('status') ## just send true or false , not as string
    
    
    # Validate if at least one of role, job description, or status is provided
    if new_role is None and new_jd is None and new_status is None:
        return jsonify({'message': 'Role, job description, or status not provided'}), 400

    # Get the job from the database
    job = Job.query.get(job_id)
    if job is None:
        return jsonify({'message': 'Job not found'}), 404

    # Update the job details
    if new_role:
        job.role = new_role
    if new_jd:
        job.jd = new_jd
    if new_status is not None:
        job.active = new_status
    

    db.session.commit()

    return jsonify({'message': 'Job details updated successfully'}), 200
"""
#To delete the specific role and jd
@app.route('/delete_job', methods=['POST'])
def delete_job():
    data = request.get_json()
    role = data.get('role')
    id = data.get('id')

    if role and id:
        # Check if the job exists
        job = Job.query.filter_by(role=role, id=id).first()
        if job:
            db.session.delete(job)
            db.session.commit()
            return jsonify({'message': f'Job with role "{role}" deleted successfully.'})
           # return jsonify({'message': f'Job with role "{role}" and JD "{jd}" deleted successfully.'}), 200
        else:
            return jsonify({'message': 'Job not found.'}), 404
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

"""


@app.route('/delete_job', methods=['POST'])
def delete_job():
    data = request.get_json()
    role = data.get('role')
    id = data.get('id')

    if role and id:
        # Check if the job exists
        job = Job.query.filter_by(role=role, id=id).first()
        if job:
            try:
                # Delete records from all associated tables
                ExtractedInfo.query.filter_by(job_id=id).delete()
                ResumeScore.query.filter_by(job_id=id).delete()
                Resume.query.filter_by(job_id=id).delete()
                
                # Delete the job itself
                db.session.delete(job)
                db.session.commit()

                return jsonify({'message': f'Job with role "{role}" and ID "{id}" deleted successfully.'}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': f'An error occurred while deleting the job: {str(e)}'}), 500
        else:
            return jsonify({'message': 'Job not found.'}), 404
    else:
        return jsonify({'message': 'Role and ID are required fields.'}), 400



#3rd screen 

#3nd screen to display job_id, jd and role 
@app.route('/jobs/<string:job_id>', methods=['GET'])
def get_job_details(job_id):
    # Get the job details from the database based on the provided job_id
    job = Job.query.get(job_id)

    if job:
        # Construct a dictionary containing the job details
        job_details = {
            'job_id': job.id,
            'role': job.role,
            'jd': job.jd
            # Add other fields as needed
        }
        return jsonify({'job_details': job_details}), 200
    else:
        return jsonify({'error': 'Job not found'}), 404


# API endpoint to fetch extracted_info table details based on candidate name and job_id
# After selecting the candiate name it should display the his/her details
@app.route('/extracted_info', methods=['GET'])
def get_extracted_info():
    # Get the candidate name and job ID from the query parameters
    candidate_name = request.args.get('candidate_name')
    job_id = request.args.get('job_id')

    # Validate if both candidate name and job ID are provided
    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job ID are required in the query parameters'}), 400

    # Get the extracted_info details from the database based on the provided candidate name (case-insensitive) and job ID
    extracted_info = ExtractedInfo.query.filter(
        ExtractedInfo.job_id == job_id,
        ExtractedInfo.resume_id.ilike(candidate_name)  # Perform case-insensitive match
    ).first()

    if extracted_info:
        # Construct a dictionary containing the extracted_info details
        extracted_info_details = {
            'candidate_name': extracted_info.name,
            'total_experience': extracted_info.total_experience,
            'phone_number': extracted_info.phone_number,
            'email_id': extracted_info.email_id,
            'address': extracted_info.address,
            'linkedin_id': extracted_info.linkedin_id,
            'github_id': extracted_info.github_id,
            'nationality': extracted_info.nationality,
            'tech_skills': extracted_info.tech_skill,
            'behaviour_skills': extracted_info.behaviour_skill,
            'date_of_birth': extracted_info.date_of_birth
            # Add other fields as needed
        }
        return jsonify({'extracted_info_details': extracted_info_details}), 200
    else:
        return jsonify({'error': 'Extracted info not found for the provided candidate name and job ID'}), 404
#2nd screen search bar
@app.route('/search_jobs', methods=['GET'])
def search_jobs():

    role=request.args.get('role')
    job_id=request.args.get('job_id')

    # Get the job details from the database based on the provided job_id
    job = Job.query.get(job_id)

    if job:
        # Construct a dictionary containing the job details
        job_details = {
            'job_id': job.id,
            'role': job.role,
            'jd': job.jd
            # Add other fields as needed
        }
        return jsonify({'job_details': job_details}), 200
    else:
        return jsonify({'error': 'Job not found'}), 404
########################
# 3nd screen
## Thread concept functionality code
#thread to execute the extract_resume_info function
def extract_resume_info(job_id, role):
    with app.app_context():

        # Get resume scores for the given job_id
        resume_scores_list = ResumeScore.query.filter_by(job_id=job_id).all()

        # Get the filenames of already processed resumes
        processed_filenames = [resume.resume_filename for resume in resume_scores_list]

        # Initialize an empty string to store extracted text from all resumes
        text_resume = ""
        path = os.path.join(resume_folder, role)
        
        # Iterate through each file in the resumes folder
        for filename in os.listdir(path):
            if filename.endswith(".pdf") and filename not in processed_filenames:  # Check if the file is a PDF and not processed:  # Check if the file is a PDF
                file_path = os.path.join(path, filename)  # Get the full file path
                reader = PyPDF2.PdfReader(file_path)
                
                # Add a separator with the filename before extracting text from each PDF
                text_resume += f"Text extracted from: {filename}\n"
                
                # Iterate through each page of the PDF and extract text
                for page in reader.pages:
                    text_resume += page.extract_text()
                    text_resume += "\n"  # Add a newline after each page
                
                # Add a separator between different PDFs
                text_resume += "\n---\n"
        
        # prompt template for open ai 
        message_resumefetch = [
            {"role": "system", "content": """
            You act like as ATS tool, where you get {text_resume}resume of candidate,You will get multiple resumes or single resume that will vary,each resume will be differentiated by "Text extracted from: {filename}",so from that resume
            extract the information like candidate name, date of birth, work experience in years, phone number, address, email id, linkedin link, github link, technical skills, soft skills.
            IF total year of experience is not given, then you do analysis of total years the candidate worked in different company, and say total years of experience, not the company name details,Always avoid hallucination-problem,the extracted information should be in JSON format like below example:
            IF any key values is not there, mention as "NIL", don't need explanation, just the JSON details like below
            {
                "resume_details": [
                    {
                        "candidate_name": "KEERTHI GANESH M",
                        "work_exp": "3 YEARS",
                        "phone_number": "78787878787",
                        "address": "KAIALSH NAGAR TRICHY, TAMIL NADU",
                        "email_id": "KEERTHI@GMAIL.COM",
                        "linkedin_id": " "https://linkedin.com/keerthi",
                        "github_id": ,
                        "technical_skills": ["PYTHON", "DEVOPS", "SQL", "AI"],
                        "soft_skills": ["GOOD COMMUNICATION", "TEAM PLAYER"],
                        "date_of_birth": "04-09-1998",
                        "nationality": "Indian"
                    },
                    {
                        "candidate_name": "kishore M",
                        "work_exp": "1 YEARS",
                        "phone_number": "345678983",
                        "address": "balaji street,kerala",
                        "email_id": "kishore@GMAIL.COM",
                        "linkedin_id": "https://linkedin.com/kishore",
                        "github_id": ,
                        "technical_skills": ["c++", "springboot", "JAVA", "REACT"],
                        "soft_skills": ["COMMUNICATION", "CRITICAL THINKER"],
                        "date_of_birth": "20-11-2000",
                        "nationality": "Indian"
                    }
                ]
            }
            if only one resume is given the give the response like below
            {
                "resume_details": [
                    {
                        "candidate_name": "KEERTHI GANESH M",
                        "work_exp": "3 YEARS",
                        "phone_number": "78787878787",
                        "address": "KAIALSH NAGAR TRICHY , TAMIL NADU",
                        "email_id": "KEERTHI@GMAIL.COM",
                        "linkedin_id": ,
                        "github_id": ,
                        "technical_skills": ["PYTHON", "DEVOPS", "SQL", "AI"],
                        "soft_skills": ["GOOD COMMUNICATION", "TEAM PLAYER"],
                        "date_of_birth": "04-09-1998",
                        "nationality": "Indian"
                    }
                ]
            }
            """
            },
            {"role": "user", "content": f"""use the {text_resume} resume to get details which are stated like name (get full name with inital if it is there), work experience,phone number,address,email id, linkedin id and github id
             fetch all the techincal skills and soft skills separtely dont mix it from the resume {text_resume}  and give the details as per instructed.If years of experience are not explicitly mentioned in the {text_resume}, calculate the total years of experience based on the dates provided in the candidate's employment history and use it for work_exp """}

        ]

        client = OpenAI()
        # Set up OpenAI API key
        client.api_key = os.getenv("OPENAI_API_KEY")

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message_resumefetch,
            max_tokens=1000
        )
        response = dict(response)
        response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")
        # Remove extra spaces
        response_data = ' '.join(response_data.split())
        
        # Remove unwanted characters from the response data
        response_data = response_data.strip().strip('```json').strip().strip('```')
        
        # Parse the JSON data containing extracted details
        extracted_info = json.loads(response_data)
        
        # Iterate through each resume detail extracted by OpenAI and save it to the database
        try:
            for resume_detail in extracted_info['resume_details']:
                # Add a new record if it doesn't already exist
                extracted_record = ExtractedInfo(
                    job_id=job_id,
                    resume_id=resume_detail['candidate_name'],  # Use candidate name as resume ID
                    name=resume_detail.get('candidate_name', 'NIL'),
                    total_experience=resume_detail.get('work_exp', 'NIL'),
                    phone_number=resume_detail.get('phone_number', 'NIL'),
                    email_id=resume_detail.get('email_id', 'NIL'),
                    address=resume_detail.get('address', 'NIL'),
                    linkedin_id=resume_detail.get('linkedin_id', 'NIL'),
                    github_id=resume_detail.get('github_id', 'NIL'),
                    nationality=resume_detail.get('nationality', 'NIL'),
                    tech_skill=resume_detail.get('technical_skills', []),
                    behaviour_skill=resume_detail.get('soft_skills', []),
                    date_of_birth=resume_detail.get('date_of_birth', 'NIL')
                )
                db.session.add(extracted_record)

            # Commit changes to the database
            db.session.commit()

            return jsonify({'message': 'Information extracted and saved successfully.'}), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
#thread to execute the calculate_resume_scores function
#function to support calculate_resume_score (resume_details_extract and chatgpt_message)
def resume_details_extract(role,job_id):
   
    
    # Get resume scores for the given job_id
    resume_scores = ResumeScore.query.filter_by(job_id=job_id).all()

    # Get the filenames of already processed resumes
    processed_filenames = [resume.resume_filename for resume in resume_scores]

    # Define the directory containing your PDF files
    directory = os.path.join(resume_folder,role)

    # Initialize an empty string to store extracted text
    text_resume = ""
    print("keerthi")
    # Iterate through each file in the directory
    for filename in os.listdir(directory):
        if filename.endswith(".pdf")  and filename not in processed_filenames:  # Check if the file is a PDF and not processed:  # Check if the file is a PDF:  # Check if the file is a PDF
            file_path = os.path.join(directory, filename)  # Get the full file path
            reader = PyPDF2.PdfReader(file_path)
            
            # Add a separator with the filename before extracting text from each PDF
            text_resume += f"Text extracted from: {filename}\n"
            
            # Iterate through each page of the PDF and extract text
            for page in reader.pages:
                text_resume += page.extract_text()
                text_resume += "\n"  # Add a newline after each page
            
            # Add a separator between different PDFs
            text_resume += "\n---\n"
            
    # Print the extracted text
    return (text_resume)
def chatgpt_message(jd,job_role,text_resume,mandatory_skills):


    prompt12= """
    Hey Act like a skilled or very experience ATS(Application Tracking System) 
with a deep understanding of the field .Your task is to evaluate the resume based on the given job description.
Also for jd match look deeply/ analaysis/ come to conclusion with respective to job role, job description and resume.correct varation in score should be seen  in mutplie resume,also score should not always be in round numbers.
JD Match Scoring:

Calculate the jd_match score based on the proportion of matching_skills relative to the total skills required by the jd and mandatory_skills.
Consider the experience_match value in the final score calculation.
The score should reflect the relevance and completeness of the resumes in fulfilling the job requirements. Ensure that the scoring differentiates between resumes based on the presence of critical skills and required experience.
For "Match Status", say if job match % is below 50 % then "Rejected", if it is greater or equal to 50 % but below 80% then "ON HOLD",if job match is greater than or equal to 80% then say "SELECTED FOR REVIEW".

The response should be in a JSON having the structure like below example:
{
"score":[
{
    "resume_filename": "devops-engineer-resume-example",
    "candidate_name":"keerthi ganesh m",
    "JD_MATCH":"%",
    "MATCH_STATUS":"",
    "Matching_Skills":[],
    "Missing_Skills":[],
    "experience_match":
},
{
    "resume_filename": "python-resume",
    "candidate_name":"Kishore Kumar M",
    "JD_MATCH":"%",
    "MATCH_STATUS":"",
    "Matching_Skills":[],
    "Missing_Skills":[],
    "experience_match":
}]
}
"""
    
    messages=[
{
    "role":'system',
    "content":prompt12},
{"role":"user",
 "content":f"""
Use the given {text_resume}, {job_role}, and {jd} (job description) to evaluate the jd_match score by acting as an ATS (Applicant Tracking System) tool. The score should be able to differentiate between multiple resumes.
Candidate name should be full name with inital if it is there, if inital is not there in resume then fine.
Resume Extraction:

Only use the resumes provided in the {text_resume} input. Each resume is separated by the text "Text extracted from:filename".
Do not generate any new candidate details or any JSON objects that were not part of the original input.

Matching Skills Evaluation:
Extract and list skills that are present in both the {jd} and the {text_resume}.
Extract and list skills that are present in both the {mandatory_skills} and the {text_resume}.
Combine both the list of skills from above list and use it for matching_skills.
Ensure that every skill from the {mandatory_skills} is checked:
If a mandatory skill is found in the {text_resume}, include it in the matching_skills.
If a mandatory skill is not found in the {text_resume}, include it in the missing_skills.
The matching_skills should contain a maximum of 20 skills, prioritizing mandatory skills if the limit is reached. Include at least 1 skill, if possible. If no skills match, set jd_match to 0 and list matching skills as "NIL".



Missing Skills Evaluation:

Identify skills mentioned in the jd and {mandatory_skills} that are not present in {text_resume}.
Ensure that skills from {mandatory_skills} which are not present in {text_resume} are always included in the missing skills, along with other missing skills from jd.
Limit the list of missing skills to a maximum of 8. If there are fewer than 8 missing skills, include as many as are identified.
If no missing skills are found, list the missing skills as "NIL".

Experience Check:

Identify the years of experience required in the {jd} (e.g., "5+ years of experience").
Check if the {text_resume} mentions the relevant years of experience explicitly.
If years of experience are not explicitly mentioned in the {text_resume}, infer the total years of experience from the employment history dates provided in the resume. Calculate the total duration by summing up the periods from each employment entry.
Ensure that the calculated or explicitly mentioned years of experience match the requirement in the jd.
If the required experience is met, set experience_match to 1. If not, set experience_match to 0.

JD Match Scoring:

Calculate the jd_match JD Match score based on the proportion of matching_skills relative to the total skills required by the {jd} and {mandatory_skills} common with {text_resume}.
The score should reflect the relevance and completeness of the resumes in fulfilling the job requirements. Ensure that the scoring differentiates between resumes based on the presence of critical skills and required experience

text_resume: The resume text provided by the candidate.
job_role: The job role for which the candidate is applying.
jd: The job description provided by the employer.
mandatory_skills: A list of mandatory skills required for the job.

Important Considerations:

Matching Skills: Skills which are common between {jd} and {text_resume} ,along with that find common between  {mandatory_skills} and {text_resume}, with a cap of 8 skills.
Mandatory Skills Inclusion: Ensure mandatory skills provided by the user are included in either matching_skills or missing_skills.
Missing Skills: Skills from {jd} not found in {text_resume}, with a cap of 8 skills.
Minimum and Maximum Skills: Ensure at least 1 matching skill, if possible, and list up to 8 matching and missing skills.
NIL for No Skills: Clearly specify "NIL" if no matching or missing skills are found.

Dont generate exaple response by your own unless you get resume details in {text_resume} variable.
The response should only be in a JSON having the structure like above.
""" }
]
    


    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response1 = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            temperature=0,
            max_tokens=1000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
    print(response1.choices[0].message)
    response1= dict(response1)
    response_data = dict(dict(response1['choices'][0])['message'])[
            'content'].replace("\n", " ")

    print("knfdklfn")
 
    return (response_data)

def calculate_resume_scores(job_id,mandatory_skills):
    with app.app_context():
        # Get job details from the database using job_id
        job = Job.query.filter_by(id=job_id).first()

        if not job:
            return jsonify({'error': 'Job not found.'}), 404

        jd = job.jd
        role = job.role

        # Call user defined function for resume extract and call OpenAI to score
        text_resume = resume_details_extract(role,job_id)
        AI_score_response = chatgpt_message(jd, role, text_resume,mandatory_skills)

        # Convert AI_score_response string to dictionary
        AI_score_response_dict = json.loads(AI_score_response)
        print(AI_score_response_dict)
        # Parse AI score response and extract relevant information
        scores = []
        for resume_info in AI_score_response_dict['score']:
            resume_filename = resume_info['resume_filename']
            jd_match = resume_info['JD_MATCH']
            match_status = resume_info['MATCH_STATUS']
            matching_skills = resume_info['Matching_Skills']
            missing_skills = resume_info['Missing_Skills']
            candidate_name = resume_info['candidate_name']
            experience_match=resume_info['experience_match']

            # Store the calculated scores into your Resume_score table
            new_score = ResumeScore(
                resume_filename=resume_filename,
                name=candidate_name,
                job_id=job_id,  # Add job ID here if available
                jd_match=jd_match,
                match_status=match_status,
                matching_skills=matching_skills,
                missing_skills=missing_skills,
                experience_match=experience_match
            )
            db.session.add(new_score)

            # Append the score details to the response
            scores.append({
                "resume_filename": resume_filename,
                "candidate_name": candidate_name,
                "JD_MATCH": jd_match,
                "MATCH_STATUS": match_status,
                "Matching_Skills": matching_skills,
                "Missing_Skills": missing_skills,
                "role": role,
                "jd": jd,
                "experience_match":experience_match
            })

        # Commit changes to the database
        db.session.commit()
        print("calcu_done")
        return jsonify({'scores': scores}), 200

@app.route('/upload_resume_to_job', methods=['POST'])
def upload_resume_to_job():
    # First, handle the resume upload functionality
    data = request.form
    role = data.get('role')
    id = data.get('id')
    mandatory_skills=data.get('mandatory_skills')
    # Check if both role and JD are provided
    if not role or not id:
        return jsonify({'message': 'Role and JD are required fields.'}), 400
    
    folder_path = os.path.join(resume_folder, role)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    try:
        # Save the resume file(s) to the resume folder
        for resume_file in request.files.getlist('resume'):
            if resume_file.filename == '':
                return jsonify({'message': 'No selected file'}), 400
            
            # Generate a unique filename
            resume_filename = secure_filename(resume_file.filename)

            # Save the resume file to the resume folder
            resume_path = os.path.join(folder_path, resume_filename)
            resume_file.save(resume_path)

            # Associate the resume file with the job in the database
            job = Job.query.filter_by(role=role, id=id).first()
            jd=job.jd
            if not job:
                return jsonify({'message': 'Specified job role or description does not exist.'}), 400
            
            new_resume = Resume(filename=resume_filename, job_id=job.id)
            db.session.add(new_resume)
            db.session.commit()

        # Once the resumes are uploaded, start a thread to execute the extract_resume_info function
        extract_thread = Thread(target=extract_resume_info, args=(job.id, role))
        extract_thread.start()

        # Then, start another thread to execute the calculate_resume_scores function
        score_thread = Thread(target=calculate_resume_scores, args=(job.id,mandatory_skills))
        score_thread.start()

        return jsonify({'message': 'Resumes uploaded successfully and processing started.'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#After the resume is uploaded or before resume is uploaded , this api should be called every 1 minute  
@app.route('/get_resume_scores', methods=['GET'])
def get_resume_scores():
    
    job_id = request.args.get('job_id')
    # Check if job_id and role are provided
    if not job_id:
        return jsonify({'error': 'Job ID and role are required parameters.'}), 400

    # Query the ResumeScore table based on job_id and role
    resume_scores = ResumeScore.query.filter_by(job_id=job_id).all()

    # Convert resume scores to JSON format
    scores_fetch= []
    for score in resume_scores:
        scores_fetch.append({
            "resume_filename": score.resume_filename,
            "candidate_name": score.name,
            "JD_MATCH": score.jd_match,
            "MATCH_STATUS": score.match_status,
            "Matching_Skills": score.matching_skills,
            "Missing_Skills": score.missing_skills,
            "selected_status":score.selected_status,
            "assessment_status":score.assessment_status,
            "experience_match":score.experience_match,
            "status":score.status
        })

    return jsonify({'resume_scores': scores_fetch}), 200



@app.route('/delete_resume', methods=['GET'])
def delete_resume():
    # Get candidate name and job_id from the request JSON data
    #data = request.get_json()
    #candidate_name = data.get('candidate_name')
    #job_id = data.get('job_id')

    candidate_name = request.args.get('candidate_name')
    job_id = request.args.get('job_id')
    
    job = Job.query.filter_by(id=job_id).first()
    role = job.role
    
    # Check if candidate name and job_id are provided
    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job ID are required parameters.'}), 400

    try:
        # Delete records from ExtractedInfo table
        num_deleted_info = ExtractedInfo.query.filter(
            func.lower(ExtractedInfo.name) == func.lower(candidate_name),  # Case-insensitive match
            ExtractedInfo.job_id == job_id
        ).delete()
        
        # Delete records from ResumeScore table
        resume_scores = ResumeScore.query.filter(func.lower(ResumeScore.name) == func.lower(candidate_name), ResumeScore.job_id == job_id).all()
        for score in resume_scores:
            # Delete record from ResumeScore table
            db.session.delete(score)
            # Delete record from Resume table and move the file to the archive folder
            resume = Resume.query.filter_by(filename=score.resume_filename, job_id=job_id).first()
            if resume:
                # Move the file to the archive folder with a timestamp appended to its name
                archive_role_folder = os.path.join(archive_path, role)
                if not os.path.exists(archive_role_folder):
                    os.makedirs(archive_role_folder)
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                new_filename = f"{resume.filename}_{timestamp}.pdf"
                file_to_delete_path = os.path.join(archive_role_folder, new_filename)
                shutil.move(os.path.join(resume_folder, role, resume.filename), file_to_delete_path)
                # Delete the record from the Resume table
                db.session.delete(resume)

        # Commit changes to the database
        db.session.commit()

        return jsonify({'message': f'Resume deleted successfully. {num_deleted_info} records deleted from ExtractedInfo table.'}), 200
    
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'IntegrityError: Database constraint violation.'}), 500
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# to select the resume is selected or not 
@app.route('/update_resume_status', methods=['POST'])
def update_resume_status():
    data = request.get_json()
    name = data.get('name')
    status = data.get('status')  # give 'True' or 'False'

    if name is None or status is None:
        return jsonify({'error': 'Candidate name and status are required fields.'}), 400

    # Convert status string to boolean
    if status.lower() == 'true':
        status_bool = True
    elif status.lower() == 'false':
        status_bool = False
    else: 
        return jsonify({'error': 'Invalid value for status. Must be "True" or "False".'}), 400
    

    # Convert candidate name to lowercase
    name_lower = name.lower()
    print(f"Searching for candidate with name: {name_lower}")

    # Find the resume score record by name (case-insensitive search)
    resume_score = ResumeScore.query.filter(func.lower(ResumeScore.name) == name_lower).first()
    
    if resume_score is None:
        return jsonify({'error': 'Resume score record not found.'}), 404

    # Update the status
    resume_score.selected_status = status_bool

    # Commit changes to the database
    db.session.commit()

    return jsonify({'message': f'Resume status updated to {status_bool} for candidate {name}.'}), 200

##QUESTION GENERATION 
##user defined function for each type of question 

def tech_question_mcq(jd13,no_tech_questions,Tech_skills):

    # To generate technical mcq
    
    message=[
                {"role": "system", "content":
        """You act as an  technical Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
        {
    "tech_questions":[ {
        "question": "What is the purpose of a firewall in a network?",
        "options": {
        "A": "Prevents hacker attacks",
        "B": "Reduces network traffic",
        "C": "Increases network speed",
        "D": "Bypass security protocols"
        },
        "answer": "A"
    },
    {
        "question": "What is the primary purpose of an operating system?",
        "options": {
        "A": "Manage the computer's resources",
        "B": "Provide an interface for users to interact with the computer",
        "C": "Run applications on the computer",
        "D": "All of the above"
        },
        "answer": "D"
    }]
    }

    
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"""always manadotry to Generate {no_tech_questions} technical question, the difficulty level should be medium to hard, should not be easy questions,even question should not repeat.
                important information, options sshould be too hard, so that candiate can get confuse easily with other choices.
                Questions should be entirely based on job description {jd13} and candiate technical skills found from {Tech_skills}.
                """}
                
            ]

    tech_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    tech_response = dict(tech_response)
    tech_response = dict(dict(tech_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    tech_response = ' '.join(tech_response.split())
    return (tech_response)

 #To generate Behaiviour questions
def behaviour_questions(no_behav_questions,behav_skills):
    
    
    message=[
                {"role": "system", "content":
        """You act as an Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
    Always give 1st question as "Tell me about yourself".
        {
        "Behaviour_q":[
        {
            "b_question_id":"1",
            "b_question_text":"Tell me about yourself ?"
        },
        {
            "b_question_id":"2",
            "b_question_text":"Describe a situation where you had a conflict with team members ?"

        }]

        }
    b_question_id should always start from 1.
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"always manadotry to Generate {no_behav_questions} behaivour questions not more than that,and based on behaviour skills which candidate have {behav_skills}, if they dont have,give a question by your choice.ie soft skill question"}
                
            ]

    behav_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    behav_response= dict(behav_response)
    behav_response = dict(dict(behav_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    behav_response = ' '.join(behav_response.split())
    return (behav_response)
#TO generate coding question 
def coding_question_generate():

    
    message=[
                {"role": "system", "content":
        """You act as  hackerrank application.With all your years of expertise in interviewing candidates,
    Generate a one coding questions in medium level related to Data strucutres, follow the format , this is how the result should look like below,
    Always have a problem statement in question key , have sample input and output in different key as below , also give 3 testcases for that question.

    {
    "coding_question":{
    "question":"An array is a type of data structure that stores elements of the same type in a contiguous block of memory. In an array, , of size , each memory location has some unique index,  (where ), that can be referenced as  or .Reverse an array of integers.",
    "sample_input":"
        4
        1 4 3 2",
    "sample_output:"2 3 4 1"
    }
    }
    this is how the response should be from you !!

    """},
                {"role": "user", "content":"Generate coding question, questions should not repeat."}
                
            ]

    coding_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    coding_response = dict(coding_response)
    coding_response = dict(dict(coding_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    coding_response = ' '.join(coding_response.split())
    return (coding_response)

def tech_question_mcq(jd13,no_tech_questions,Tech_skills):

    # To generate technical mcq
    
    message=[
                {"role": "system", "content":
        """You act as an  technical Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
        {
    "tech_questions":[ {
        "question": "What is the purpose of a firewall in a network?",
        "options": {
        "A": "Prevents hacker attacks",
        "B": "Reduces network traffic",
        "C": "Increases network speed",
        "D": "Bypass security protocols"
        },
        "answer": "A"
    },
    {
        "question": "What is the primary purpose of an operating system?",
        "options": {
        "A": "Manage the computer's resources",
        "B": "Provide an interface for users to interact with the computer",
        "C": "Run applications on the computer",
        "D": "All of the above"
        },
        "answer": "D"
    }]
    }

    
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"""always manadotry to Generate {no_tech_questions} technical question, the difficulty level should be medium to hard, should not be easy questions,even question should not repeat.
                important information, options sshould be too hard, so that candiate can get confuse easily with other choices.
                Questions should be entirely based on job description {jd13} and candiate technical skills found from {Tech_skills}.
                """}
                
            ]

    tech_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    tech_response = dict(tech_response)
    tech_response = dict(dict(tech_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    tech_response = ' '.join(tech_response.split())
    return (tech_response)

 #To generate Behaiviour questions
def behaviour_questions(no_behav_questions,behav_skills):
    
    
    message=[
                {"role": "system", "content":
        """You act as an Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
    Always give 1st question as "Tell me about yourself".
        {
        "Behaviour_q":[
        {
            "b_question_id":"1",
            "b_question_text":"Tell me about yourself ?"
        },
        {
            "b_question_id":"2",
            "b_question_text":"Describe a situation where you had a conflict with team members ?"

        }]

        }
    b_question_id should always start from 1.
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"always manadotry to Generate {no_behav_questions} number of behaivour questions,and based on behaviour skills which candidate have {behav_skills}, if they dont have,give a question by your choice.ie soft skill question"}
                
            ]

    behav_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    behav_response= dict(behav_response)
    behav_response = dict(dict(behav_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    behav_response = ' '.join(behav_response.split())
    return (behav_response)
#TO generate coding question 
def coding_question_generate():

    
    message=[
                {"role": "system", "content":
        """You act as  hackerrank application.With all your years of expertise in interviewing candidates,
    Generate a one coding questions in medium level related to Data strucutres, follow the format , this is how the result should look like below,
    Always have a problem statement in question key , have sample input and output in different key as below , also give 3 testcases for that question.

    {
    "coding_question":{
    "question":"An array is a type of data structure that stores elements of the same type in a contiguous block of memory. In an array, , of size , each memory location has some unique index,  (where ), that can be referenced as  or .Reverse an array of integers.",
    "sample_input":"
        4
        1 4 3 2",
    "sample_output:"2 3 4 1"
    }
    }
    this is how the response should be from you !!

    """},
                {"role": "user", "content":"Generate coding question, questions should not repeat."}
                
            ]

    coding_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    coding_response = dict(coding_response)
    coding_response = dict(dict(coding_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    coding_response = ' '.join(coding_response.split())
    return (coding_response)

def save_assessment_to_db(job_id, role, candidate_name, tech_questions, behaviour_questions, coding_question,version_number):
    # Create or retrieve job record
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Invalid job ID.'}), 400

    # Create or retrieve candidate record
    candidate = Candidate.query.filter_by(name=candidate_name).first()
    if not candidate:
        # If candidate does not exist, it's the first assessment, so set version number to 1
        version_number=1
        candidate = Candidate(name=candidate_name, job_id=job_id,version_number=version_number)
        db.session.add(candidate)
        db.session.commit()
    else:
        # If candidate exists, increment the version number
        candidate.version_number += 1
        db.session.commit()
        

    # Save technical questions
    for question in tech_questions:
        tech_question = TechnicalQuestion(question_text=question['question'], options=json.dumps(question['options']), correct_answer=question['answer'], job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(tech_question)
        # Commit the technical question to the database to obtain its ID
        #db.session.add(tech_question)
        db.session.commit()
        

        # Print the ID to ensure it's not None
        print("Tech Question ID:", tech_question.id)
        # Associate question with candidate
        candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='technical', question_id=tech_question.id, job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(candidate_question)
        

    print("Behaviour Questions:", behaviour_questions)
    # Save behavioural questions
    for question in behaviour_questions:
        # Print the question object to check its structure and values
        print("Behaviour Question:", question)
        behav_question = BehaviouralQuestion(question_text=question['b_question_text'], job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(behav_question)
         # Print the newly created behavioural question object to check its attributes
        print("New Behavioural Question:", behav_question)
        # Commit the behavioural question to the database to obtain its ID
        db.session.add(behav_question)
        db.session.commit()
        # Print the ID to ensure it's not None
        print("Behaviour Question ID:", behav_question.id)
        # Associate question with candidate
        candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='behavioural', question_id=behav_question.id, job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(candidate_question)
        # Print the newly created candidate question object to check its attributes
        print("New Candidate Question:", candidate_question)

    # Save coding question
    coding_question = CodingQuestion(question_text=coding_question['question'], sample_input=coding_question['sample_input'], sample_output=coding_question['sample_output'], job_id=job_id,name=candidate_name,version_number=version_number)
    db.session.add(coding_question)
    db.session.commit()

    # Print the ID to ensure it's not None
    print("Coding Question ID:", coding_question.id)
    # Associate question with candidate
    candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='coding', question_id=coding_question.id, job_id=job_id,name=candidate_name,version_number=version_number)
    db.session.add(candidate_question)

    # Save assessment attempt
    assessment_attempt = AssessmentAttempt(candidate_id=candidate.id, job_id=job_id,version_number=version_number)
    db.session.add(assessment_attempt)

    db.session.commit()

    return jsonify({'message': 'Assessment data saved successfully.'}), 200

# Api to call the question generation functionality
@app.route('/Auto_assessment', methods=['POST'])
def Auto_assessment():
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        candidate_name = data.get('candidate_name')
        no_tech_questions = data.get('no_tech_questions')
        no_behav_questions = data.get('no_behav_questions')
        # Check if job_id and candidate_name are provided
        if not job_id or not candidate_name:
            return jsonify({'error': 'Job ID and candidate name are required parameters.'}), 400

        # Convert candidate name to lowercase without spaces for comparison
        candidate_name_formatted = candidate_name.lower().replace(" ", "")
        # Query the ResumeScore table to find the selected status of the candidate
        resume_score = ResumeScore.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ExtractedInfo.name, " ", "")) == candidate_name_formatted).first()
        if resume_score:
            selected_status = resume_score.selected_status

            if not selected_status:
                # If the candidate is in a rejected state, return an error message
                return jsonify({'error': 'Candidate is in a rejected state.'}), 200

            # Proceed with generating assessment questions
            job = Job.query.get(job_id)
            jd = job.jd
            role = job.role
            

            # Delete from TechnicalQuestion
            TechnicalQuestion.query.filter(
                func.lower(func.replace(TechnicalQuestion.name, " ", "")) == candidate_name_formatted,
                TechnicalQuestion.job_id == job_id
            ).delete()

            # Delete from BehaviouralQuestion
            BehaviouralQuestion.query.filter(
                func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == candidate_name_formatted,
                BehaviouralQuestion.job_id == job_id
            ).delete()

            # Delete from CodingQuestion
            CodingQuestion.query.filter(
                func.lower(func.replace(CodingQuestion.name, " ", "")) == candidate_name_formatted,
                CodingQuestion.job_id == job_id
            ).delete()

            db.session.commit()

            # Query the database to find the candidate's technical and behavioral skills
            candidate_info = ExtractedInfo.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ExtractedInfo.name, " ", "")) == candidate_name_formatted).first()
            #for version code
            # Check if candidate already has records for this job
            existing_candidate = Candidate.query \
                .filter(func.lower(func.replace(Candidate.name, " ", "")) == candidate_name_formatted) \
                .filter_by(job_id=job_id) \
                .first()

            if existing_candidate:
                # If candidate already has records, get the highest version number and increment it by 1
                existing_version_number = db.session.query(func.max(Candidate.version_number)) \
                    .filter_by(name=candidate_name, job_id=job_id) \
                    .scalar()
                if existing_version_number is None:
                    version_number = 1
                else:
                    version_number = existing_version_number + 1
            else:
                # If it's the first time generating questions for the candidate and job, set version number to 1
                version_number = 1

            #till here version code

            # If candidate_info exists, proceed with generating assessment questions
            if candidate_info:
                # Extract technical and behavioral skills
                technical_skills = candidate_info.tech_skill
                behavioral_skills = candidate_info.behaviour_skill

                # Generate technical, behavioral, and coding questions
                question_tech = tech_question_mcq(jd, no_tech_questions, technical_skills)
                question_behav = behaviour_questions(no_behav_questions, behavioral_skills)
                question_coding = coding_question_generate()

                # Convert questions to JSON format
                tech_questions_json = json.loads(question_tech).get('tech_questions', [])
                behaviour_questions_json = json.loads(question_behav).get('Behaviour_q', [])
                coding_question_json = json.loads(question_coding).get('coding_question', {})
                



                # Save assessment data to the database
                save_assessment_to_db(job_id, role, candidate_name, tech_questions_json, behaviour_questions_json, coding_question_json,version_number)

                return jsonify({'message': 'Assessment questions generated successfully.'}), 200
            else:
                return jsonify({'error': 'Candidate information not found.'}), 404
        else:
            return jsonify({'error': 'Resume score record not found for the candidate.'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# for the aprroval of questions 
@app.route('/fetch_candidate_questions_after_selected', methods=['POST'])
def fetch_candidate_questions():
    # Get candidate name and job_id IN JSON
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400

    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()
    # Find the candidate record with the highest version number
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404
    
    # Get the version number from the candidate record
    version_number = candidate.version_number

    # Fetch technical questions
    technical_questions = []
    for question in candidate.job.technical_questions:
        if question.version_number == version_number and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            technical_questions.append({
                'question': question.question_text,
                'options': json.loads(question.options),
                'answer': question.correct_answer,
                'tech_ques_id':question.id
            })

    # Fetch behavioural questions
    behavioural_questions = []
    for question in candidate.job.behavioural_questions:
        if question.version_number == version_number and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            behavioural_questions.append({
                'b_question_id': question.id,
                'b_question_text': question.question_text
            })
    
    # Fetch coding question with the specific version number
    coding_question = {}
    if candidate.job.coding_questions:
        for coding_question_data in candidate.job.coding_questions:
            if coding_question_data.version_number == version_number and coding_question_data.name.replace(" ", "").lower().strip() == normalized_candidate_name and coding_question_data.job_id == job_id:
                coding_question = {
                    'question': coding_question_data.question_text,
                    'sample_input': coding_question_data.sample_input,
                    'sample_output': coding_question_data.sample_output,
                    'coding_ques_id':coding_question_data.id
                }
                break  # Stop searching once the correct version is found
    return jsonify({
        'tech_questions': technical_questions,
        'Behaviour_q': behavioural_questions,
        'coding_question': coding_question
    }), 200

## To edit the questions in approval screen

@app.route('/edit_candidate_question', methods=['POST'])
def edit_candidate_question():
    data = request.get_json()
    question_id = data.get('question_id')
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')
    question_type = data.get('question_type')  # 'technical', 'behavioral', 'coding'
    question_data = data.get('question_data')  # Contains the updated details of the question

    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()

    if not question_id or not question_type or not question_data:
        return jsonify({'error': 'question_id, question_type, and question_data are required parameters.'}), 400
    question_type=question_type.lower()
    try:
        if question_type == 'technical':

            question=TechnicalQuestion.query.filter(
                func.lower(func.replace(TechnicalQuestion.name, " ", "")) == normalized_candidate_name,
                TechnicalQuestion.id == question_id,
                TechnicalQuestion.job_id == job_id).first()
            
            if question:
                question.question_text = question_data['question']
                question.options = json.dumps(question_data['options'])
                question.correct_answer = question_data['answer']
            else:
                return jsonify({'error': 'Technical question not found.'}), 404

        elif question_type == 'behavioral':

            question=BehaviouralQuestion.query.filter(
                func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == normalized_candidate_name,
                BehaviouralQuestion.id == question_id,
                BehaviouralQuestion.job_id == job_id).first()
            
            if question: 
                question.question_text = question_data['b_question_text']
            else:
                return jsonify({'error': 'Behavioral question not found.'}), 404

        elif question_type == 'coding':

            question=CodingQuestion.query.filter(
                func.lower(func.replace(CodingQuestion.name, " ", "")) == normalized_candidate_name,
                CodingQuestion.id == question_id,
                CodingQuestion.job_id == job_id).first()
            
            if question:
                question.question_text = question_data['question']
                question.sample_input = question_data['sample_input']
                question.sample_output = question_data['sample_output']
            else:
                return jsonify({'error': 'Coding question not found.'}), 404

        else:
            return jsonify({'error': 'Invalid question type.'}), 400

        db.session.commit()
        return jsonify({'status': 'Question updated successfully.'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

## To delete the question in approval page

@app.route('/delete_candidate_question', methods=['DELETE'])
def delete_candidate_question():
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')
    question_id = data.get('question_id')
    question_type = data.get('question_type')  # 'technical', 'behavioral', 'coding'

    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()

    if not question_id or not question_type:
        return jsonify({'error': 'question_id and question_type are required parameters.'}), 400

    try:
        if question_type == 'technical':
            question=TechnicalQuestion.query.filter(
                func.lower(func.replace(TechnicalQuestion.name, " ", "")) == normalized_candidate_name,
                TechnicalQuestion.id == question_id,
                TechnicalQuestion.job_id == job_id).first()
            
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Technical question not found.'}), 404

        elif question_type == 'behavioral':
            question=BehaviouralQuestion.query.filter(
                func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == normalized_candidate_name,
                BehaviouralQuestion.id == question_id,
                BehaviouralQuestion.job_id == job_id).first()
            
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Behavioral question not found.'}), 404

        elif question_type == 'coding':
            question=CodingQuestion.query.filter(
                func.lower(func.replace(CodingQuestion.name, " ", "")) == normalized_candidate_name,
                CodingQuestion.id == question_id,
                CodingQuestion.job_id == job_id).first()
            
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Coding question not found.'}), 404

        else:
            return jsonify({'error': 'Invalid question type.'}), 400

        db.session.commit()
        return jsonify({'status': 'Question deleted successfully.'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

## to prompt the question topic and generate question for each one
#Generate and display the question based on the user’s prompt
## Update the Question in the Database after generation question based on user prompt

@app.route('/update_candidate_question', methods=['POST'])
def update_candidate_question():
    data = request.get_json()
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')
    question_id = data.get('question_id')
    question_type = data.get('question_type')  # 'technical', 'behavioural', or 'coding'
    topic_prompt = data.get('topic_prompt')

    if not candidate_name or not job_id or not question_type or not topic_prompt:
        return jsonify({'error': 'Candidate name, job_id, question_type, and topic_prompt are required parameters.'}), 400

    # Normalize candidate name for consistency
    normalized_candidate_name = candidate_name.replace(" ", "").lower().strip()

    if question_type == 'technical':
        new_question = generate_technical_question(topic_prompt)
        update_technical_question(question_id, new_question, job_id, normalized_candidate_name)

    elif question_type == 'behavioural':
        new_question = generate_behavioural_question(topic_prompt)
        update_behavioural_question(question_id, new_question, job_id, normalized_candidate_name)

    elif question_type == 'coding':
        new_question = generate_coding_question(topic_prompt)
        update_coding_question(question_id, new_question, job_id, normalized_candidate_name)

    else:
        return jsonify({'error': 'Invalid question type.'}), 400

    return jsonify({'message': 'Question updated successfully.'}), 200

def generate_technical_question(prompt):
    # Generate a new technical question based on the prompt
    message = [
        {"role": "system", "content": """
            You act as a technical Recruitment Professional with several years of experience ie more than 10+ years working in the tech industry. With all your years of expertise in interviewing candidates, always follow the output format, it should always be in JSON like:
            {
                "question": "What is the purpose of a firewall in a network?",
                "options": {
                    "A": "Prevents hacker attacks",
                    "B": "Reduces network traffic",
                    "C": "Increases network speed",
                    "D": "Bypass security protocols"
                },
                "answer": "A"
            }
        """},
        {"role": "user", "content": f"Generate a technical question on the following topic: {prompt}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )
    response= dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")

    
    response_content = ' '.join(response_data.split())
    new_question = json.loads(response_content)
    return (new_question)

def generate_behavioural_question(prompt):
    # Generate a new behavioural question based on the prompt
    message = [
        {"role": "system", "content": """
            You act as a Recruitment Professional with several years of experience ie more than 10+ years working in the tech industry. With all your years of expertise in interviewing candidates, always follow the output format, it should always be in JSON like:
            {
                "b_question_id": "1",
                "b_question_text": "Tell me about yourself?"
            }
        """},
        {"role": "user", "content": f"Generate a behavioural question on the following topic: {prompt}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )
    response= dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")

    
    response_content = ' '.join(response_data.split())
    new_question = json.loads(response_content)
    return (new_question)

def generate_coding_question(prompt):
    # Generate a new coding question based on the prompt
    message = [
        {"role": "system", "content": """
            You act as a hackerrank application. With all your years of expertise in interviewing candidates, generate a coding question. Follow the format, this is how the result should look like:
            {
                "question": "An array is a type of data structure that stores elements of the same type in a contiguous block of memory. Reverse an array of integers.",
                "sample_input": "4\n1 4 3 2",
                "sample_output": "2 3 4 1"
            }
        """},
        {"role": "user", "content": f"Generate a coding question on the following topic: {prompt}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )
    response= dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")

    
    response_content = ' '.join(response_data.split())
    new_question = json.loads(response_content)
    return (new_question)

def update_technical_question(question_id, new_question, job_id, candidate_name):
    tech_question = TechnicalQuestion.query.filter(
        func.lower(func.replace(TechnicalQuestion.name, " ", "")) == candidate_name,
        TechnicalQuestion.id == question_id,
        TechnicalQuestion.job_id == job_id
    ).first()

    if tech_question:
        tech_question.question_text = new_question['question']
        tech_question.options = json.dumps(new_question['options'])
        tech_question.correct_answer = new_question['answer']
        db.session.commit()

def update_behavioural_question(question_id, new_question, job_id, candidate_name):
    behav_question = BehaviouralQuestion.query.filter(
        func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == candidate_name,
        BehaviouralQuestion.id == question_id,
        BehaviouralQuestion.job_id == job_id
    ).first()

    if behav_question:
        behav_question.question_text = new_question['b_question_text']
        db.session.commit()

def update_coding_question(question_id, new_question, job_id, candidate_name):
    coding_question = CodingQuestion.query.filter(
        func.lower(func.replace(CodingQuestion.name, " ", "")) == candidate_name,
        CodingQuestion.id == question_id,
        CodingQuestion.job_id == job_id
    ).first()

    if coding_question:
        coding_question.question_text = new_question['question']
        coding_question.sample_input = new_question['sample_input']
        coding_question.sample_output = new_question['sample_output']
        db.session.commit()

### Assessment sheet API's
### To show the question in assessment sheet page 
@app.route('/fetch_behavioural_questions', methods=['POST'])
def fetch_behavioural_questions():
    # Get candidate name and job_id in Json
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400
    
    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()
    # Find the candidate record with the highest version number
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    # Fetch behavioural questions
    behavioural_questions = []
    for question in candidate.job.behavioural_questions:
        if question.version_number == max([q.version_number for q in candidate.job.behavioural_questions]) and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            behavioural_questions.append({
                'b_question_id': question.id,
                'b_question_text': question.question_text
            })

    return jsonify({'Behaviour_q': behavioural_questions}), 200


@app.route('/fetch_technical_questions', methods=['POST'])
def fetch_technical_questions():
    # Get candidate name and job_id in Json
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400
    
    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()
    # Find the candidate record with the highest version number
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    # Fetch technical questions
    technical_questions = []
    for question in candidate.job.technical_questions:
        if question.version_number == max([q.version_number for q in candidate.job.technical_questions]) and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            technical_questions.append({
                'question': question.question_text,
                'options': json.loads(question.options),
                'answer': question.correct_answer
            })

    return jsonify({'tech_questions': technical_questions}), 200


@app.route('/fetch_coding_question', methods=['POST'])
def fetch_coding_question():
    # Get candidate name and job_id in Json
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400
    
    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()
    # Find the candidate record with the highest version number
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404
    # Get the version number from the candidate record
    version_number = candidate.version_number
    # Fetch coding question
    coding_question = {}
    if candidate.job.coding_questions:
        for coding_question_data in candidate.job.coding_questions:
            if coding_question_data.version_number == version_number and coding_question_data.name.replace(" ", "").lower().strip() == normalized_candidate_name and coding_question_data.job_id == job_id:
                coding_question = {
                    'question': coding_question_data.question_text,
                    'sample_input': coding_question_data.sample_input,
                    'sample_output': coding_question_data.sample_output
                }
                break  # Stop searching once the correct version is found
    
    return jsonify({'coding_question': coding_question}), 200


## 4 Screen 
## To process the audio generated for behav questions
# API endpoint for processing audio
@app.route('/process_audio', methods=['POST'])
def process_audio():
    data = request.form
    question = data.get('question')
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')
    audio_file = request.files['audio']

    if not question or not candidate_name or not job_id or not audio_file:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Store audio file
    audio_folder = os.path.join('audio_file_folder', candidate_name)
    if not os.path.exists(audio_folder):
        os.makedirs(audio_folder)
    audio_path = os.path.join(audio_folder, audio_file.filename)
    audio_file.save(audio_path)

    # Transcribe audio
    audio_file = open(audio_path, "rb")
    transcript = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file,
        response_format="text"
    )
    print("audio transcripts")
    print(transcript)
    audio_file.close()
    try:
        # Store transcription in the database
        new_transcription = AudioTranscription(
            question=question,
            name=candidate_name,
            job_id=job_id,
            audio_transcript=transcript
        )
        db.session.add(new_transcription)
        db.session.commit()
        return jsonify({'status': 'transcripts save successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
###
## Code score api 

## User defined fucntion to call openai and score the code 
def perform_code_assessment(question, code):


        ## code assesssment requirement

    factors=""""
    When assessing coding skills, there are several factors to consider to gauge a candidate's proficiency and effectiveness. Here are some key factors to assess:

    Correctness: Determine whether the solution provided by the candidate is correct. This involves verifying that the code produces the expected output for various test cases and edge cases.

    Efficiency: Assess the efficiency of the solution in terms of time complexity and space complexity. Evaluate whether the code optimally utilizes computational resources and scales well with increasing input sizes.

    Clarity and Readability: Evaluate the clarity and readability of the code. Assess whether the code is well-organized, follows coding conventions, and uses meaningful variable names and comments to enhance understanding.

    Modularity and Maintainability: Consider the modularity of the code and its ability to be easily maintained and extended. Assess whether the code is structured into reusable functions or classes and whether it adheres to principles such as DRY (Don't Repeat Yourself) and separation of concerns.

    Edge Cases Handling: Evaluate how well the code handles edge cases and boundary conditions. Assess whether the solution is robust enough to handle unexpected inputs and edge cases without crashing or producing incorrect results.

    Error Handling and Robustness: Assess the code's error handling mechanisms and its ability to gracefully handle errors and exceptions. Evaluate whether the code includes appropriate error checks and validation to prevent unexpected behavior.

    Testing: Consider whether the candidate has included test cases to validate the correctness of their solution. Assess the comprehensiveness of the test cases and whether they cover various scenarios and edge cases.

    Optimization: Evaluate whether the candidate has applied optimization techniques to improve the performance of their code. Assess whether they have chosen appropriate data structures and algorithms and have optimized critical sections of the code where necessary.

    Language Proficiency: Assess the candidate's proficiency in the programming language used to solve the problem. Consider whether they demonstrate a good understanding of language features, syntax, and idiomatic usage.

    Problem-Solving Approach: Evaluate the candidate's problem-solving skills and their ability to decompose complex problems into smaller, manageable subproblems. Consider whether they have chosen an appropriate algorithmic approach and have effectively implemented it in code.

    By considering these factors, you can gain a comprehensive understanding of a candidate's coding abilities and make informed decisions about their suitability for a given role or task.

    """

    code=code ## user code 
    response_data89=question

    message190=[
                {"role": "system", "content":
            """
            You act like a coding assesment tool, based on the given code for given problem statement , use the {factors}
    as marking scheme and give scores with each sub headings given in {factors} ,score it out of 10.

    the problem statement details for the code is {response_data89} given in json format along with sample input nad output and the code snippet of the assessment is given  in this variable {code}
    All these should be JSON formated like below , where code_score , question can be taken from {response_data89} and user_code can be obtained from the variable {code}
    Always the repsone should only be in JSON format like below structure no other string should be added.
    {
    "code_score":
    {
    "Correctness":,
    "Efficiency":,
    "Clarity_and_Readability":,
    "Modularity and Maintainability":,
    "Edge Cases Handling":,
    "Error Handling and Robustness":,
    "Testing":,
    "Optimization":,
    "Language_Proficiency":,
    "Problem-Solving_Approach":,
    "OVERALL_SCORE":"12/100",
    },
    {
    "coding_question":{
    "question":,
    "sample_input":,
    "sample_output":
    },
    {
    "user_code":{}
    }
    }
    """},
    {"role":"user","content":f"the problem statement details for the code is {response_data89} and the code snippet to do assessment on the code {code},always give the score for each key out of 10 and calculate the total score and assign to OVERALL_SCORE key, dont need any further expalnation of score , just the key with score is enough in json.Always the score should be given coorectly ,even if the same {response_data89} and {code} is given to multiple times,you should give the same values for same response and code given. "
    }]
    response190 = client.chat.completions.create(
            model="gpt-4",
            messages=message190,
            
            max_tokens=1000
        
        )
    response190 = dict(response190)
    assessment_response = dict(dict(response190['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    assessment_response = ' '.join(assessment_response.split())
    print("going to return ")
    return (assessment_response)


# Api to do code scoring   
@app.route('/store_code_response', methods=['POST'])
def store_code_response():
    # Extract inputs from request JSON
    data = request.get_json()
    job_id = data.get('job_id')
    name = data.get('name')
    question = data.get('question')
    code = data.get('code')

    if not job_id or not name or not question or not code:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Perform code assessment using OpenAI
    assessment_response = perform_code_assessment(question, code)

    # Store the assessment response in the database
    try:
        # Check if there is an existing entry for the same name and job_id
        existing_entry = CodeResponse.query.filter_by(name=name, job_id=job_id).first()
        if existing_entry:
            db.session.delete(existing_entry)
            db.session.commit()

        # Create a new entry in the CodeResponse table
        new_response = CodeResponse(
            job_id=job_id,
            name=name,
            code_response=assessment_response
        )
        db.session.add(new_response)
        db.session.commit()

        # Normalize the candidate name for consistency
        normalized_name = name.replace(" ", "").lower().strip()

        # Update assessment_status in ResumeScore table
        resume_score_entry = ResumeScore.query.filter(
            func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
            ResumeScore.job_id == job_id
        ).first()

        if resume_score_entry:
            resume_score_entry.assessment_status = 1
            db.session.commit()

        return jsonify({'status': 'Code response evaluated and stored successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500    

## To evaluate the techincal question and score it 

# user defined fucntion to ask open ai to evaluate
def perform_techmcq_assessment(mcq_question):
    
    response_data89=mcq_question

    message10=[
                {"role": "system", "content":
            """
                You act like a Technical MCQ assesment tool, where you would be given a Json which consists of MCQ question in {response_data89} along with mutiple choices and user selected choice.
                so , what you have to do is that, you need to evaluate the MCQ question agianst correct answer and user answer, find your self the correct answer.
                Regarding Markings, each question carries 1 mark and 0 for wrong answer, so have variable mcq_score which stores the total score.
                Also if the user selected right answer give the selected choice as right or else wrong.
                Finally the response from you should be in Json format.
                Always the repsone should only be in JSON format like below structure no other string should be added.and in correct and user answer option variable like a or b or c should not be there ,the enitre choice should be there for both.

                {
                'tech_report':
                {
                "Total_score": correct answer  /number of question  ie 12/20,
                }
                {
                "questions":
                {
                "question":,
                "correct_answer":
                "user_answer":,
                "Selected_choice":"right"
                }
                {
                "question":,
                "correct_answer":
                "user_answer":,
                "Selected_choice":"wrong"
                }
                }
                }

    """},
    {"role":"user","content":f"for the given mcq questions along with options and user selected options in {response_data89}, evaluate it as explained , agaist correct option and user selcted option , give each question 1 mark if it is correct or else 0 mark ofrwrong answer,finally the total score should be obtained.Make sure to give the response only in josn format in key value pairs, dont add unwanted string in the response"
    }]
    response10 = client.chat.completions.create(
            model="gpt-4",
            messages=message10,
            
            max_tokens=1000
        
        )
    response10 = dict(response10)
    tech_assessment_response = dict(dict(response10['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    tech_assessment_response = ' '.join(tech_assessment_response.split())
    return (tech_assessment_response)
        
## API to store and do tech_msq evaluate 
@app.route('/store_tech_response', methods=['POST'])
def store_tech_response():
    # Extract inputs from request JSON
    data = request.get_json()
    job_id = data.get('job_id')
    name = data.get('name')
    question = data.get('question')
    
    if not job_id or not name or not question:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Perform technical MCQ question response generation using user-defined function
    tech_response = perform_techmcq_assessment(question)

    # Store the tech response in the database
    try:
        # Check if there is an existing entry for the same name and job_id
        existing_entry = TechResponse.query.filter_by(name=name, job_id=job_id).first()
        if existing_entry:
            db.session.delete(existing_entry)
            db.session.commit()

        # Create a new entry in the TechResponse table
        new_response = TechResponse(
            job_id=job_id,
            name=name,
            tech_response=tech_response
        )
        db.session.add(new_response)
        db.session.commit()

        # Normalize the candidate name for consistency
        normalized_name = name.replace(" ", "").lower().strip()

        # Update assessment_status in ResumeScore table
        resume_score_entry = ResumeScore.query.filter(
            func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
            ResumeScore.job_id == job_id
        ).first()

        if resume_score_entry:
            resume_score_entry.assessment_status = 1
            db.session.commit()

        return jsonify({'status': 'Tech response stored successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

## To fetch the user response after the assessment 
@app.route('/fetch_user_responses', methods=['POST'])
def fetch_user_responses():
    data = request.get_json()
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')

    # Normalize the candidate name for consistency
    normalized_name = candidate_name.replace(" ", "").lower().strip()

        # Update assessment_status in ResumeScore table
    resume_score_entry = ResumeScore.query.filter(
        func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
        ResumeScore.job_id == job_id
    ).first()

    # Check if assessment status is 1
    resume_score_entry = ResumeScore.query.filter(
        func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
        ResumeScore.job_id == job_id
    ).first()
    
    if not resume_score_entry or resume_score_entry.assessment_status != 1:
        return jsonify({'error': 'Assessment not completed or not found.'}), 400

    # Fetch data from CodeResponse table
    # Fetch code response
    code_responses = CodeResponse.query.filter(
        func.lower(func.replace(CodeResponse.name, " ", "")) == normalized_name,
        CodeResponse.job_id == job_id
    ).all()
    # Fetch tech response
    tech_responses = TechResponse.query.filter(
        func.lower(func.replace(TechResponse.name, " ", "")) == normalized_name,
        TechResponse.job_id == job_id
    ).all()

        # Fetch audio transcription
    audio_transcriptions = AudioTranscription.query.filter(
        func.lower(func.replace(AudioTranscription.name, " ", "")) == normalized_name,
        AudioTranscription.job_id == job_id
    ).all()

        # Process the audio_transcriptions to format them correctly if needed
    formatted_audio_transcriptions = []
    for audio_transcription in audio_transcriptions:
        formatted_audio_transcriptions.append({
            'question': audio_transcription.question,
            'User_response': audio_transcription.audio_transcript
        })
    # Format the data
    formatted_data = {
        'candidate_name':candidate_name,
        'job_id':job_id,
        'code_response': [code_response.code_response for code_response in code_responses],
        'tech_response': [tech_response.tech_response for tech_response in tech_responses],
        'audio_transcript':formatted_audio_transcriptions
    }

    return jsonify(formatted_data), 200

## SAMPLE THREAD FOR AUTO ASSESSMT USING THREAD
def generate_and_save_assessment(job_id, candidate_name, no_tech_questions, no_behav_questions, resume_score_id):
    with app.app_context():
        try:
            resume_score = ResumeScore.query.get(resume_score_id)

            if resume_score is None:
                raise ValueError("ResumeScore not found")
            
            print("thread_started")
            # Query the ResumeScore table to find the selected status of the candidate
            selected_status = resume_score.selected_status

            if not selected_status:
                # If the candidate is in a rejected state, return an error message
                #return jsonify({'error': 'Candidate is in a rejected state.'})
                #print("error': 'Candidate is in a rejected state.")
                resume_score.status = 'candidate_rejected'
                db.session.commit()
                return

            # Proceed with generating assessment questions
            job = Job.query.get(job_id)
            jd = job.jd
            role = job.role

            # Convert candidate name to lowercase without spaces for comparison
            candidate_name_formatted = candidate_name.lower().replace(" ", "")
            # Delete from TechnicalQuestion
            TechnicalQuestion.query.filter(
                    func.lower(func.replace(TechnicalQuestion.name, " ", "")) == candidate_name_formatted,
                    TechnicalQuestion.job_id == job_id
                ).delete()

            # Delete from BehaviouralQuestion
            BehaviouralQuestion.query.filter(
                    func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == candidate_name_formatted,
                    BehaviouralQuestion.job_id == job_id
                ).delete()

            # Delete from CodingQuestion
            CodingQuestion.query.filter(
                    func.lower(func.replace(CodingQuestion.name, " ", "")) == candidate_name_formatted,
                    CodingQuestion.job_id == job_id
                ).delete()

            db.session.commit()  
            print("old question deleted")
            # Query the database to find the candidate's technical and behavioral skills
            candidate_name_formatted = candidate_name.lower().replace(" ", "")
            # Query the database to find the candidate's technical and behavioral skills
            candidate_info = ExtractedInfo.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ExtractedInfo.name, " ", "")) == candidate_name_formatted).first()
            # Check if candidate already has records for this job
            # Version control code
            existing_candidate = Candidate.query \
                .filter(func.lower(func.replace(Candidate.name, " ", "")) == candidate_name_formatted) \
                .filter_by(job_id=job_id) \
                .first()

            if existing_candidate:
                # If candidate already has records, get the highest version number and increment it by 1
                existing_version_number = db.session.query(func.max(Candidate.version_number)) \
                    .filter_by(name=candidate_name, job_id=job_id) \
                    .scalar()
                if existing_version_number is None:
                    version_number = 1
                else:
                    version_number = existing_version_number + 1
            else:
                # If it's the first time generating questions for the candidate and job, set version number to 1
                version_number = 1

            #till here version code

            # If candidate_info exists, proceed with generating assessment questions
            if candidate_info:
                # Extract technical and behavioral skills
                technical_skills = candidate_info.tech_skill
                behavioral_skills = candidate_info.behaviour_skill

                # Generate technical, behavioral, and coding questions
                question_tech = tech_question_mcq(jd, no_tech_questions, technical_skills)
                question_behav = behaviour_questions(no_behav_questions, behavioral_skills)
                question_coding = coding_question_generate()
                print("question genraion fucntion called")
                # Convert questions to JSON format
                tech_questions_json = json.loads(question_tech).get('tech_questions', [])
                behaviour_questions_json = json.loads(question_behav).get('Behaviour_q', [])
                coding_question_json = json.loads(question_coding).get('coding_question', {})

                # Save assessment data to the database
                save_assessment_to_db(job_id, role, candidate_name, tech_questions_json, behaviour_questions_json, coding_question_json, version_number)
                print("question saved in")
                # Update the status to "assessment_generated"
                resume_score.status = 'assessment_generated'
                db.session.commit()
            else:
                
                #return jsonify({'error': 'Candidate information not found.'})
                print("'error': 'Candidate information not found.'")
                # Update the status to "candidate_info_not_found"
                resume_score.status = 'candidate_info_not_found'
                db.session.commit()
    
        except Exception as e:
            resume_score.status = 'error'
            db.session.commit()
            raise e

@app.route('/CHECK_Auto_assessment', methods=['POST'])
def CHECK_Auto_assessment():
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        candidate_name = data.get('candidate_name')
        no_tech_questions = data.get('no_tech_questions')
        no_behav_questions = data.get('no_behav_questions')

        if not job_id or not candidate_name:
            return jsonify({'error': 'Job ID and candidate name are required parameters.'}), 400

        candidate_name_formatted = candidate_name.lower().replace(" ", "")
        resume_score = ResumeScore.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ResumeScore.name, " ", "")) == candidate_name_formatted).first()

        if resume_score:
            resume_score.status = 'generating_assessment'
            db.session.commit()

            thread = Thread(target=generate_and_save_assessment, args=(job_id, candidate_name, no_tech_questions, no_behav_questions, resume_score.id))
            thread.start()

            return jsonify({'message': 'Assessment generation started.'}), 200
        else:
            return jsonify({'error': 'Resume score record not found for the candidate.'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

##Audio (blob to webm to wav)


# API endpoint for processing audio
@app.route('/blob_process_audio', methods=['POST'])
def blob_process_audio():
    data = request.form
    question = data.get('question')
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')
    audio_blob = request.files['audio']

    if not question or not candidate_name or not job_id or not audio_blob:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Generate a unique filename for the audio file
    unique_filename = f"{candidate_name}_{uuid.uuid4().hex}.wav"

    # Store audio file locally as WebM format
    audio_folder = os.path.join('audio_file_folder', candidate_name)
    if not os.path.exists(audio_folder):
        os.makedirs(audio_folder)
    
    webm_file_path = os.path.join(audio_folder, unique_filename)
    audio_blob.save(webm_file_path)


    # Transcribe audio from the WAV file
    with open(webm_file_path, "rb") as wav_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1", 
            file=wav_file,
            response_format="text"
        )
    
    try:
        # Store transcription in the database
        new_transcription = AudioTranscription(
            question=question,
            name=candidate_name,
            job_id=job_id,
            audio_transcript=transcript
        )
        db.session.add(new_transcription)
        db.session.commit()
        return jsonify({'status': 'transcripts saved successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create the database tables
    with app.app_context():
        db.create_all()
    app.run(debug=True)
