from flask import Blueprint, request, jsonify
from .config import JD_FOLDER
from .models import Job, ExtractedInfo, ResumeScore, Resume
from . import db
import os
import PyPDF2

job_bp = Blueprint('job', __name__)

# Main functionality API


@job_bp.route('/Manual_upload_job', methods=['POST'])
def Manual_upload_job():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if not role or not jd:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

    # Check if the job already exists
    existing_job = Job.query.filter_by(role=role, jd=jd).first()
    if existing_job:
        return jsonify({'message': 'Job JD already exists.'}), 400

    # Save the job to the database
    new_job = Job(role=role, jd=jd)
    db.session.add(new_job)
    db.session.commit()
    return jsonify({'message': 'Job uploaded successfully.'}), 200


@job_bp.route('/file_upload_jd', methods=['POST'])
def file_upload_jd():
    if 'role' not in request.form or 'jd_file' not in request.files:
        return jsonify({'error': 'Role and JD file are required.'}), 400

    role = request.form['role']
    jd_file = request.files['jd_file']

    if jd_file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    upload_directory = JD_FOLDER
    jd_filename = os.path.join(upload_directory, jd_file.filename)
    jd_file.save(jd_filename)

    jd_content = ""
    with open(jd_filename, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            jd_content += page.extract_text()

    existing_job = Job.query.filter_by(role=role, jd=jd_content).first()
    if existing_job:
        return jsonify({'message': 'Job JD already exists.'}), 400

    new_job = Job(role=role, jd=jd_content)
    db.session.add(new_job)
    db.session.commit()

    return jsonify({'message': 'Job JD uploaded successfully.'}), 200


@job_bp.route('/export_jobs_json', methods=['GET'])
def export_jobs_json():
    jobs = Job.query.all()
    jobs_list = [{'id': job.id, 'role': job.role,
                  'jd': job.jd, 'active': job.active} for job in jobs]
    return jsonify(jobs_list)


@job_bp.route('/edit_job/<string:job_id>', methods=['PUT'])
def edit_job(job_id):
    new_role = request.json.get('role')
    new_jd = request.json.get('jd')
    new_status = request.json.get('status')

    if new_role is None and new_jd is None and new_status is None:
        return jsonify({'message': 'Role, job description, or status not provided'}), 400

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'message': 'Job not found'}), 404

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

    if not role or not id:
        return jsonify({'message': 'Role and ID are required fields.'}), 400

    job = Job.query.filter_by(role=role, id=id).first()
    if not job:
        return jsonify({'message': 'Job not found.'}), 404

    try:
        ExtractedInfo.query.filter_by(job_id=id).delete()
        ResumeScore.query.filter_by(job_id=id).delete()
        Resume.query.filter_by(job_id=id).delete()

        db.session.delete(job)
        db.session.commit()

        return jsonify({'message': f'Job with role "{role}" and ID "{id}" deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred while deleting the job: {str(e)}'}), 500


@job_bp.route('/jobs/<string:job_id>', methods=['GET'])
def get_job_details(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    job_details = {
        'job_id': job.id,
        'role': job.role,
        'jd': job.jd
    }
    return jsonify({'job_details': job_details}), 200
