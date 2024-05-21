from flask import Flask
from flask_cors import CORS
from job_routes import job_bp 
from resume_routes import ats_bp
from assessment_generating_routes import assessment_bp
from question_management_routes import question_management_bp
from response_evaluate_routes import response_evaluate_bp
from . import create_app

"""##
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
import uuid"""

####

app = create_app()
CORS(app)

# Define the maximum number of files allowed for upload
MAX_FILES = 5



# Register the blueprint
#, url_prefix='/job'
# JOB related API'S
app.register_blueprint(job_bp)

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
    
    app.run(debug=True)