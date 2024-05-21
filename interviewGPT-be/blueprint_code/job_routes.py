from flask import Blueprint, request, jsonify
from utils import jd_folder
from models import db,Job,ExtractedInfo,ResumeScore,Resume
import PyPDF2
from PyPDF2 import PdfReader
import os
"""from models import Job, ExtractedInfo, ResumeScore, Resume
from app import *
from models import *
import os
import PyPDF2
from PyPDF2 import PdfReader
import json"""

job_bp = Blueprint('job', __name__)

##### Functionality API #####
### Main functionality api 
@job_bp.route('/Manual_upload_job', methods=['POST'])
def Manual_upload_job():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job already exists
        with job_bp.app_context():
            existing_job = Job.query.filter_by(role=role, jd=jd).first()
        if existing_job:
            return jsonify({'message': 'Job JD already exists.'}), 400

        # Save the job to the database
        new_job = Job(role=role, jd=jd)
        with job_bp.app_context():
            db.session.add(new_job)
            db.session.commit()
        #return jsonify({'message': 'Job uploaded successfully.','timestamp': new_job.timestamp}), 200
        return jsonify({'message': 'Job uploaded successfully.'}), 200
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

@job_bp.route('/file_upload_jd', methods=['POST'])
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
@job_bp.route('/export_jobs_json', methods=['GET'])
#@token_required
def export_jobs_json():
    jobs = Job.query.all()
    jobs_list = [{'id': job.id, 'role': job.role, 'jd': job.jd,'active':job.active} for job in jobs]
    return jsonify(jobs_list)

#API to edit the jd, role and status of the job
@job_bp.route('/edit_job/<string:job_id>', methods=['PUT'])
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

@job_bp.route('/delete_job', methods=['POST'])
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
@job_bp.route('/jobs/<string:job_id>', methods=['GET'])
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