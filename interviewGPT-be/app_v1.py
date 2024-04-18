from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import os
import PyPDF2
from PyPDF2 import PdfReader
import json
from openai import OpenAI
from werkzeug.utils import secure_filename
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

app = Flask(__name__)
CORS(app)
current_directory=os.getcwd()
# Create the folder if it doesn't exist
resume_folder=os.path.join(current_directory,"check_resume_folder_final")
if not os.path.exists(resume_folder):
    os.makedirs(resume_folder)

# Specify the folder location where you want to store the database file
db_folder=os.path.join(current_directory,"Database")
if not os.path.exists(db_folder):
    os.makedirs(db_folder)


# Create the folder if it doesn't exist
if not os.path.exists(db_folder):
    os.makedirs(db_folder)

# Specify the SQLite database URI with the folder location
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(db_folder, "jobs.db")}'

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobs.db'
db = SQLAlchemy(app)

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100), nullable=False)
    jd = db.Column(db.Text, nullable=False)
    resumes = db.relationship('Resume', backref='job', lazy=True)
     # Timestamp when the job is uploaded
    #timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Job {self.role}>'
    
# Resume model
class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)

    def __repr__(self):
        return f'<Resume {self.filename}>'
# ExtractedInfo table:
class ExtractedInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'), nullable=False)
    name = db.Column(db.String(100))
    total_experience = db.Column(db.String(50))
    phone_number = db.Column(db.String(20))
    address = db.Column(db.String(200))
    linkedin_id = db.Column(db.String(200))
    github_id = db.Column(db.String(200))
    nationality = db.Column(db.Text)
    tech_skill = db.Column(db.JSON)
    behaviour_skill = db.Column(db.JSON)
    date_of_birth = db.Column(db.Text)


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
@app.route('/upload_job', methods=['POST'])
def upload_job():
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

#To display the role and jd details in tabular foramt.
@app.route('/export_jobs_json', methods=['GET'])
def export_jobs_json():
    jobs = Job.query.all()
    jobs_list = [{'id': job.id, 'role': job.role, 'jd': job.jd} for job in jobs]
    return jsonify(jobs_list)

#To delete the specific role and jd
@app.route('/delete_job', methods=['POST'])
def delete_job():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job exists
        job = Job.query.filter_by(role=role, jd=jd).first()
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
# route for uploading resumes for specific job roles and job descriptions
@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job exists in the database
        with app.app_context():
            job = Job.query.filter_by(role=role, jd=jd).first()
        if not job:
            return jsonify({'message': 'Specified job role or description does not exist.'}), 400

        # Save the resume file(s) to the resume folder
        for resume_file in request.files.getlist('resume'):
            resume_filename = resume_file.filename
            resume_path = os.path.join(resume_folder, resume_filename)
            resume_file.save(resume_path)

            # Associate the resume file with the job in the database
            new_resume = Resume(filename=resume_filename, job_id=job.id)
            db.session.add(new_resume)
            db.session.commit()

        return jsonify({'message': 'Resume(s) uploaded successfully.'}), 200
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400
"""
    
@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    data = request.form
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job exists in the database
        with app.app_context():
            job = Job.query.filter_by(role=role, jd=jd).first()
        if not job:
            return jsonify({'message': 'Specified job role or description does not exist.'}), 400

        # Save the resume file(s) to the resume folder
        for resume_file in request.files.getlist('resume'):
            if resume_file.filename == '':
                return jsonify({'message': 'No selected file'}), 400
            
            # Generate a unique filename
            resume_filename = secure_filename(resume_file.filename)
            # Save the resume file to the resume folder
            resume_path = os.path.join(resume_folder, resume_filename)
            resume_file.save(resume_path)

            # Associate the resume file with the job in the database
            new_resume = Resume(filename=resume_filename, job_id=job.id)
            try:
                db.session.add(new_resume)
                db.session.commit()
            except Exception as e:
                db.session.rollback()  # Roll back the transaction in case of an error
                return jsonify({'message': f'Error occurred while saving resume: {str(e)}'}), 500

        return jsonify({'message': 'Resume(s) uploaded successfully.'}), 200
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400


@app.route('/extract_resume_info_22', methods=['POST'])
def extract_resume_info():
    # Get job ID and folder containing resume PDFs from the request
    data = request.get_json()
    job_id = data.get('job_id')
    resumes_folder = data.get('resumes_folder')

    # Initialize an empty string to store extracted text from all resumes
    text_resume = ""

    # Iterate through each file in the resumes folder
    for filename in os.listdir(resumes_folder):
        if filename.endswith(".pdf"):  # Check if the file is a PDF
            file_path = os.path.join(resumes_folder, filename)  # Get the full file path
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
    message_resumefetch=[
            {"role": "system", "content":
             """You act like as ATS tool, where you get {text_resume}resume of candidate,You will get multiple resumes or single resume that will vary,each resume will be differentiated by "Text extracted from: {filename}",so from that resume
             extract the inforamtion like candiate name, date of birth,work experience in years , phone number ,address, email id , linkedin link, github link ,techincal skills, soft skills.
             IF total year of experience is not given , then you do analysis of total years the candiate did in diifferent company , and say total years of experince, not the company name details ,the extracted information should be in josn format like below example:
             IF any key values is not there , mentionis as "NIL", dont need explanation , just the json details like below
             {
                 "resume_details":{
                    "candiate_name":"KEERTHI",
                    "work_exp":"3 YEARS",
                    "phone_numner":"78787878787",
                    "address":"KAIALSH NAGAR TRICHY , TAMIL NADU",
                    "email_id":"KEERTHI@GMAIL.COM",
                    "linkedin_id":,
                    "github_id":,
                    "technical_skills":["PYTHON","DEVOPS","SQL","AI"],
                    "soft_skills":["GOOD COMMUNICATION","TEAM PLAYER"]
                    "date_of_birth":"04-09-1998",
                    "nationality":"Indian"
                    },
                {
                    "candiate_name":"kishore",
                    "work_exp":"1 YEARS",
                    "phone_numner":"345678983",
                    "address":"balaji street,kerala",
                    "email_id":"kishore@GMAIL.COM",
                    "linkedin_id":"https://linkedin.com/kishore,
                    "github_id":,
                    "technical_skills":["c++","springboot","JAVA","REACT"],
                    "soft_skills":["COMMUNICATION","CRITICAL THINKER"]
                    "date_of_birth":"20-11-2000",
                    "nationality":"Indian"
                    }

             } """
},
{"role": "user", "content":f"use the {text_resume} resume and give the details as per instructed"}

        ]


    client = OpenAI()
    # Set up OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY")

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=message_resumefetch,
        
        max_tokens=1000
        
    )
    response = dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")
    # Remove extra spaces
    response_data = ' '.join(response_data.split())
    print(response_data)

    # Parse the JSON data containing extracted details
    extracted_info = json.loads(response_data)

    # Iterate through each resume detail extracted by OpenAI and save it to the database
    for resume_detail in extracted_info['resume_details']:
        extracted_record = ExtractedInfo(
            job_id=job_id,
            resume_id=resume_detail['candiate_name'],  # Use candidate name as resume ID
            name=resume_detail.get('candiate_name', 'NIL'),
            total_experience=resume_detail.get('work_exp', 'NIL'),
            phone_number=resume_detail.get('phone_numner', 'NIL'),
            address=resume_detail.get('address', 'NIL'),
            linkedin_id=resume_detail.get('linkedin_id', 'NIL'),
            github_id=resume_detail.get('github_id', 'NIL'),
            nationality=resume_detail.get('nationality', 'NIL'),
            tech_skill=resume_detail.get('technical_skills', []),
            behaviour_skill=resume_detail.get('soft_skills', [])
        )
        db.session.add(extracted_record)

    # Commit changes to the database
    db.session.commit()

    return jsonify({'message': 'Information extracted and saved successfully.'}), 200


if __name__ == '__main__':
    # Create the database tables
    with app.app_context():
        db.create_all()
    app.run(debug=True)
