from flask import Flask
from openai import OpenAI
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
from job_routes import job_bp 
from resume_routes import ats_bp
from assessment_generating_routes import assessment_bp
from question_management_routes import question_management_bp
from response_evaluate_routes import response_evaluate_bp
##
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
#from utils import *
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

####

app = Flask(__name__)
CORS(app)

client = OpenAI()
# Set up OpenAI API key
client.api_keyapi_key = os.getenv("OPENAI_API_KEY")

current_directory=os.getcwd()
# Create the folder to store resume  if it doesn't exist
resume_folder=os.path.join(current_directory,"Resume_folder_final")
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
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(db_folder, "records.db")}'

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobs.db'
db = SQLAlchemy(app)

# Register the blueprint

# JOB related API'S
app.register_blueprint(job_bp, url_prefix='/job')

#RESUME related API'S( UPLOAD, FIND DETAILS, SKILLS AND SCORE)
app.register_blueprint(ats_bp, url_prefix='/ats')

# Assessment generation apis
app.register_blueprint(assessment_bp, url_prefix='/assessment')

# CRUD operation on generated questions apis
app.register_blueprint(question_management_bp, url_prefix='/question_management')

# User response on assessment are stored and evaluated using these apis
app.register_blueprint(response_evaluate_bp, url_prefix='/response_evaluate')



if __name__ == '__main__':
    # Create the database tables
    with app.app_context():
        db.create_all()
    app.run(debug=True)