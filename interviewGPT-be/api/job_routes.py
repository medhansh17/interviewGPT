import os
import PyPDF2
from . import db
from .config import JD_FOLDER
from flask import Blueprint, request, jsonify
from .models import Job, ExtractedInfo, ResumeScore, Resume,User
from .auth import token_required

job_bp = Blueprint('job', __name__)

# Main functionality API


@job_bp.route('/manual_upload_job', methods=['POST'])
@token_required
def manual_upload_job(current_user):
    """
    Manually upload a job description (JD) and create a new job entry if it doesn't exist.
    """
    current_user_id = current_user.id
    
    if current_user.role.name == 'guest':
        job_count = Job.query.filter_by(user_id=current_user_id).count()
        if job_count >= 1:
            return jsonify({'message': 'Guest users can only upload one job description.'}), 403

    data = request.get_json()
    role = data.get('role')
    job_description = data.get('jd')

    if not role or not job_description:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

    # Check if the job already exists
    existing_job = Job.query.filter_by(role=role, jd=job_description,user_id=current_user_id).first()
    if existing_job:
        return jsonify({'message': 'Job JD already exists.'}), 400

    # Save the job to the database
    new_job = Job(role=role, jd=job_description,user_id=current_user_id)
    db.session.add(new_job)
    db.session.commit()

    return jsonify({'message': 'Job uploaded successfully.'}), 200


@job_bp.route('/file_upload_jd', methods=['POST'])
@token_required
def file_upload_job_description(current_user):
    """
    Upload a job description (JD) file and create a new job entry if it doesn't exist.
    """
    current_user_id = current_user.id()
    if not current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 401
    
    if current_user.role.name == 'guest':
        job_count = Job.query.filter_by(user_id=current_user_id).count()
        if job_count >= 1:
            return jsonify({'message': 'Guest users can only upload one job description.'}), 403

    if 'role' not in request.form or 'jd_file' not in request.files:
        return jsonify({'error': 'Role and JD file are required.'}), 400

    role = request.form['role']
    jd_file = request.files['jd_file']

    if jd_file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    upload_directory = JD_FOLDER
    jd_filename = os.path.join(upload_directory, jd_file.filename)
    jd_file.save(jd_filename)

    # Extract text from the PDF file
    jd_content = extract_text_from_pdf(jd_filename)

    # Check if the job already exists
    existing_job = Job.query.filter_by(role=role, jd=jd_content, user_id=current_user_id).first()
    if existing_job:
        return jsonify({'message': 'Job JD already exists.'}), 400

    # Create a new job entry
    new_job = Job(role=role, jd=jd_content, user_id=current_user_id)
    db.session.add(new_job)
    db.session.commit()

    return jsonify({'message': 'Job JD uploaded successfully.'}), 200


def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF file.

    :param file_path: Path to the PDF file
    :return: Extracted text
    """
    jd_content = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            jd_content += page.extract_text()
    return jd_content


@job_bp.route('/export_jobs_json', methods=['GET'])
@token_required
def export_jobs_as_json(current_user):
    """
    Fetch all jobs from the database for the current user and return them in JSON format.
    """
    current_user_id = current_user.id
    if not current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 401
    
    jobs = Job.query.filter_by(user_id=current_user_id).all()
    jobs_list = [
        {
            'id': job.id,
            'role': job.role,
            'jd': job.jd,
            'active': job.active
        }
        for job in jobs
    ]
    return jsonify(jobs_list)


@job_bp.route('/edit_job/<string:job_id>', methods=['PUT'])
@token_required
def edit_job(current_user, job_id):
    """
    Edit an existing job's details based on the provided job ID.
    """
    current_user_id = current_user.id
    if not current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 401

    new_role = request.json.get('role')
    new_jd = request.json.get('jd')
    new_status = request.json.get('active')

    # Check if at least one field to update is provided
    if new_role is None and new_jd is None and new_status is None:
        return jsonify({'message': 'Role, job description, or status not provided'}), 400

    job = Job.query.filter_by(id=job_id, user_id=current_user_id).first()
    if not job:
        return jsonify({'message': 'Job not found or Unauthorized'}), 404

    # Update the job fields if new values are provided
    if new_role:
        job.role = new_role
    if new_jd:
        job.jd = new_jd
    if new_status is not None:
        job.active = new_status
    
    db.session.commit()
    return jsonify({'message': 'Job details updated successfully'}), 200


@job_bp.route('/delete_job', methods=['POST'])
@token_required
def delete_job(current_user):
    """
    Delete a job and its related data based on the provided role and ID.
    """
    current_user_id = current_user.id
    if not current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 401

    data = request.get_json()
    role = data.get('role')
    job_id = data.get('id')

    if not role or not job_id:
        return jsonify({'message': 'Role and ID are required fields.'}), 400

    job = Job.query.filter_by(role=role, id=job_id, user_id=current_user_id).first()
    if not job:
        return jsonify({'message': 'Job not found or unauthorized'}), 404

    try:
        # Deleting the job will automatically delete related data due to cascade settings
        db.session.delete(job)
        db.session.commit()

        return jsonify({'message': f'Job with role "{role}" and ID "{job_id}" deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred while deleting the job: {str(e)}'}), 500


@job_bp.route('/jobs/<string:job_id>', methods=['GET'])
@token_required
def get_job_details(current_user, job_id):
    """
    Retrieve the details of a specific job based on the provided job ID.
    """
    current_user_id = current_user.id
    if not current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 401
    
    job = Job.query.filter_by(id=job_id, user_id=current_user_id).first()
    if not job:
        return jsonify({'error': 'Job not found or Unauthorized '}), 404

    job_details = {
        'job_id': job.id,
        'role': job.role,
        'jd': job.jd
    }
    
    return jsonify({'job_details': job_details}), 200
